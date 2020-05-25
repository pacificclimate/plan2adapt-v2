// This component wraps the package c3 so that it can be used conveniently
// in React. This component offers a very static version of C3: It just
// generates a graph based on the props, nothing more. Props change, graph
// changes, but only in the sense that a new one is generated. There is no
// equivalent of dynamic features like c3.load, for example.

import PropTypes from 'prop-types';
import React from 'react';
import c3 from 'c3';
import 'c3/c3.css';

export default class C3Graph extends React.Component {
  static propTypes = {
    // Props for this component are top-level options for C3.
    // I'm too lazy at the moment to define them all here. Key ones are
    // size, color, data, axis, legend, ...
  };

  state = {
  };

  constructor(props) {
    super(props);
    this.node = React.createRef();
  }

  componentDidMount() {
    this.renderGraph();
  }

  componentDidUpdate() {
    this.renderGraph();
  }

  renderGraph = () => {
    this.graph = c3.generate({
      bindto: this.node.current,
      ...this.props,
    })
  }

  render() {
    return (
      <div ref={this.node}/>
    );
  }
}
