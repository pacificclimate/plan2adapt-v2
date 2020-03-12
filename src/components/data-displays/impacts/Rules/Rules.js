import PropTypes from 'prop-types';
import React from 'react';
import RulesTable from '../RulesTable';
import T from 'pcic-react-external-text';
import withAsyncData from '../../../../HOCs/withAsyncData';
import { loadRulesResults, shouldLoadRulesResults } from '../common';
import './Rules.css';


class Rules extends React.Component {
  static propTypes = {
    rulebase: PropTypes.array.isRequired,
    region: PropTypes.object.isRequired,
    futureTimePeriod: PropTypes.object.isRequired,
    ruleValues: PropTypes.object.isRequired,
  };

  render() {
    return (
      <div className='Rules'>
        <T path='impacts.rulesLogic.prologue'/>
        <RulesTable {...this.props}/>
      </div>
    );
  }
}


export default withAsyncData(
  loadRulesResults, shouldLoadRulesResults, 'ruleValues'
)(Rules);
