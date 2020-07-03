// This component creates the content of the Impacts tab.
// It is responsible for
//  - Filtering out unsettled props (options from App)
//  - Layout and formatting
//  - Marshalling data for subsidiary components

import React from 'react';
import T from '../../temporary/external-text';
import { middleDecade } from '../../utils/time-periods';
import { allDefined } from '../../utils/lodash-fp-extras';
import Loader from 'react-loader';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ImpactsTabs from '../data-displays/impacts/ImpactsTabs';
import rulebase from '../../assets/rulebase';

export default class ImpactsTabBody extends React.PureComponent {
  static contextType = T.contextType;
  getConfig = path => T.get(this.context, path, {}, 'raw');

  static propTypes = {
    regionOpt: PropTypes.object,
    futureTimePeriodOpt: PropTypes.object,
    baselineTimePeriod: PropTypes.object,
  };

  render() {
    if (!allDefined(
      [
        'regionOpt',
        'futureTimePeriodOpt',
        'baselineTimePeriod',
      ],
      this.props
    )) {
      console.log('### ImpactsTabBody: unsettled props', this.props)
      return <Loader/>
    }

    const region = this.props.regionOpt.value;
    const futureTimePeriod = this.props.futureTimePeriodOpt.value.representative;
    const baselineTimePeriod = this.props.baselineTimePeriod;

    return (
      <React.Fragment>
        <Row>
          <Col lg={12}>
            <T path='tabs.impacts.prologue' data={{
              region,
              futureDecade: middleDecade(futureTimePeriod),
              baselineDecade: middleDecade(baselineTimePeriod),
            }}/>
            <ImpactsTabs
              rulebase={rulebase}
              region={region}
              futureTimePeriod={futureTimePeriod}
            />
          </Col>
        </Row>
      </React.Fragment>
    );
  }
}