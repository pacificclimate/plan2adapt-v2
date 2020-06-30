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

import PropTypes from 'prop-types';
import React from 'react';
import { Row, Col } from 'react-bootstrap';
import Loader from 'react-loader';
import T from '../../../temporary/external-text';
import DataMap from '../../maps/DataMap';
import BCBaseMap from '../../maps/BCBaseMap';
import NcwmsColourbar from '../../maps/NcwmsColourbar';
import { regionBounds, wmsLogscale } from '../../maps/map-utils';
import styles from '../../maps/NcwmsColourbar/NcwmsColourbar.module.css';
import { getVariableInfo, } from '../../../utils/variables-and-units';
import Button from 'react-bootstrap/Button';
import StaticControl from '../../maps/StaticControl';
import { allDefined } from '../../../utils/lodash-fp-extras';


export default class MapsTabBody extends React.Component {
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
    bounds: undefined,
    viewport: BCBaseMap.initialViewport,
    popup: {
      isOpen: false,
    },
  };

  static getDerivedStateFromProps(props, state) {
    // Any time the current region changes, reset the bounds to the
    // bounding box of the region. We are fortunate that when bounds change,
    // they override the current viewport, and vice-versa, eliminating any
    // need for logic around this on our part.
    if (props.regionOpt !== state.prevPropsRegionOpt) {
      return {
        prevPropsRegionOpt: props.regionOpt,
        bounds: regionBounds(props.regionOpt.value),
      }
    }
    return null;
  }

  handleChangeSelection = (name, value) => this.setState({ [name]: value });
  handleChangeViewport = viewport => {
    // When viewport is changed, remove bounds so that viewport takes
    // precedence.
    this.setState({ bounds: undefined, viewport })
  }
  handleChangePopup = this.handleChangeSelection.bind(this, 'popup');

  zoomToRegion = () =>
    this.setState({ bounds: regionBounds(this.props.regionOpt.value) });

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
    console.log('### MapsTabBody: props', this.props)
    const region = this.props.regionOpt.value;
    const futureTimePeriod = this.props.futureTimePeriodOpt.value.representative;
    const baselineTimePeriod = this.props.baselineTimePeriod;
    const season = this.props.seasonOpt.value;
    const variable = this.props.variableOpt.value;

    const variableRep = variable.representative;
    const variableId = variableRep.variable_id;
    const variableConfig = this.getConfig('variables');
    const displaySpec = this.getConfig('tabs.maps.displaySpec');
    const logscale = wmsLogscale(displaySpec, variableRep);
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
      <React.Fragment>
        <Row>
          <Col lg={12}>
            <NcwmsColourbar
              breadth={20}
              length={80}
              heading={<T
                path='tabs.maps.colourScale.label'
                data={getVariableInfo(variableConfig, variableId, 'absolute')}
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
              displaySpec={displaySpec}
            />
          </Col>
        </Row>
        <Row>
          <Col lg={6}>
            <T path='tabs.maps.historical.title' data={{
              start_date: this.props.baselineTimePeriod.start_date,
              end_date: this.props.baselineTimePeriod.end_date
            }}/>
            <DataMap
              id={'historical'}
              bounds={this.state.bounds}
              viewport={this.state.viewport}
              onViewportChanged={this.handleChangeViewport}
              popup={this.state.popup}
              onPopupChange={this.handleChangePopup}
              region={region}
              season={season}
              variable={variable}
              timePeriod={baselineTimePeriod}
              metadata={this.props.metadata}
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
              bounds={this.state.bounds}
              viewport={this.state.viewport}
              onViewportChanged={this.handleChangeViewport}
              popup={this.state.popup}
              onPopupChange={this.handleChangePopup}
              region={region}
              season={season}
              variable={variable}
              timePeriod={futureTimePeriod}
              metadata={this.props.metadata}
            >
              {zoomButton}
            </DataMap>
          </Col>
        </Row>
      </React.Fragment>
    );
  }
}
