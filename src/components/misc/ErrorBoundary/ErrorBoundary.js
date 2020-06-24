// Generic component for catching errors.
//
// Usage:
//  <ErrorBoundary fallback={...}>
//    <ChildComponent1/>
//    <ChildComponent2/>
//  </ErrorBoundary>

import React from 'react';
import PropTypes from 'prop-types';
import styles from './ErrorBoundary.module.css';


export default class ErrorBoundary extends React.Component {
  static propTypes = {
    fallback: PropTypes.any,
  };

  static defaultProps = {
    fallback: (error, errorInfo) => {
      return (
        <div className={styles.errorBoundary}>
          <h1>Oops, something went wrong.</h1>
          <p>If you see this message, please report it
            to <a href="mailto:pcic.support@uvic.ca">PCIC Support</a>.
          </p>
          <p>Here's some information on the problem:</p>
          <pre>{error.error.toString()}</pre>
          <p>Developers, see console error log.</p>
        </div>
      )
    },
  };

  state = {
    error: null,
    errorInfo: null,
  };

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    // You can also log the error to an error reporting service
    console.error(error, errorInfo);
  }

  render() {
    if (this.state.error !== null) {
      const Fallback = this.props.fallback;
      return <Fallback {...this.state} />;
    }
    // No error: Just render children.
    return this.props.children;
  }
}