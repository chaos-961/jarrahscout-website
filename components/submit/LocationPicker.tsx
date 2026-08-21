'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl, { type Map as MapLibreMap, type Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { applyHeritageStyle, BASEMAP_STYLE_URL, MAP_ATTRIBUTION } from '@/lib/map-style';

interface LocationPickerProps {
  value: { lat: number; lng: number } | null;
  onChange: (coords: { lat: number; lng: number }) => void;
}

/** Same basemap as the hero, shrunk down: click or drag to drop the pin. */
export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const onChangeRef = useRef(onChange);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: BASEMAP_STYLE_URL,
      center: [35.62, 33.88],
      zoom: 8.2,
      minZoom: 6,
      maxZoom: 17,
      attributionControl: false,
      dragRotate: false,
    });

    map.touchZoomRotate.disableRotation();
    map.addControl(
      new maplibregl.AttributionControl({ compact: true, customAttribution: MAP_ATTRIBUTION }),
      'bottom-right',
    );
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

    let initialised = false;
    const onStyleReady = () => {
      if (initialised || !map.getStyle()?.layers?.length) return;
      initialised = true;
      applyHeritageStyle(map);
      setReady(true);
    };
    map.on('styledata', onStyleReady);
    map.on('load', onStyleReady);

    map.on('click', (e) => {
      onChangeRef.current({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    });

    mapRef.current = map;
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  /* Keep one marker in sync with the chosen coordinates. */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    if (!value) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }

    if (!markerRef.current) {
      const el = document.createElement('div');
      el.innerHTML = `
        <svg viewBox="0 0 40 50" width="34" height="42" aria-hidden="true">
          <path d="M20 46 13.2 30h13.6L20 46Z" fill="#1B4332"/>
          <circle cx="20" cy="19" r="15.4" fill="#1B4332" stroke="#C9A227" stroke-width="1.5"/>
          <circle cx="20" cy="19" r="4.6" fill="#FAF6EE"/>
        </svg>`;
      el.style.cursor = 'grab';
      markerRef.current = new maplibregl.Marker({ element: el, anchor: 'bottom', draggable: true })
        .setLngLat([value.lng, value.lat])
        .addTo(map);
      markerRef.current.on('dragend', () => {
        const p = markerRef.current?.getLngLat();
        if (p) onChangeRef.current({ lat: p.lat, lng: p.lng });
      });
    } else {
      markerRef.current.setLngLat([value.lng, value.lat]);
    }
  }, [value, ready]);

  return (
    <div>
      <div className="relative h-60 overflow-hidden rounded-xl border border-paper-300">
        <div ref={containerRef} className="h-full w-full" />
        {!ready && (
          <div className="absolute inset-0 overflow-hidden bg-paper-200">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-paper-50/60 to-transparent" />
          </div>
        )}
      </div>
      <p className="mt-2 font-body text-xs text-ink-faint">
        {value
          ? `Pin at ${value.lat.toFixed(4)}, ${value.lng.toFixed(4)}. Drag it to adjust.`
          : 'Click the map to drop a pin where this happened.'}
      </p>
    </div>
  );
}
