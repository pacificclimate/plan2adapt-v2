import React from 'react';
import PropTypes from 'prop-types';
import T from '../../temporary/external-text';


let renderCount = 0;

export default class TestApp extends React.Component {
  static contextType = T.contextType;

  static propTypes = {
    a: PropTypes.number,
  };

  constructor(props) {
    console.log('### TestApp.constructor')
    super(props);
  }

  static getDerivedStateFromProps() {
    console.log('### TestApp.getDerivedStateFromProps')
    return null;
  }

  componentDidMount() {
    console.log('### TestApp.componentDidMount')
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    const cond = this.props.a !== nextProps.a;
    console.log('### TestApp.shouldComponentUpdate', cond)
    return cond;
    return this.context !== nextContext;
  }

  componentDidUpdate() {
    console.log('### TestApp.componentDidUpdate')
  }

  render() {
    renderCount += 1;
    console.log(`### TestApp.render (${renderCount})`, this.props)
    // if (!this.context) {
    //   // console.log('### TestApp.render: Loading context')
    //   return 'Loading context'
    // }
    // console.log('### TestApp.render: Context loaded')
    if (this.props.a === 2) {
      throw new Error('In TestApp')
      return;
    }
    return (
      <div>
        Test: {this.props.a}
      </div>
    );
  }
}