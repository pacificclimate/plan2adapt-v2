import PropTypes from 'prop-types';
import React from 'react';
import Table from 'react-bootstrap/Table';
import { map } from 'lodash/fp';
import T from 'pcic-react-external-text';


const format = number => `${number > 0 ? '+' : ''}${number}`;

const unitsSuffix = units =>
  `${units.match(/^[A-Za-z]/) ? ' ' : ''}${units}`;

const isLong = s => s.length > 2;

const SeasonTds = ({ variable, season }) => {
  const units = unitsSuffix(variable.units);
  const data = {variable, season, units, format, isLong};
  return [
    <td className="text-center">
      <T path='summary.table.rows.season' data={data} as='string'/>
    </td>,
    <td>
      <T path='summary.table.rows.ensembleMedian' data={data} as='string'/>
    </td>,
    <td>
      <T path='summary.table.rows.range' data={data} as='string'/>
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
            <T path='summary.table.heading.variable' as='string'/>
          </th>
          <th rowSpan={2} className='align-middle text-center'>
            <T path='summary.table.heading.season' as='string'/>
          </th>
          <th colSpan={2} className='text-center'>
            <T path='summary.table.heading.projectedChange'
               data={this.props.baseline} as='string'/>
          </th>
        </tr>
        <tr>
          <th>
            <T path='summary.table.heading.ensembleMedian' as='string'/>
          </th>
          <th>
            <T path='summary.table.heading.range' as='string'/>
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
                    >
                      <T path='summary.table.rows.variable'
                        data={item} as='string'
                      />
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
