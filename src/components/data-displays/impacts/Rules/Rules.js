import PropTypes from 'prop-types';
import React from 'react';
import RulesTable from '../RulesTable';
import T from '../../../../temporary/external-text';
import './Rules.css';


export default class Rules extends React.Component {
  static propTypes = {
    rulebase: PropTypes.array.isRequired,
    region: PropTypes.object.isRequired,
    futureTimePeriod: PropTypes.object.isRequired,
    ruleValues: PropTypes.object.isRequired,
  };

  render() {
    return (
      <div className='Rules'>
        <T path='tabs.impacts.rulesLogic.prologue'/>
        <RulesTable {...this.props}/>
      </div>
    );
  }
}
