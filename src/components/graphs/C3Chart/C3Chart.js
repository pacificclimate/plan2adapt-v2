// This component wraps the package c3 so that it can be used conveniently
// in React. This component offers a very static version of C3: It just
// generates a graph based on the props, nothing more. Props change, graph
// changes, but only in the sense that a new one is generated. There is no
// equivalent of dynamic features like c3.load, for example.

import PropTypes from 'prop-types';
import React from 'react';
import c3 from 'c3';
import 'c3/c3.css';

export default class C3Chart extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    // id for chart dom element

    onRenderChart: PropTypes.func,
    // Called with arguments (node, chart) whenever the component (re)renders
    // a chart.

    // Remaining props for this component are top-level options for C3.
    // I'm too lazy at the moment to define them all here. Key ones are
    // size, color, data, axis, legend, ...
  };

  static defaultProps = {
    onRenderChart: () => {},
  };

  constructor(props) {
    super(props);
    this.node = React.createRef();
  }

  componentDidMount() {
    this.renderChart();
  }

  componentDidUpdate() {
    this.renderChart();
  }

  renderChart = () => {
    const { id, onRenderChart, ...rest } = this.props;
    this.chart = c3.generate({
      bindto: this.node.current,
      ...rest,
    });
    onRenderChart(this.node, this.chart);
  }

  render() {
    return (
      <div id={this.props.id} ref={this.node}/>
    );
  }
}
