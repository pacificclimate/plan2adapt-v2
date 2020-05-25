import PropTypes from 'prop-types';
import React from 'react';
import Button from 'react-bootstrap/Button';
import C3Graph from '../C3Graph';

const datas = [
  {
    columns: [
      ['data1', 30, 200, 100, 400, 150, 250],
      ['data2', 50, 20, 10, 40, 15, 25]
    ]
  },
  {
    columns: [
      ['data1', 400, 150, 250, 30, 200, 100, ],
      ['data2', 40, 15, 25, 50, 20, 10]
    ]
  }
]


export default class ChangeOverTimeGraph extends React.Component {
  static propTypes = {
    region: PropTypes.any,
    timePeriod: PropTypes.any,
    season: PropTypes.any,
    variable: PropTypes.any,
  };

  state = {
    dataIndex: 0,
  };

  toggle = () => this.setState({ dataIndex: 1-this.state.dataIndex })

  render() {
    // Let's try this from the ground up
    return (
      <React.Fragment>
        <Button
          onClick={this.toggle}
        >
          Toggle Data
        </Button>
        <C3Graph
          data={datas[this.state.dataIndex]}
        />
      </React.Fragment>
    );
  }
}
