import PropTypes from 'prop-types';
import React from 'react';
import { Table } from 'react-bootstrap';
import { map } from 'lodash/fp';
import ReactMarkdown from 'react-markdown';
import classnames from 'classnames';
import T from '../../../../utils/external-text';
import './RulesTable.css';


export default class RulesTable extends React.Component {
  static propTypes = {
    rulebase: PropTypes.array.isRequired,
    ruleValues: PropTypes.object.isRequired,
  };

  render() {
    return (
      <Table bordered className='Rules-table'>
        <thead>
        <tr>
          <th><T item='impacts.rulesLogic.table.heading.ruleId'/></th>
          <th><T item='impacts.rulesLogic.table.heading.condition'/></th>
          <th><T item='impacts.rulesLogic.table.heading.category'/></th>
          <th><T item='impacts.rulesLogic.table.heading.sector'/></th>
          <th><T item='impacts.rulesLogic.table.heading.effects'/></th>
          <th><T item='impacts.rulesLogic.table.heading.notes'/></th>
        </tr>
        </thead>
        <tbody>
        {
          map(rule => (
            <tr
              className={classnames({
                'active-rule': this.props.ruleValues[rule.id]
              })}
            >
              <td>{rule.id}</td>
              <td>{rule.condition}</td>
              <td>{rule.category}</td>
              <td>{rule.sector}</td>
              <td>{rule.effects}</td>
              <td>
                <ReactMarkdown source={rule.notes} escapeHtml={false}/>
              </td>
            </tr>
          ))(this.props.rulebase)
        }
        </tbody>
      </Table>
    );
  }
}
