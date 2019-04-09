import PropTypes from 'prop-types';
import React from 'react';
import Table from 'react-bootstrap/Table';
import { map } from 'lodash/fp';
import T from '../../../utils/external-text';


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
    baseline: PropTypes.object,
  };

  static defaultProps = {
    baseline: {
      start_date: 1961,
      end_date: 1990,
    }
  }

  render() {
    return (
      <Table striped bordered>
        <thead>
        <tr>
          <th rowSpan={2} className='align-middle'>
            <T item='summary.table.heading.variable'/>
          </th>
          <th rowSpan={2} className='align-middle text-center'>
            <T item='summary.table.heading.season'/>
          </th>
          <th colSpan={2} className='text-center'>
            <T item='summary.table.heading.projectedChange'
               context={this.props.baseline}/>
          </th>
        </tr>
        <tr>
          <th>
            <T item='summary.table.heading.ensembleMedian'/>
          </th>
          <th>
            <T item='summary.table.heading.range'/>
          </th>
        </tr>
        </thead>
        <tbody>
        {
          map(item =>
            map(season => (
                <tr>
                  {
                    season === item.seasons[0] &&
                    <td
                      rowSpan={item.seasons.length}
                      className='align-middle'
                    >{`
                      ${item.variable.label}${item.variable.derived ? '*' : ''}
                      (${item.variable.units})
                    `}</td>
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
