// This component wraps the package c3 so that it can be used conveniently
// in React.

import PropTypes from 'prop-types';
import React from 'react';
import c3 from 'c3';
import 'c3/c3.css';

export default class C3Graph extends React.Component {
  static propTypes = {
  };

  state = {
  };

  constructor(props) {
    super(props);
    this.node = React.createRef();
  }

  componentDidMount() {
    console.log('### C3Graph.componentDidMount')
    this.renderGraph();
  }

  componentDidUpdate() {
    console.log('### C3Graph.componentDidUpdate')
    this.renderGraph();
  }

  renderGraph = () => {
    console.log('### C3Graph.renderGraph')
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
