import PropTypes from 'prop-types';
import React from 'react';
import { Table } from 'react-bootstrap';
import { map } from 'lodash/fp';
import ReactMarkdown from 'react-markdown';
import classnames from 'classnames';
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
          <th>Rule ID</th>
          <th>Condition</th>
          <th>Category</th>
          <th>Sector</th>
          <th>Effects</th>
          <th>Management Implications</th>
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
