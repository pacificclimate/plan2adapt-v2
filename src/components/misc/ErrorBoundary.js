// Generic component for catching errors.
//
// Usage:
//  <ErrorBoundary fallback={...}>
//    <ChildComponent1/>
//    <ChildComponent2/>
//  </ErrorBoundary>

import React from 'react';
import PropTypes from 'prop-types';


let errorCount = 0;


export default class ErrorBoundary extends React.Component {
  static propTypes = {
    fallback: PropTypes.any,
  };

  static defaultProps = {
    fallback: (error, errorInfo) => {
      console.log('### fallback: error', error)
      return (
        <div>
          <h1>Oops, something went wrong.</h1>
          <p>If you see this page, please report it to the proper
            authorities.</p>
          <p>Here's some information on the problem:</p>
          <p>{error.error.toString()}</p>
        </div>
      )
    },
  };

  state = {
    error: null,
    errorInfo: null,
  };

  componentDidCatch(error, errorInfo) {
    errorCount += 1;
    console.log('### ErrorBoundary.componentDidCatch', errorCount)
    this.setState({ error, errorInfo });
    // You can also log the error to an error reporting service
    console.error(error, errorInfo);
  }

  render() {
    if (this.state.error !== null) {
      console.log('### ErrorBoundary.render: fallback', errorCount)
      const Fallback = this.props.fallback;
      return <Fallback {...this.state} />;
    }
    // No error: Just render children.
    console.log('### ErrorBoundary.render: children', errorCount)
    return this.props.children;
  }
}