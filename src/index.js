import React from 'react';
import ReactDOM from 'react-dom';
import { Lethargy } from 'lethargy';
import L from 'leaflet';
import './index.css';
import App from './components/app-root/AppWrapper';
import * as serviceWorker from './serviceWorker';
import ExternalText from './temporary/external-text';
import { makeYamlLoader } from './utils/external-text';


// Stop inertial scrolling from interfering with scroll wheel zooming.
// See https://github.com/Leaflet/Leaflet/issues/4410#issuecomment-340905236
const lethargy = new Lethargy(7, 50, 0.05);
const isInertialScroll = (e) => lethargy.check(e) === false;
L.Map.ScrollWheelZoom.prototype._onWheelScroll = function (e) {
  L.DomEvent.stop(e);
  if (isInertialScroll(e)) {
    return;
  }

  this._delta += L.DomEvent.getWheelDelta(e);
  this._lastMousePos = this._map.mouseEventToContainerPoint(e);
  this._performZoom();
}

console.log('index.js: App', App)
console.log('index.js: ExternalText', ExternalText)

const loadTexts = makeYamlLoader(
  `${process.env.PUBLIC_URL}/${process.env.REACT_APP_EXTERNAL_TEXT}`
);

ReactDOM.render(
  (
    <ExternalText.Provider loadTexts={loadTexts}>
      <App/>
    </ExternalText.Provider>
  ),
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
