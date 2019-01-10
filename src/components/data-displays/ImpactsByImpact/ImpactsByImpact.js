import PropTypes from 'prop-types';
import React from 'react';
import { Table } from 'react-bootstrap';

export default class ImpactsByImpact extends React.Component {
  render() {
    return (
      <Table bordered hover>
        <thead>
        <tr>
          <th>Impact</th>
          <th>Affected Sectors</th>
        </tr>
        </thead>
        <tbody>
        {
          [0, 1, 2].map(key => (
            <tr key={key}>
              <td>impact</td>
              <td>sectors...</td>
            </tr>
          ))
        }
        </tbody>
      </Table>
    );
  }
}
