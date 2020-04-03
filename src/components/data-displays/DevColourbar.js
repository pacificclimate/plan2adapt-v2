import React from 'react';
import { Row, Col } from 'react-bootstrap';
import T from '../../temporary/external-text';
import get from 'lodash/fp/get';
import styles from '../maps/NcwmsColourbar/NcwmsColourbar.module.css';
import InputRange from 'react-input-range';
import NcwmsColourbar from '../maps/NcwmsColourbar';
import {
  wmsAboveMaxColor,
  wmsBelowMinColor,
  wmsLogscale,
  wmsTicks,
} from '../maps/map-utils';


const getVariableConfig = (texts, variable, path) => {
  console.log('### getVariableConfig', texts, variable, path)
  return get(
    [get('representative.variable_id', variable), path],
    T.getRaw(texts, 'maps.displaySpec')
  );
}


export default class DevColourbar extends React.Component {
  static contextType = T.contextType;

  state = {
    // range: getVariableConfig(this.context, this.props.variable, 'range'),
    range: undefined,
  };

  componentDidMount() {
    const range = getVariableConfig(this.context, this.props.variable, 'range');
    console.log('### DevColourbar.componentDidMount', range)
    this.handleChangeRange(range);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // Reset state.range to the default for the variable.
    console.log('### DevColourbar.componentDidUpdate', prevProps, this.props)
    if (prevProps.variable !== this.props.variable) {
      const range = getVariableConfig(this.context, this.props.variable, 'range');
      console.log('### DevColourbar.componentDidUpdate', range)
      this.handleChangeRange(range);
    }
  }

  handleChangeSelection = (name, value) => this.setState({ [name]: value });
  handleChangeRange = this.handleChangeSelection.bind(this, 'range');

  getConfig = path => T.get(this.context, path, {}, 'raw');
  getUnits = variableSpec =>
    get(
      [get('variable_id', variableSpec), 'units'],
      this.getConfig('variables')
    );

  render() {
    if (!this.props.variable) {
      return null;
    }
    if (!this.state.range) {
      return null;
    }
    console.log('### DevColourbar.render: props', this.props)
    const variableSpec = this.props.variable.representative;
    const displaySpec = T.get(this.context, 'maps.displaySpec', {}, 'raw');
    console.log('### DevColourbar.render: displaySpec', displaySpec)
    const rangeConfig =
      getVariableConfig(this.context, this.props.variable, 'range');
    const belowMinColor = wmsBelowMinColor(displaySpec, variableSpec);
    const aboveMaxColor = wmsAboveMaxColor(displaySpec, variableSpec);
    const logscale = wmsLogscale(displaySpec, variableSpec);
    const ticks = wmsTicks(displaySpec, variableSpec);
    console.log('### DevColourbar.render: belowMinColor', belowMinColor)
    console.log('### DevColourbar.render: aboveMaxColor', aboveMaxColor)
    const length = this.getConfig('colourScale.length');
    const breadth = this.getConfig('colourScale.breadth');
    return (
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
            breadth={breadth}
            length={length}
            range={this.state.range}
            logscale={logscale}
            belowMinColor={belowMinColor}
            aboveMaxColor={aboveMaxColor}
            ticks={ticks}
          />
          <T
            path={'colourScale.note'}
            placeholder={null}
            className={styles.note}
          />
        </Col>
      </Row>
    );
  }
}