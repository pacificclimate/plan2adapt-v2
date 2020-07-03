// This component creates the content of the Maps tab.
// It is responsible for
//  - Filtering out unsettled props (options from App)
//  - Layout and formatting
//  - Marshalling data for subsidiary components
//
// This component renders two `DataMap`s, one with a baseline climate layer
// and one with a user-selected climate layer. Map viewports are coordinated.
// That is, when one map's viewport is changed (panned, zoomed), the other
// map's viewport is set to the same value.
//
// Note on viewport coordination code.
//
// We pass in a simple handler as `onViewportChanged` to each `DataMap`.
// This callback is called when a change of viewport (pan, zoom) is
// complete, and does not fire continuously during such changes, as
// `onViewportChange` (no d) does.
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
// Note on size changes.
//
// When a React Bootstrap tab is deselected, its contents lose dimension.
// In this tab (Maps), that causes Leaflet to get confused: When the Maps tab is
// deselected, if map updates are required (e.g., by change of variable tab),
// the maps look and behave weirdly when the Maps tab is selected again.
//
// There are several possible approaches to this problem, but the one that so
// far has yielded the best results is to monitor the size of an (really any)
// element in the Maps tab and redraw the maps when the size changes. This may
// cause some unnecessary redraws when the window size is changed, but that
// is irrelevant, and may not even be causing Leaflet to do any actual work.
//
// To monitor element size, we use React Measure, which has a very convenient
// `onResize()` callback prop.


import PropTypes from 'prop-types';
import React from 'react';
import { Col, Row } from 'react-bootstrap';
import Loader from 'react-loader';
import Measure from 'react-measure';
import mapValues from 'lodash/fp/mapValues';
import merge from 'lodash/fp/merge';
import isEqual from 'lodash/fp/isEqual';
import T from '../../../temporary/external-text';
import DataMap from '../../maps/DataMap';
import BCBaseMap from '../../maps/BCBaseMap';
import NcwmsColourbar from '../../maps/NcwmsColourbar';
import { getWmsLogscale, regionBounds } from '../../maps/map-utils';
import styles from '../../maps/NcwmsColourbar/NcwmsColourbar.module.css';
import { getVariableInfo, } from '../../../utils/variables-and-units';
import Button from 'react-bootstrap/Button';
import StaticControl from '../../maps/StaticControl';
import { allDefined } from '../../../utils/lodash-fp-extras';
import { collectionToCanonicalUnitsSpecs } from '../../../utils/units';
import { seasonIndexToPeriod } from '../../../utils/percentile-anomaly';


const boundsToViewport = (map, bounds) => ({
  center: bounds.getCenter(),
  zoom: map.getBoundsZoom(bounds),
});


