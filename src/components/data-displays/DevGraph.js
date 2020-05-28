import React from 'react';
import T from '../../temporary/external-text';
import C3Graph from '../graphs/C3Graph';


export default class DevColourbar extends React.Component {
  static contextType = T.contextType;
  getConfig = path => T.get(this.context, path, {}, 'raw');

  handleRenderChart = (node, chart) => {
    console.log('### Graph: node', node);
    console.log('### Graph: chart', chart);

    // const { internal: { d3 } } = chart;
    // const thing = d3.select(`#${node.id}`);
    // const circles = thing.selectAll('circle');
    // console.log('### Graph: circles', circles)
    // // circles.append("circle")        // attach a circle
    // // .attr("cx", 50)           // position the x-center
    // // .attr("cy", 50)           // position the y-center
    // // .attr("r", 10);            // set the radius

  };

  render() {
    const options = {
      size: {
        height: 500,
        width: 500,
      },
      axis: {
        x: {
          min: 0,
          max: 100,
        },
        y: {
          min: 0,
          max: 100,
        },
      },
      data: {
        x: 'x',
        columns: [
          ['x', 10, 20, 30, 11, 21, 31],
          ['y', 10, 20, 30, 40, 50, 60],
        ]
      },
    }
    return (
      <C3Graph
        id={'dev-chart'}
        onRenderChart={this.handleRenderChart}
        {...options}
      />
    );
  }
}
