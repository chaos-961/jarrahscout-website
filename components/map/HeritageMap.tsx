'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import maplibregl, { type LngLatBoundsLike, type Map as MapLibreMap } from 'maplibre-gl';
import Supercluster, { type ClusterFeature, type PointFeature } from 'supercluster';
import { AnimatePresence, motion } from 'framer-motion';
import 'maplibre-gl/dist/maplibre-gl.css';

import { applyHeritageStyle, BASEMAP_STYLE_URL, MAP_ATTRIBUTION } from '@/lib/map-style';
import type { ScoutEvent } from '@/lib/types';
import { ClusterPin, EventPin } from './ScoutMarker';

/** The frame the map falls back to when a year has nothing to show. */
const LEBANON_BOUNDS: LngLatBoundsLike = [
  [35.05, 33.03],
  [36.65, 34.7],
];

interface ClusterProps {
  cluster: true;
  cluster_id: number;
  point_count: number;
}
interface PointProps {
  cluster?: false;
  eventId: string;
}

interface ViewState {
  bbox: [number, number, number, number];
  zoom: number;
}

interface HeritageMapProps {
  events: ScoutEvent[];
  selectedId: string | null;
  onSelect: (event: ScoutEvent) => void;
  /** Desktop panel steals the right third, so framing has to allow for it. */
  panelOpen: boolean;
  /** True while the year is being scrubbed: hold the framing until it settles. */
  frozen: boolean;
}

/**
 * Puts a React subtree inside a real MapLibre marker.
 *
 * The marker owns positioning (MapLibre reprojects it every frame for free) and
 * React owns the contents, which is what lets Framer Motion animate pins in and
 * out. AnimatePresence keeps this component mounted until the exit animation
 * finishes, so the marker is not torn out from under the animation.
 */
function MapMarker({
  map,
  lng,
  lat,
  anchor,
  children,
}: {
  map: MapLibreMap;
  lng: number;
  lat: number;
  anchor: 'bottom' | 'center';
  children: React.ReactNode;
}) {
  const [el] = useState(() => {
    const node = document.createElement('div');
    node.style.willChange = 'transform';
    return node;
  });

  useEffect(() => {
    const marker = new maplibregl.Marker({ element: el, anchor }).setLngLat([lng, lat]).addTo(map);
    return () => {
      marker.remove();
    };
  }, [map, el, lng, lat, anchor]);

  return createPortal(children, el);
}

