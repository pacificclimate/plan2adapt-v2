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
import BCBaseMap from '../BCBaseMap';
import NcwmsColourbar from '../NcwmsColourbar';
import { regionBounds, wmsLogscale } from '../map-utils';
import styles from '../NcwmsColourbar/NcwmsColourbar.module.css';
import { getVariableInfo, } from '../../../utils/variables-and-units';
import Button from 'react-bootstrap/Button';
import StaticControl from '../StaticControl';
import { allDefined } from '../../../utils/lodash-fp-extras';


export default class TwoDataMaps extends React.Component {
  static contextType = T.contextType;
  getConfig = path => T.get(this.context, path, {}, 'raw');

  static propTypes = {
    region: PropTypes.string,
    historicalTimePeriod: PropTypes.object,
    futureTimePeriod: PropTypes.object,
    season: PropTypes.number,
    variable: PropTypes.object,
    metadata: PropTypes.array,
  };

  state = {
    prevPropsRegion: undefined,
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
    if (props.region !== state.prevPropsRegion) {
      return {
        prevPropsRegion: props.region,
        bounds: regionBounds(props.region),
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
    this.setState({ bounds: regionBounds(this.props.region)});

  render() {
    if (!allDefined(
      [
        'region.geometry',
        'historicalTimePeriod.start_date',
        'historicalTimePeriod.end_date',
        'futureTimePeriod.start_date',
        'futureTimePeriod.end_date',
        'variable.representative',
        'season',
      ],
      this.props
    )) {
      console.log('### TwoDataMaps: unsettled props', this.props)
      return <Loader/>
    }
    console.log('### TwoDataMaps: props', this.props)
    const variableSpec = this.props.variable.representative;
    const variable = variableSpec.variable_id;
    const variableConfig = this.getConfig('variables');
    const displaySpec = this.getConfig('maps.displaySpec');
    const logscale = wmsLogscale(displaySpec, variableSpec);
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
                path='colourScale.label'
                data={getVariableInfo(variableConfig, variable, 'absolute')}
                placeholder={null}
                className={styles.label}
              />}
              note={<T
                path={'colourScale.note'}
                placeholder={null}
                className={styles.note}
                data={{ logscale }}
              />}
              variableSpec={variableSpec}
              displaySpec={displaySpec}
            />
          </Col>
        </Row>
        <Row>
          <Col lg={6}>
            <T path='maps.historical.title' data={{
              start_date: this.props.historicalTimePeriod.start_date,
              end_date: this.props.historicalTimePeriod.end_date
            }}/>
            <DataMap
              id={'historical'}
              bounds={this.state.bounds}
              viewport={this.state.viewport}
              onViewportChanged={this.handleChangeViewport}
              popup={this.state.popup}
              onPopupChange={this.handleChangePopup}
              region={this.props.region}
              season={this.props.season}
              variable={this.props.variable}
              timePeriod={this.props.historicalTimePeriod}
              metadata={this.props.metadata}
            >
              {zoomButton}
            </DataMap>
          </Col>
          <Col lg={6}>
            <T path='maps.projected.title' data={{
              start_date: this.props.futureTimePeriod.start_date,
              end_date: this.props.futureTimePeriod.end_date
            }}/>
            <DataMap
              id={'projected'}
              bounds={this.state.bounds}
              viewport={this.state.viewport}
              onViewportChanged={this.handleChangeViewport}
              popup={this.state.popup}
              onPopupChange={this.handleChangePopup}
              region={this.props.region}
              season={this.props.season}
              variable={this.props.variable}
              timePeriod={this.props.futureTimePeriod}
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
