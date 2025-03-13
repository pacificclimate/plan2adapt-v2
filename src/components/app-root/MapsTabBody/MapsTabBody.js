// This component creates the content of the Maps tab.
// It is responsible for
//  - Filtering out unsettled props (options from App)
//  - Layout and formatting
//  - Marshalling data for subsidiary components
//  - Coordinating the common viewport shared by the two maps
//  - Managing the bounds vs the viewport (see notes below)
//
// This component renders two `DataMap`s, one with a baseline climate layer
// and one with a user-selected climate layer.
//
// Map viewports are coordinated. That is, when one map's viewport is changed
// (panned, zoomed), the other map's viewport is set to the same value.
//
// When a new region is selected, the map viewport is set to the bounds of the
// new region. Thereafter the user can pan and zoom as usual.
//
// Note on viewport coordination.
//
// We pass in a handler as prop `onViewportChanged` to each `DataMap`.
// It is is called when a change of viewport (pan, zoom) is complete, and does
// not fire continuously during such changes, as `onViewportChange` (no "d")
// does.
//
// User experience would be smoother if we used the callback `onViewportChange`,
// but viewport change events are generated at a very high rate during panning,
// and this swamps the UI. (This may also be because there is
// some kind of compounding of events between the two maps. Debugging
// code (now removed) showed that even after a single change to the
// viewport (`state.viewport`), the second map calls back with a slightly
// different viewport, which then updates the first map. Ick.)
//
// Change events can easily be throttled (use `_.throttle`), but a wait time
// of at least 100 ms is required to prevent event swamping. That leads to
// jerky, laggy tracking of one viewport by the other. It was judged
// a better user experience simply to have the other viewport updated once
// at the end of changing.
//
// Note on map viewport vs bounds.
//
// React Leaflet `MapContainer` components accept `center` and `zoom` props, and `bounds` props.
// *Most of the time*, `bounds` supersedes `center` and `zoom`; the viewport change
// caused by setting a `bounds` value is communicated via the `onChangeViewport`
// callback. Unfortunately, it is not quite consistent, causing buggy behaviour
// in our maps. Therefore we have to manage bounds and viewport (center & zoom) on our own.
//
// This code passes *only* the center and zoom props to the maps, and manages the
// coordination between bounds and viewport itself. In particular, a defined
// value for `state.bounds` causes this component to update `state.viewport.center`
// and `state.viewport.zoom` from that value accordingly (and hence re-render), then reset `bounds` to
// undefined.
//
// `state.viewport.center` and state.viewport.zoom are the sole sources of truth. `state.bounds` is a transient
// value that mediates between the *intention* to update the viewport according
// to some bounds and the *availability* of the map instance, which is required to
// convert bounds to a viewport for a given map. Map instances are not always
// available when bounds conversions are needed, hence this rather complicated
// arrangement with transient `state.bounds` values.
//
// Note on map instances.
//
// In order to do a couple of key operations, namely bounds conversions and map
// refreshes, we need to access the underlying Leaflet map object.
// We do that with React Leaflet's `useMap` hook in a functional component (`MapInstanceProvider`).
// This hook provides the baseline and projected map instances,
// which are then stored in the state of the parent component.
//
// Note on size changes.
//
// When a React Bootstrap tab is deselected, its contents lose dimension.
// In this tab (Maps), that causes Leaflet to get confused: When the Maps tab is
// deselected, if map updates are required (e.g., by change of variable
// selection), the maps look and behave weirdly when the Maps tab is selected
// again.
//
// There are several possible approaches to this problem, but the one that so
// far has yielded the best results is to mount and unmount the map components
// with the `mountOnEnter` and `unmountOnExit` props of the `Tab` component in `App.js`.
// This ensures that the maps are re-rendered correctly when the tab is reselected.
// Size changes to maps from window resizing are handled by invalidating the map size
// in MapInstanceProvider.

