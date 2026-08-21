'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import maplibregl, { type LngLatBoundsLike, type Map as MapLibreMap } from 'maplibre-gl';
import Supercluster, { type ClusterFeature, type PointFeature } from 'supercluster';
import { AnimatePresence, motion } from 'framer-motion';
import 'maplibre-gl/dist/maplibre-gl.css';

import { applyHeritageStyle, BASEMAP_STYLE_URL } from '@/lib/map-style';
import { lodForZoom } from '@/lib/images';
import type { ScoutEvent } from '@/lib/types';
import { ClusterPin, DotPin, PhotoMarker } from './MapPins';

/** The frame the map falls back to when a year has nothing to show. */
const LEBANON_BOUNDS: LngLatBoundsLike = [
  [35.1, 33.05],
  [36.45, 34.65],
];

/** Past this many pins on screen, drop the stagger so entry stays cheap. */
const STAGGER_CUTOFF = 40;

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
  panelOpen: boolean;
  /** True while the year is being scrubbed: hold the framing until it settles. */
  frozen: boolean;
}

/**
 * Puts a React subtree inside a real MapLibre marker.
 *
 * The marker owns positioning, which MapLibre reprojects natively every frame,
 * and React owns the contents. AnimatePresence keeps this mounted until the
 * exit finishes so the marker is not torn out from under the animation.
 */
function MapMarker({
  map,
  lng,
  lat,
  children,
}: {
  map: MapLibreMap;
  lng: number;
  lat: number;
  children: React.ReactNode;
}) {
  const [el] = useState(() => {
    const node = document.createElement('div');
    node.style.willChange = 'transform';
    return node;
  });

  useEffect(() => {
    const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat([lng, lat])
      .addTo(map);
    return () => {
      marker.remove();
    };
  }, [map, el, lng, lat]);

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

  const computePadding = useCallback(() => {
    if (typeof window === 'undefined') return { top: 48, bottom: 48, left: 48, right: 48 };
    const desktop = window.innerWidth >= 1024;
    return {
      top: desktop ? 72 : 52,
      bottom: panelOpen && !desktop ? Math.round(window.innerHeight * 0.45) : 72,
      left: desktop ? 64 : 32,
      right: panelOpen && desktop ? 500 : desktop ? 64 : 32,
    };
  }, [panelOpen]);

  /* ------------------------------------------------------------ map setup */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const instance = new maplibregl.Map({
      container: containerRef.current,
      style: BASEMAP_STYLE_URL,
      bounds: LEBANON_BOUNDS,
      fitBoundsOptions: { padding: 40 },
      minZoom: 6,
      maxZoom: 17,
      // The CARTO style carries its own OSM and CARTO credit. Adding a custom
      // one on top of it is what produced the doubled attribution line.
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
    });

    instance.touchZoomRotate.disableRotation();
    instance.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
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
      map.fitBounds(LEBANON_BOUNDS, { padding, duration: 1100, maxZoom: 10.5 });
      return;
    }

    if (events.length === 1) {
      map.easeTo({ center: [events[0].lng, events[0].lat], zoom: 12.6, duration: 1100, padding });
      return;
    }

    const bounds = new maplibregl.LngLatBounds();
    for (const e of events) bounds.extend([e.lng, e.lat]);
    map.fitBounds(bounds, { padding, duration: 1100, maxZoom: 13.2 });
  }, [map, events, computePadding, frozen]);

  /* ------------------------------------------------------------- clustering */
  const index = useMemo(() => {
    const sc = new Supercluster<PointProps, ClusterProps>({
      radius: 64,
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

  /* getClusters is bbox-limited, so anything off screen is never rendered and
     never requests a photo. That is the whole culling story. */
  const clusters = useMemo(() => {
    if (!view) return [];
    return index.getClusters(view.bbox, Math.round(view.zoom));
  }, [index, view]);

  const lod = useMemo(() => lodForZoom(view?.zoom ?? 7), [view?.zoom]);
  const stagger = clusters.length <= STAGGER_CUTOFF;

  const expandCluster = useCallback(
    (clusterId: number, lng: number, lat: number) => {
      if (!map) return;
      const zoom = Math.min(index.getClusterExpansionZoom(clusterId), 16);
      map.easeTo({ center: [lng, lat], zoom, duration: 600 });
    },
    [map, index],
  );

  return (
    <div className="relative h-full w-full bg-plum-950">
      <div
        ref={containerRef}
        className="h-full w-full"
        aria-label="Map of scout events"
        role="application"
      />

      {map && (
        <AnimatePresence>
          {clusters.map((feature, i) => {
            const [lng, lat] = feature.geometry.coordinates;
            const delay = stagger ? Math.min(i * 0.035, 0.4) : 0;
            const transition = stagger
              ? ({ type: 'spring' as const, stiffness: 460, damping: 28, delay })
              : ({ duration: 0.18, ease: 'easeOut' as const });

            if ('cluster' in feature.properties && feature.properties.cluster) {
              const c = feature as ClusterFeature<ClusterProps>;
              return (
                <MapMarker key={`c-${c.properties.cluster_id}`} map={map} lng={lng} lat={lat}>
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={transition}
                    whileHover={{ scale: 1.07 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => expandCluster(c.properties.cluster_id, lng, lat)}
                    className="group relative block translate-y-1/2 cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum-200"
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
              <MapMarker key={event.id} map={map} lng={lng} lat={lat}>
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: selected ? 1.08 : 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={transition}
                  whileHover={{ scale: selected ? 1.12 : 1.06 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onSelect(event)}
                  className="group block cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum-200"
                  style={{ zIndex: selected ? 20 : 10 }}
                  aria-label={`${event.title}, ${event.locationName}`}
                >
                  {lod ? (
                    <PhotoMarker event={event} lod={lod} selected={selected} />
                  ) : (
                    <span className="block translate-y-1/2">
                      <DotPin selected={selected} />
                    </span>
                  )}
                </motion.button>
              </MapMarker>
            );
          })}
        </AnimatePresence>
      )}

      {/* Vignette: settles the tile edges into the page. */}
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_120px_40px_rgba(21,9,32,0.7)]" />
    </div>
  );
}
