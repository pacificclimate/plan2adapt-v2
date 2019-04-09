import PropTypes from 'prop-types';
import React from 'react';
import Table from 'react-bootstrap/Table';
import { map, slice } from 'lodash/fp';


const SeasonTds = ({ variable, season }) => [
  <td>
    {season.label}
  </td>,
  <td>
    {season.ensembleMedian} {variable.units}
  </td>,
  <td>
    {season.range.min} {variable.units} to {season.range.max}  {variable.units}
  </td>,
];


export default class Summary extends React.Component {
  static propTypes = {
    summary: PropTypes.array,
  };

  render() {
    return (
      <Table striped bordered>
        <thead>
        <tr>
          <th rowSpan={2}>Climate Variable</th>
          <th rowSpan={2}>Season </th>
          <th colSpan={2}>Projected Change from 1961-1990 Baseline</th>
        </tr>
        <tr>
          <th>Ensemble Median</th>
          <th>Range (10th to 90th percentile)</th>
        </tr>
        </thead>
        <tbody>
        {
          map(item => ([
              (
                <tr>
                  <td rowSpan={item.seasons.length}>
                    {item.variable.label} ({item.variable.units})
                  </td>
                  <SeasonTds variable={item.variable} season={item.seasons[0]}/>
                </tr>
              ),
              (
                map(season => (
                    <tr>
                      <SeasonTds variable={item.variable} season={season}/>
                    </tr>
                  )
                )(slice(1, item.seasons.length, item.seasons))
              ),
            ]
          ))(this.props.summary)
        }
        </tbody>
      </Table>
    );
  }
}
