// This component creates the content of the Summary tab.
// It is responsible for
//  - Filtering out unsettled props (options from App)
//  - Layout and formatting
//  - Marshalling data for subsidiary components

import React from 'react';
import T from '../../temporary/external-text';
import { middleDecade } from '../../utils/time-periods';
import Summary from '../data-displays/Summary';
import { allDefined } from '../../utils/lodash-fp-extras';
import Loader from 'react-loader';
import PropTypes from 'prop-types';
import { collectionToCanonicalUnitsSpecs } from '../../utils/units';

export default class SummaryTabBody extends React.PureComponent {
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
      console.log('### SummaryTabBody: unsettled props', this.props)
      return <Loader />
    }

    const region = this.props.regionOpt.value;
    const futureTimePeriod = this.props.futureTimePeriodOpt.value.representative;
    const baselineTimePeriod = this.props.baselineTimePeriod;

    const unitsSpecs =
      collectionToCanonicalUnitsSpecs(this.getConfig('units'));

    return (
      <React.Fragment>
        <T path='tabs.summary.prologue' data={{
          region,
          baselineTimePeriod,
          futureTimePeriod,
          futureDecade: middleDecade(futureTimePeriod),
          baselineDecade: middleDecade(baselineTimePeriod),
        }} />
        <Summary
          region={region}
          futureTimePeriod={futureTimePeriod}
          baselineTimePeriod={baselineTimePeriod}
          tableContents={this.getConfig('tabs.summary.table.contents')}
          variableConfig={this.getConfig('variables')}
          unitsSpecs={unitsSpecs}
        />
        <T path='tabs.summary.notes' />
      </React.Fragment>
    );
  }
}