export default function HeritageMap({
  events,
  selectedId,
  onSelect,
  panelOpen,
  frozen,
}: HeritageMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [map, setMap] = useState<MapLibreMap | null>(null);
  const [view, setView] = useState<ViewState | null>(null);

  /* Framing has to clear the panel on desktop and the sheet on mobile. */
  const computePadding = useCallback(() => {
    if (typeof window === 'undefined') return { top: 64, bottom: 64, left: 48, right: 48 };
    const desktop = window.innerWidth >= 1024;
    return {
      top: desktop ? 72 : 52,
      bottom: panelOpen && !desktop ? Math.round(window.innerHeight * 0.5) : 72,
      left: desktop ? 72 : 40,
      right: panelOpen && desktop ? 500 : desktop ? 72 : 40,
    };
  }, [panelOpen]);

  /* ------------------------------------------------------------ map setup */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const instance = new maplibregl.Map({
      container: containerRef.current,
      style: BASEMAP_STYLE_URL,
      bounds: LEBANON_BOUNDS,
      fitBoundsOptions: { padding: 48 },
      minZoom: 6,
      maxZoom: 17,
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
      // Keeps the wheel from hijacking page scroll on the way past the hero.
      scrollZoom: { around: 'center' },
    });

    instance.touchZoomRotate.disableRotation();
    instance.addControl(
      new maplibregl.AttributionControl({ compact: true, customAttribution: MAP_ATTRIBUTION }),
      'bottom-right',
    );
    instance.addControl(
      new maplibregl.NavigationControl({ showCompass: false, visualizePitch: false }),
      'bottom-right',
    );

    const syncView = () => {
      const b = instance.getBounds();
      setView({
        bbox: [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()],
        zoom: instance.getZoom(),
      });
    };

    /* Pins depend on the style being parsed, not on tiles having painted, so
       hook style readiness rather than 'load'. 'load' additionally waits for a
       rendered frame, which never arrives in a backgrounded tab. */
    let initialised = false;
    const onStyleReady = () => {
      // isStyleLoaded() also waits on tile fetches, which are driven by the
      // render loop. The parsed layer list is the real precondition here.
      if (initialised || !instance.getStyle()?.layers?.length) return;
      initialised = true;
      applyHeritageStyle(instance);
      syncView();
      setMap(instance);
    };

    instance.on('styledata', onStyleReady);
    instance.on('load', onStyleReady);
    instance.on('moveend', syncView);
    instance.on('zoomend', syncView);

    mapRef.current = instance;

    const ro = new ResizeObserver(() => instance.resize());
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      instance.remove();
      mapRef.current = null;
      setMap(null);
    };
  }, []);

  /* --------------------------------------------------- reframe on year change */
  useEffect(() => {
    if (!map) return;
    // Refitting on every year the finger passes over would be a lurching mess.
    if (frozen) return;
    const padding = computePadding();

    if (events.length === 0) {
      map.fitBounds(LEBANON_BOUNDS, { padding, duration: 1300, maxZoom: 10.5 });
      return;
    }

    if (events.length === 1) {
      map.easeTo({
        center: [events[0].lng, events[0].lat],
        zoom: 12.4,
        duration: 1300,
        padding,
      });
      return;
    }

    const bounds = new maplibregl.LngLatBounds();
    for (const e of events) bounds.extend([e.lng, e.lat]);
    map.fitBounds(bounds, { padding, duration: 1300, maxZoom: 12.8 });
  }, [map, events, computePadding, frozen]);

  /* ------------------------------------------------------------- clustering */
  const index = useMemo(() => {
    const sc = new Supercluster<PointProps, ClusterProps>({
      radius: 58,
      maxZoom: 15,
      minPoints: 2,
    });
    sc.load(
      events.map((e) => ({
        type: 'Feature' as const,
        properties: { eventId: e.id },
        geometry: { type: 'Point' as const, coordinates: [e.lng, e.lat] },
      })),
    );
    return sc;
  }, [events]);

  const byId = useMemo(() => new Map(events.map((e) => [e.id, e])), [events]);

  const clusters = useMemo(() => {
    if (!view) return [];
    return index.getClusters(view.bbox, Math.round(view.zoom));
  }, [index, view]);

  const expandCluster = useCallback(
    (clusterId: number, lng: number, lat: number) => {
      if (!map) return;
      const zoom = Math.min(index.getClusterExpansionZoom(clusterId), 16);
      map.easeTo({ center: [lng, lat], zoom, duration: 700 });
    },
    [map, index],
  );

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" aria-label="Map of scout events" role="application" />

      {map && (
        <AnimatePresence>
          {clusters.map((feature, i) => {
            const [lng, lat] = feature.geometry.coordinates;
            const delay = Math.min(i * 0.045, 0.45);

            if ('cluster' in feature.properties && feature.properties.cluster) {
              const c = feature as ClusterFeature<ClusterProps>;
              return (
                <MapMarker key={`c-${c.properties.cluster_id}`} map={map} lng={lng} lat={lat} anchor="center">
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, scale: 0.4 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.4 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 26, delay }}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => expandCluster(c.properties.cluster_id, lng, lat)}
                    className="block cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
                    aria-label={`${c.properties.point_count} events here, zoom in`}
                  >
                    <ClusterPin count={c.properties.point_count} />
                  </motion.button>
                </MapMarker>
              );
            }

            const point = feature as PointFeature<PointProps>;
            const event = byId.get(point.properties.eventId);
            if (!event) return null;
            const selected = event.id === selectedId;

            return (
              <MapMarker key={event.id} map={map} lng={lng} lat={lat} anchor="bottom">
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.3, y: -14 }}
                  animate={{ opacity: 1, scale: selected ? 1.14 : 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.3, y: -10 }}
                  transition={{ type: 'spring', stiffness: 460, damping: 24, delay }}
                  whileHover={{ scale: selected ? 1.18 : 1.09 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSelect(event)}
                  className="block cursor-pointer drop-shadow-[0_3px_6px_rgba(30,28,23,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                  style={{ zIndex: selected ? 20 : 10 }}
                  aria-label={`${event.title}, ${event.locationName}`}
                >
                  <EventPin selected={selected} />
                </motion.button>
              </MapMarker>
            );
          })}
        </AnimatePresence>
      )}

      {/* Paper wash: pulls the basemap toward the page palette. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-paper-100/45 via-transparent to-paper-100/35" />
    </div>
  );
}
