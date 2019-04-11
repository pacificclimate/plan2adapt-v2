import PropTypes from 'prop-types';
import React from 'react';
import { Table } from 'react-bootstrap';
import { filter, flow, groupBy, map, mapValues, sortBy, uniq, toPairs } from 'lodash/fp';


const sort = sortBy(x => x);


export default class Impacts extends React.Component {
  static propTypes = {
    rulebase: PropTypes.array.isRequired,
    ruleValues: PropTypes.object.isRequired,
    groupKey: PropTypes.string.isRequired,
    itemKey: PropTypes.string.isRequired,
    groupHeading: PropTypes.element.isRequired,
    itemsHeading: PropTypes.element.isRequired,
  };

  render() {
    const rulesByGroupKey =
      groupBy(rule => rule[this.props.groupKey])(this.props.rulebase);

    const activeItemsByGroupKey =
      mapValues(
        flow(
          filter(rule => this.props.ruleValues[rule.id]),
          map(rule => rule[this.props.itemKey]),
          uniq,
          sort,
        )
      )(rulesByGroupKey);

    const sortedActiveItemsByGroupKey = flow(
      toPairs,
      sortBy(([category, sectors]) => category)
    )(activeItemsByGroupKey);

    return (
      <Table bordered hover>
        <thead>
        <tr>
          <th>{this.props.groupHeading}</th>
          <th>{this.props.itemsHeading}</th>
        </tr>
        </thead>
        <tbody>
        {
          map(([key, items]) => (
            key.length > 0 && items.length > 0 &&
            <tr>
              <td>{key}</td>
              <td>{items.join(', ')}</td>
            </tr>
          ))(sortedActiveItemsByGroupKey)
        }
        </tbody>
      </Table>
    );
  }
}