import PropTypes from "prop-types";
import React from "react";
import { Col, Row } from "react-bootstrap";
import Loader from "../../misc/Loader";
import mapValues from "lodash/fp/mapValues";
import merge from "lodash/fp/merge";
import isEqual from "lodash/fp/isEqual";
import T from "../../../temporary/external-text";
import DataMap from "../../maps/DataMap";
import {
  BCBaseMap,
  SetView,
  callbackOnMapEvents,
} from "pcic-react-leaflet-components";
import NcwmsColourbar from "../../maps/NcwmsColourbar";
import {
  getWmsLogscale,
  regionBounds,
  boundsToViewport,
} from "../../maps/map-utils";
import styles from "../../maps/NcwmsColourbar/NcwmsColourbar.module.css";
import { getVariableInfo } from "../../../utils/variables-and-units";
import Button from "react-bootstrap/Button";
import StaticControl from "../../maps/StaticControl";
import { allDefined } from "../../../utils/lodash-fp-extras";
import { collectionToCanonicalUnitsSpecs } from "../../../utils/units";
import { seasonIndexToPeriod } from "../../../utils/percentile-anomaly";
import { useMap } from "react-leaflet";

// Component to provide map instances using the useMap hook
const MapInstanceProvider = ({ setMapInstance }) => {
  const map = useMap();
  React.useEffect(() => {
    if (map && map.invalidateSize) {
      map.invalidateSize();
    }
    setMapInstance(map);
  }, [map, setMapInstance]);
  return null;
};

export default class MapsTabBody extends React.PureComponent {
  static contextType = T.contextType;
  getConfig = (path) => T.get(this.context, path, {}, "raw");

  static propTypes = {
    regionOpt: PropTypes.string,
    baselineTimePeriod: PropTypes.object,
    futureTimePeriodOpt: PropTypes.object,
    seasonOpt: PropTypes.number,
    variableOpt: PropTypes.object,
    metadata: PropTypes.array,
  };

  state = {
    prevPropsRegionOpt: undefined,
    viewport: BCBaseMap.initialViewport,
    popup: {
      isOpen: false,
    },
    resizeCount: 0,
    baselineMapInstance: null,
    projectedMapInstance: null,
  };

  setBaselineMapInstance = (mapInstance) => {
    if (!this.state.baselineMapInstance) {
      this.setState({ baselineMapInstance: mapInstance }, () => {
        if (this.state.bounds) {
          this.updateViewportFromBounds(this.state.bounds);
        }
      });
    }
  };

  setProjectedMapInstance = (mapInstance) => {
    if (!this.state.projectedMapInstance) {
      this.setState({ projectedMapInstance: mapInstance }, () => {
        if (this.state.bounds) {
          this.updateViewportFromBounds(this.state.bounds);
        }
      });
    }
  };
  static getDerivedStateFromProps(props, state) {
    // Any time the current region changes, reset the bounds to the
    // bounding box of the region. It would be better to set `state.viewport`
    // directly here, but because this is a static method, we cannot access the
    // map ref required for that conversion. Therefore we store the bounds in
    // state and a different lifecycle method is responsible for updating the
    // viewport from it.
    if (props.regionOpt !== state.prevPropsRegionOpt) {
      const newState = {
        prevPropsRegionOpt: props.regionOpt,
        bounds: regionBounds(props.regionOpt.value),
      };
      return newState;
    }
    return null;
  }

  componentDidMount() {
    this.updateViewportFromBounds(this.state.bounds);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.updateViewportFromBounds(this.state.bounds);
    if (
      prevProps.regionOpt !== this.props.regionOpt &&
      this.state.baselineMapInstance
    ) {
      this.zoomToRegion(); // Zoom to the new region when selected
    }
  }

  updateViewportFromBounds = (bounds) => {
    if (bounds && this.state.baselineMapInstance) {
      this.setState({
        viewport: boundsToViewport(this.state.baselineMapInstance, bounds),
        bounds: undefined,
      });
    }
  };

  handleChangeSimple = (name, value) => this.setState({ [name]: value });
  handleChangeViewport = (viewport) => {
    // The `onViewportChanged` callback fires several times for any given
    // viewport change (presumably because of the interaction between the two
    // maps). This filters out any unnecessary updates.
    const newViewport = {
      center: viewport.getCenter(),
      zoom: viewport.getZoom(),
    };
    if (!isEqual(newViewport, this.state.viewport)) {
      this.setState({ viewport: newViewport });
    }
  };

  zoomToRegion = () => {
    this.setState({
      viewport: boundsToViewport(
        this.state.baselineMapInstance,
        regionBounds(this.props.regionOpt.value),
      ),
    });
  };