export default class MapsTabBody extends React.PureComponent {
  static contextType = T.contextType;
  getConfig = path => T.get(this.context, path, {}, 'raw');

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
    baselineMapRef: React.createRef(),
    projectedMapRef: React.createRef(),
  };

  static getDerivedStateFromProps(props, state) {
    // Any time the current region changes, reset the bounds to the
    // bounding box of the region. We are fortunate that when bounds change,
    // they override the current viewport, and vice-versa, eliminating any
    // need for logic around this on our part.
    // TODO: This does not take effect on first render because map refs are
    //  not yet defined. Set a bounds state, and do this dynamically when
    //  bounds change. cdM, cdu: bounds -> viewport
    if (props.regionOpt !== state.prevPropsRegionOpt && state.baselineMapRef.current) {
      const newState = {
        prevPropsRegionOpt: props.regionOpt,
        viewport: boundsToViewport(
          state.baselineMapRef.current.leafletElement,
          regionBounds(props.regionOpt.value)
        ),
      };
      console.log('### Maps: resetting bounds', newState)
      return newState;
    }
    return null;
  }

  handleChangeSelection = (name, value) => this.setState({ [name]: value });
  handleChangeViewport = viewport => {
    // When viewport is changed, remove bounds so that viewport takes
    // precedence. Don't update viewport more often than necessary.
    if (!isEqual(viewport, this.state.viewport)) {
      console.log('### Maps: handleChangeViewport', viewport)
      this.setState({ viewport });
    }
  }
  handleChangePopup = this.handleChangeSelection.bind(this, 'popup');

  // These items handle redrawing the map when the size changes.
  // The redraw depends on using a Leaflet "private" method `Map._onResize`,
  // which may be fragile, but Map doesn't expose a public `redraw` method.
  redrawMap = mapRef => {
    if (mapRef.current) {
      mapRef.current.leafletElement._onResize();
    }
  };
  handleResize = contentRect => {
    console.log('### Maps.handleResize, contentRect = ', contentRect)
    // Only redraw if content has non-zero size.
    if (contentRect.bounds.width !== 0) {
      console.log('### Maps.handleResize: redrawing')
      this.redrawMap(this.state.baselineMapRef);
      this.redrawMap(this.state.projectedMapRef);
    }
  };

  zoomToRegion = () => {
    this.setState({
      viewport: boundsToViewport(
        this.state.baselineMapRef.current.leafletElement,
        regionBounds(this.props.regionOpt.value),
      ),
    });
  };

  render() {
    if (!allDefined(
      [
        'regionOpt',
        'baselineTimePeriod',
        'futureTimePeriodOpt',
        'variableOpt',
        'seasonOpt',
      ],
      this.props
    )) {
      console.log('### MapsTabBody: unsettled props', this.props)
      return <Loader/>;
    }

    const region = this.props.regionOpt.value;
    const futureTimePeriod = this.props.futureTimePeriodOpt.value.representative;
    const baselineTimePeriod = this.props.baselineTimePeriod;
    const season = this.props.seasonOpt.value;
    const variable = this.props.variableOpt.value;

    const variableRep = variable.representative;
    const variableId = variableRep.variable_id;

    const mapsConfig = this.getConfig('tabs.maps.config');
    const seasonId = seasonIndexToPeriod(season);
    const mapsVariableConfigForTimescale = mapValues(
      value => value.seasons ? merge(value, value.seasons[seasonId]) : value
    )(mapsConfig.variables);
    const variableConfig = merge(
      this.getConfig('variables'),
      mapsVariableConfigForTimescale,
    );

    const logscale = getWmsLogscale(variableConfig, variableId);

    const unitsSpecs =
      collectionToCanonicalUnitsSpecs(this.getConfig('units'));

    const variableInfo = getVariableInfo(
      unitsSpecs, variableConfig, variableId, 'absolute'
    );

    const zoomButton = (
      <StaticControl position='topright'>
        <Button
          variant="outline-primary"
          size={'sm'}
          onClick={this.zoomToRegion}
          style={{ zIndex: 99999 }}
        >
          Zoom to region
        </Button>
      </StaticControl>
    );

    return (
      <Measure bounds onResize={this.handleResize}>
        {({ measureRef }) => (
          <div ref={measureRef}>
            <Row>
              <Col lg={2}>
                <Button onClick={this.handleResize}>Resize</Button>
              </Col>
              <Col lg={4}>
                bounds:
                <pre>{JSON.stringify(this.state.bounds, undefined, 2)}</pre>
              </Col>
              <Col lg={4}>
                viewport:
                <pre>{JSON.stringify(this.state.viewport, undefined, 2)}</pre>
              </Col>
            </Row>
            <Row>
              <Col lg={12}>
                <NcwmsColourbar
                  breadth={20}
                  length={80}
                  heading={<T
                    path='tabs.maps.colourScale.label'
                    data={variableInfo}
                    placeholder={null}
                    className={styles.label}
                  />}
                  note={<T
                    path={'tabs.maps.colourScale.note'}
                    placeholder={null}
                    className={styles.note}
                    data={{ logscale }}
                  />}
                  variableSpec={variableRep}
                  displaySpec={variableConfig}
                />
              </Col>
            </Row>
            <Row>
              <Col lg={6}>
                <T path='tabs.maps.historical.title' data={{
                  start_date: this.props.baselineTimePeriod.start_date,
                  end_date: this.props.baselineTimePeriod.end_date
                }}
                />
                <DataMap
                  id={'historical'}
                  mapRef={this.state.baselineMapRef}
                  viewport={this.state.viewport}
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
                >
                  {zoomButton}
                </DataMap>
              </Col>
              <Col lg={6}>
                <T path='tabs.maps.projected.title' data={{
                  start_date: futureTimePeriod.start_date,
                  end_date: futureTimePeriod.end_date
                }}/>
                <DataMap
                  id={'projected'}
                  mapRef={this.state.projectedMapRef}
                  viewport={this.state.viewport}
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
                >
                  {zoomButton}
                </DataMap>
              </Col>
            </Row>
          </div>
        )}
      </Measure>
    );
  }
}
