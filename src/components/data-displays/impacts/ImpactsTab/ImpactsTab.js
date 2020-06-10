import PropTypes from 'prop-types';
import React from 'react';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Impacts from '../Impacts';
import Rules from '../Rules';
import withAsyncData from '../../../../HOCs/withAsyncData';
import { loadRulesResults, shouldLoadRulesResults } from '../common';
import { allDefined } from '../../../../utils/lodash-fp-extras';
import Loader from 'react-loader';


class ImpactsTab extends React.Component {
  // This is a pure (state-free), controlled component that renders the entire
  // content of ImpactsTab.
  //
  // This component is wrapped with `withAsyncData` to inject the rule values
  // (prop `ruleValues`) that are fetched asynchronously, according to the
  // selected region and climatological time period.

  static propTypes = {
    rulebase: PropTypes.array.isRequired,
    region: PropTypes.object.isRequired,
    futureTimePeriod: PropTypes.object.isRequired,
    ruleValues: PropTypes.object.isRequired,

    active: PropTypes.bool,
    // This is a mechanism for achieving two things:
    // 1. Forcing a re-render when the component becomes "active" (which
    //  is typically when the tab it is inside is selected).
    // 2. Not rendering anything when it is inactive, which saves a pile
    //  of unnecessary updates.
  };

  render() {
    if (!this.props.active) {
      return null;
    }
    if (!allDefined(
      [
        'rulebase',
        'region.geometry',
        'futureTimePeriod.start_date',
        'futureTimePeriod.end_date',
        'ruleValues',
      ],
      this.props
    )) {
      console.log('### ImpactsTab: unsettled props', this.props)
      return <Loader/>
    }
    return (
      <Tabs
        id={'impacts'}
        defaultActiveKey={'by-category'}
      >
        <Tab
          eventKey={'by-category'}
          title={'By Category'}
          className='pt-2'
        >
          <Impacts
            {...this.props}
            groupKey='category'
            itemKey='sector'
            groupHeading='Impact Category'
            itemsHeading='Affected Sectors'
          />
        </Tab>
        <Tab
          eventKey={'by-sector'}
          title={'By Sector'}
          className='pt-2'
        >
          <Impacts
            {...this.props}
            groupKey='sector'
            itemKey='category'
            groupHeading='Affected Sector'
            itemsHeading='Impact Categories'
          />
        </Tab>
        <Tab
          eventKey={'rules'}
          title={'Rules Logic'}
          className='pt-2'
        >
          <Rules
            {...this.props}
          />
        </Tab>
      </Tabs>

    );
  }
}


export default withAsyncData(
  loadRulesResults, shouldLoadRulesResults, 'ruleValues'
)(ImpactsTab);
