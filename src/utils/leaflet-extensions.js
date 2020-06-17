import { Lethargy } from 'lethargy';
import L from 'leaflet';


// Stop inertial scrolling from interfering with scroll wheel zooming.
// See https://github.com/Leaflet/Leaflet/issues/4410#issuecomment-340905236
export const setLethargicScrolling = (...args) => {
  const lethargy = new Lethargy(...args);
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
}

