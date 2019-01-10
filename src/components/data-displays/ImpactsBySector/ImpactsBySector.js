import PropTypes from 'prop-types';
import React from 'react';
import { Table } from 'react-bootstrap';

export default class ImpactsBySector extends React.Component {
  render() {
    return (
      <Table bordered hover>
        <thead>
        <tr>
          <th>Sector</th>
          <th>Impacts on Sector</th>
        </tr>
        </thead>
        <tbody>
        {
          [0, 1, 2].map(key => (
            <tr key={key}>
              <td>sector</td>
              <td>impacts...</td>
            </tr>
          ))
        }
        </tbody>
      </Table>
    );
  }
}
