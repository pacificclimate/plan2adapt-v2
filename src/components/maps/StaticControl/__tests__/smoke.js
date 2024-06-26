import React from 'react';
import { createRoot } from 'react-dom/client';
import { MapContainer } from 'react-leaflet';
import StaticControl from '../';

it('renders without crashing', () => {
    const div = document.createElement('div');
    div.style.height = 100;
    const root = createRoot(div);
    root.render(
        <MapContainer>
            <StaticControl position='topright'>Test</StaticControl>
        </MapContainer>
    );
});
