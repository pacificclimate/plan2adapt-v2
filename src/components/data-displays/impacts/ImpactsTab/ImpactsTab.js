import PropTypes from 'prop-types';
import React from 'react';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Impacts from '../Impacts';
import Rules from '../Rules';
import withAsyncData from '../../../../HOCs/withAsyncData';
import { loadRulesResults, shouldLoadRulesResults } from '../common';


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
  };

  render() {
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
