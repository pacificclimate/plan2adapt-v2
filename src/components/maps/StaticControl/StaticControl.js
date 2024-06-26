import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import './StaticControl.css';

const StaticControl = ({ position, style, children }) => {
  const map = useMap();

  useEffect(() => {
    const container = L.DomUtil.create('div', 'StaticControl leaflet-control');
    Object.assign(container.style, style);
    const root = createRoot(container);
    root.render(children);

    const control = L.control({ position });
    control.onAdd = () => container;

    control.addTo(map);

    return () => {
      control.remove();
      root.unmount();
    };
  }, [map, position, style, children]);

  return null;
};

export default StaticControl;
