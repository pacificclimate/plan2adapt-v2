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
import ErrorBoundary from '../../../misc/ErrorBoundary';
import ImpactsMatrix from '../../Matrix/ImpactsMatrix';

class ImpactsTabs extends React.Component {
  // This is a pure (state-free), controlled component that renders the entire
  // content of ImpactsTabs.
  //
  // This component is wrapped with `withAsyncData` to inject the rule values
  // (prop `ruleValues`) that are fetched asynchronously, according to the
  // selected region and climatological time period.
  static propTypes = {
    rulebase: PropTypes.array.isRequired,
    region: PropTypes.object.isRequired,
    futureTimePeriod: PropTypes.object.isRequired,
    ruleResults: PropTypes.shape({
      ruleValues: PropTypes.object,
      cellRuleValues: PropTypes.object,
    })
  };

  render() {
    const { rulebase, region, futureTimePeriod, ruleResults } = this.props;
    const { ruleValues, cellRuleValues } = (ruleResults || {});

    if (!allDefined(
      [
        'rulebase',
        'region',
        'futureTimePeriod',
        'ruleResults.ruleValues',
        'ruleResults.cellRuleValues',
      ],
      { rulebase, region, futureTimePeriod, ruleResults }
    )) {
      console.log('### ImpactsTabs: unsettled props', this.props)
      return <Loader />;
    }

    return (
      <Tabs id='impacts' defaultActiveKey='by-category'>
        <Tab eventKey='by-category' title='By Category' className='pt-2'>
          <ErrorBoundary>
            <Impacts
              {...this.props}
              ruleValues={ruleValues}
              groupKey='category'
              itemKey='sector'
              groupHeading='Impact Category'
              itemsHeading='Affected Sectors'
            />
          </ErrorBoundary>
        </Tab>
        <Tab eventKey='by-sector' title='By Sector' className='pt-2'>
          <ErrorBoundary>
            <Impacts
              {...this.props}
              ruleValues={ruleValues}
              groupKey='sector'
              itemKey='category'
              groupHeading='Affected Sector'
              itemsHeading='Impact Categories'
            />
          </ErrorBoundary>
        </Tab>
        <Tab eventKey='rules' title='Rules Logic' className='pt-2'>
          <ErrorBoundary>
            <Rules
              {...this.props}
              ruleValues={ruleValues}
            />
          </ErrorBoundary>
        </Tab>
        <Tab
          eventKey={'impacts-matrix'}
          title={'Impacts Matrix'}
          className='pt-2'
        >
          <ErrorBoundary>
            <ImpactsMatrix rulebase={rulebase} cellRuleValues={cellRuleValues} />
          </ErrorBoundary>
        </Tab>
      </Tabs>
    );
  }
}

export default withAsyncData(
  loadRulesResults,
  shouldLoadRulesResults,
  'ruleResults' // returns { ruleValues, cellRuleValues }
)(ImpactsTabs);
