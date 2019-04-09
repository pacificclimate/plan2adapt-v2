import PropTypes from 'prop-types';
import React from 'react';
import Table from 'react-bootstrap/Table';
import { map } from 'lodash/fp';


const unitsSuffix = units =>
  `${units.match(/^[A-Za-z]/) ? ' ' : ''}${units}`;

const isLong = s => s.length > 2;

const SeasonTds = ({ variable, season }) => {
  const units = unitsSuffix(variable.units);
  return [
    <td className="text-center">
      {season.label}
    </td>,
    <td>
      {season.ensembleMedian}{units}
    </td>,
    <td>
      {season.range.min}{isLong(units) ? '' : units} to {season.range.max}{units}
    </td>,
  ];
};


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
          <th rowSpan={2} className="text-center">
            Season
          </th>
          <th colSpan={2} className="text-center">
            Projected Change from 1961-1990 Baseline
          </th>
        </tr>
        <tr>
          <th>Ensemble Median</th>
          <th>Range (10th to 90th percentile)</th>
        </tr>
        </thead>
        <tbody>
        {
          map(item =>
            map(season => (
                <tr>
                  {
                    season === item.seasons[0] &&
                    <td rowSpan={item.seasons.length}>
                      {item.variable.label} ({item.variable.units})
                    </td>
                  }
                  <SeasonTds variable={item.variable} season={season}/>
                </tr>
              )
            )(item.seasons)
          )(this.props.summary)
        }
        </tbody>
      </Table>
    );
  }
}
