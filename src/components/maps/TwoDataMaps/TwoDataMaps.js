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
import get from 'lodash/fp/get';
import T from '../../../temporary/external-text';
import DataMap from '../../maps/DataMap';
import BCBaseMap from '../BCBaseMap';
import NcwmsColourbar from '../NcwmsColourbar';
import InputRange from 'react-input-range';
import styles from '../NcwmsColourbar/NcwmsColourbar.module.css';


const getVariableConfig = (texts, variable, path) =>
  get(
    [get('representative.variable_id', variable), path],
    T.getRaw(texts, 'maps.displaySpec')
  );


export default class TwoDataMaps extends React.Component {
  static contextType = T.contextType;

  static propTypes = {
    region: PropTypes.string,
    historicalTimePeriod: PropTypes.object,
    futureTimePeriod: PropTypes.object,
    season: PropTypes.number,
    variable: PropTypes.object,
    metadata: PropTypes.array,
  };

  state = {
    range: getVariableConfig(this.context, this.props.variable, 'range'),
    viewport: BCBaseMap.initialViewport,
    popup: {
      isOpen: false,
    },
  };


  // Updating the state in getDerivedStateFromProps is preferable, but we can't
  // access context there (at least I don't know how to do that) since it is
  // a static method. Therefore do it in componentDidUpdate.
  //
  // static getDerivedStateFromProps(props, state) {
  //   return null;
  //   // TODO: See if this can be done with memoization instead
  //   const range = getVariableConfig(this.context, props.variable, 'range');
  //   console.log('### TwoDataMaps.getDerivedStateFromProps: range', range)
  //   return {
  //     range,
  //   };
  // }
  //
  componentDidUpdate(prevProps, prevState, snapshot) {
    // Reset state.range to the default for the variable.
    if (prevProps.variable !== this.props.variable) {
      const range = getVariableConfig(this.context, this.props.variable, 'range');
      console.log('### TwoDataMaps.componentDidUpdate', range)
      this.handleChangeRange(range);
    }
  }

  handleChangeSelection = (name, value) => this.setState({ [name]: value });
  handleChangeRange = this.handleChangeSelection.bind(this, 'range');
  handleChangeViewport = this.handleChangeSelection.bind(this, 'viewport');
  handleChangePopup = this.handleChangeSelection.bind(this, 'popup');

  getConfig = path => T.get(this.context, path, {}, 'raw');
  getUnits = variableSpec =>
    get(
      [get('variable_id', variableSpec), 'units'],
      this.getConfig('variables')
    );

  render() {
    console.log('### TwoDataMaps.render')
    const rangeConfig =
      getVariableConfig(this.context, this.props.variable, 'range');
    const csLength = this.getConfig('colourScale.length');
    const csBreadth = this.getConfig('colourScale.breadth');
    const variableSpec = this.props.variable.representative;
    return (
      <React.Fragment>
        <Row>
          <Col lg={12}>
            <T
              path='colourScale.label'
              data={{
                variable: get('variable_name', variableSpec),
                units: this.getUnits(variableSpec)
              }}
              placeholder={null}
              className={styles.label}
            />
            <InputRange
              minValue={rangeConfig.min}
              maxValue={rangeConfig.max}
              step={rangeConfig.step}
              value={this.state.range}
              onChange={this.handleChangeRange}
            />
            <T
              path={'colourScale.rangeLabel'}
              placeholder={null}
              className={styles.note}
            />
            <NcwmsColourbar
              variableSpec={variableSpec}
              width={csBreadth}
              height={csLength}
              range={this.state.range}
            />
            <T
              path={'colourScale.note'}
              placeholder={null}
              className={styles.note}
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
              viewport={this.state.viewport}
              onViewportChanged={this.handleChangeViewport}
              popup={this.state.popup}
              onPopupChange={this.handleChangePopup}
              region={this.props.region}
              season={this.props.season}
              variable={this.props.variable}
              timePeriod={this.props.historicalTimePeriod}
              metadata={this.props.metadata}
              range={this.state.range}
            />
          </Col>
          <Col lg={6}>
            <T path='maps.projected.title' data={{
              start_date: this.props.futureTimePeriod.start_date,
              end_date: this.props.futureTimePeriod.end_date
            }}/>
            <DataMap
              id={'projected'}
              viewport={this.state.viewport}
              onViewportChanged={this.handleChangeViewport}
              popup={this.state.popup}
              onPopupChange={this.handleChangePopup}
              region={this.props.region}
              season={this.props.season}
              variable={this.props.variable}
              timePeriod={this.props.futureTimePeriod}
              metadata={this.props.metadata}
              range={this.state.range}
            />
          </Col>
        </Row>
      </React.Fragment>
    );
  }
}