  render() {
    if (
      !allDefined(
        [
          "regionOpt",
          "baselineTimePeriod",
          "futureTimePeriodOpt",
          "variableOpt",
          "seasonOpt",
        ],
        this.props,
      )
    ) {
      console.log("### MapsTabBody: unsettled props", this.props);
      return <Loader loading={true} />;
    }

    const region = this.props.regionOpt.value;
    const futureTimePeriod =
      this.props.futureTimePeriodOpt.value.representative;
    const baselineTimePeriod = this.props.baselineTimePeriod;
    const season = this.props.seasonOpt.value;
    const variable = this.props.variableOpt.value;

    const variableRep = variable.representative;
    const variableId = variableRep.variable_id;

    const mapsConfig = this.getConfig("tabs.maps.config");
    const seasonId = seasonIndexToPeriod(season);
    const mapsVariableConfigForTimescale = mapValues((value) =>
      value.seasons ? merge(value, value.seasons[seasonId]) : value,
    )(mapsConfig.variables);
    const variableConfig = merge(
      this.getConfig("variables"),
      mapsVariableConfigForTimescale,
    );

    const logscale = getWmsLogscale(variableConfig, variableId);

    const unitsSpecs = collectionToCanonicalUnitsSpecs(this.getConfig("units"));

    const variableInfo = getVariableInfo(
      unitsSpecs,
      variableConfig,
      variableId,
      "absolute",
    );

    const zoomButton = (
      <StaticControl position="topright">
        <Button
          variant="outline-primary"
          size={"sm"}
          onClick={this.zoomToRegion}
          style={{ zIndex: 99999 }}
        >
          Zoom to region
        </Button>
      </StaticControl>
    );
    const ViewportUpdater = callbackOnMapEvents(
      ["moveend", "zoomend"],
      this.handleChangeViewport,
    );

    return (
      <div>
        <Row>
          <Col lg={12}>
            <NcwmsColourbar
              breadth={20}
              length={80}
              heading={
                <T
                  path="tabs.maps.colourScale.label"
                  data={variableInfo}
                  placeholder={null}
                  className={styles.label}
                />
              }
              note={
                <T
                  path={"tabs.maps.colourScale.note"}
                  placeholder={null}
                  className={styles.note}
                  data={{ logscale }}
                />
              }
              variableSpec={variableRep}
              displaySpec={variableConfig}
            />
          </Col>
        </Row>
        <Row>
          <Col lg={6}>
            <T
              path="tabs.maps.historical.title"
              data={{
                start_date: this.props.baselineTimePeriod.start_date,
                end_date: this.props.baselineTimePeriod.end_date,
              }}
            />
            <DataMap
              id={"historical"}
              minZoom={mapsConfig.minZoom}
              maxZoom={mapsConfig.maxZoom}
              maxBounds={mapsConfig.maxBounds}
              zoom={this.state.viewport.zoom}
              center={this.state.viewport.center}
              onViewportChanged={this.handleChangeViewport}
              popup={this.state.popup}
              onPopupChange={this.handleChangePopup}
              region={region}
              season={season}
              variable={variable}
              timePeriod={baselineTimePeriod}
              metadata={this.props.metadata}
              variableConfig={variableConfig}
              unitsSpecs={unitsSpecs}
              baseMapTilesUrl={window.env.REACT_APP_BC_BASE_MAP_TILES_URL}
            >
              <MapInstanceProvider
                setMapInstance={this.setBaselineMapInstance}
              />
              {zoomButton}
              <SetView view={this.state.viewport} />
              <ViewportUpdater />
            </DataMap>
          </Col>
          <Col lg={6}>
            <T
              path="tabs.maps.projected.title"
              data={{
                start_date: futureTimePeriod.start_date,
                end_date: futureTimePeriod.end_date,
              }}
            />
            <DataMap
              id={"projected"}
              minZoom={mapsConfig.minZoom}
              maxZoom={mapsConfig.maxZoom}
              maxBounds={mapsConfig.maxBounds}
              zoom={this.state.viewport.zoom}
              center={this.state.viewport.center}
              onViewportChanged={this.handleChangeViewport}
              popup={this.state.popup}
              onPopupChange={this.handleChangePopup}
              region={region}
              season={season}
              variable={variable}
              timePeriod={futureTimePeriod}
              metadata={this.props.metadata}
              variableConfig={variableConfig}
              unitsSpecs={unitsSpecs}
              baseMapTilesUrl={window.env.REACT_APP_YNWT_BASE_MAP_TILES_URL}
            >
              <MapInstanceProvider
                setMapInstance={this.setProjectedMapInstance}
              />
              {zoomButton}
              <SetView view={this.state.viewport} />
              <ViewportUpdater />
            </DataMap>
          </Col>
        </Row>
      </div>
    );
  }
}
