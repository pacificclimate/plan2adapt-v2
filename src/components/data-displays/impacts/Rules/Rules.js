import PropTypes from 'prop-types';
import React from 'react';
import RulesTable from '../RulesTable';
import T from '../../../../utils/external-text';
import './Rules.css';

export default class Rules extends React.Component {
  static propTypes = {
    rulebase: PropTypes.array.isRequired,
    ruleValues: PropTypes.object.isRequired,
  };

  render() {
    return (
      <div className='Rules'>
        <T item='impacts.rulesLogic.prologue'/>
        <RulesTable {...this.props}/>
      </div>
    );
  }
}
