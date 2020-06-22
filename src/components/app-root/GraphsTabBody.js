// This component creates the content of the Graphs tab.
// It is responsible for
//  - Filtering out unsettled props (options from App)
//  - Layout and formatting
//  - Marshalling data for subsidiary components

import React from 'react';
import T from '../../temporary/external-text';
import { allDefined } from '../../utils/lodash-fp-extras';
import Loader from 'react-loader';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import get from 'lodash/fp/get';
import ChangeOverTimeGraph from '../graphs/ChangeOverTimeGraph';

export default class GraphsTabBody extends React.Component {
  static contextType = T.contextType;
  getConfig = path => T.get(this.context, path, {}, 'raw');

  static propTypes = {
    regionOpt: PropTypes.object,
    baselineTimePeriod: PropTypes.object,
    variableOpt: PropTypes.object,
    seasonOpt: PropTypes.object,
  };

  render() {
    if (!allDefined(
      [
        'regionOpt',
        'baselineTimePeriod',
        'variableOpt',
        'seasonOpt',
      ],
      this.props
    )) {
      console.log('### GraphsTabBody: unsettled props', this.props)
      return <Loader/>
    }

    const region = this.props.regionOpt.value;
    const baselineTimePeriod = this.props.baselineTimePeriod;
    const season = this.props.seasonOpt.value;
    const variable = this.props.variableOpt.value;

    return (
      <React.Fragment>
        <Row>
          <Col lg={12}>
            <T path='graphs.prologue' data={{
              season: get('label', this.props.seasonOpt),
              variable: get('label', this.props.variableOpt),
              region: get('label', this.props.regionOpt),
            }}/>
          </Col>
        </Row>
        <Row>
          <Col lg={12}>
            <ChangeOverTimeGraph
              region={region}
              baselineTimePeriod={baselineTimePeriod}
              season={season}
              variable={variable}
              // TODO: This may be better obtained from metadata
              futureTimePeriods={
                this.getConfig('graphs.config.futureTimePeriods')}
              graphConfig={this.getConfig('graphs.config')}
              variableConfig={this.getConfig('variables')}
              unitsConversions={this.getConfig('units')}
            />
          </Col>
        </Row>
      </React.Fragment>
    );
  }
}