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
import merge from 'lodash/fp/merge';
import ChangeOverTimeGraph from '../graphs/ChangeOverTimeGraph';
import {
  getVariableDisplay,
  getVariableInfo
} from '../../utils/variables-and-units';
import { collectionToCanonicalUnitsSpecs } from '../../utils/units';

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
      return <Loader/>;
    }

    const region = this.props.regionOpt.value;
    const baselineTimePeriod = this.props.baselineTimePeriod;
    const season = this.props.seasonOpt.value;
    const variable = this.props.variableOpt.value;

    const graphConfig = this.getConfig('tabs.graphs.config');
    const variableConfig = merge(
      this.getConfig('variables'),
      graphConfig.variables,
    );

    const unitsSpecs =
      collectionToCanonicalUnitsSpecs(this.getConfig('units'));

    const variableId = variable.representative.variable_id;
    const display = getVariableDisplay(variableConfig, variableId);
    const variableInfo = getVariableInfo(
      unitsSpecs, variableConfig, variableId, display
    );

    return (
      <React.Fragment>
        <Row>
          <Col lg={12}>
            <T path='tabs.graphs.prologue' data={{
              region,
              variable: variableInfo,
              season: get('label', this.props.seasonOpt),
            }}/>
          </Col>
        </Row>
        <Row>
          <Col lg={12}>
            <ChangeOverTimeGraph
              region={region}
              baselineTimePeriod={baselineTimePeriod}
              // TODO: This may be better obtained from metadata
              futureTimePeriods={
                this.getConfig('tabs.graphs.config.futureTimePeriods')}
              season={season}
              variable={variable}
              variableInfo={variableInfo}
              graphConfig={graphConfig}
              variableConfig={variableConfig}
              unitsSpecs={unitsSpecs}
            />
          </Col>
        </Row>
      </React.Fragment>
    );
  }
}