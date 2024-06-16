import React from 'react';
import { createRoot } from 'react-dom/client';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import './StaticControl.css';

class StaticControl extends React.Component {
  createLeafletElement(props) {
    const leafletElement = L.control({ position: props.position });

    leafletElement.onAdd = map => {
      this.container = L.DomUtil.create(
        'div',
        'StaticControl leaflet-control'
      );
      Object.assign(this.container.style, props.style);
      this.root = createRoot(this.container);
      this.root.render(props.children);
      return this.container;
    };

    return leafletElement;
  }

  updateLeafletElement(prevProps, toProps) {
    if (prevProps.children !== toProps.children) {
      this.root.render(toProps.children);
    }
  }

  render() {
    return null;
  }
}

const StaticControlWithMap = (props) => {
  const map = useMap();
  return <StaticControl {...props} map={map} />;
};

export default StaticControlWithMap;
