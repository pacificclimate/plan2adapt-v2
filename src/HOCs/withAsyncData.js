// Higher-order function returning a Higher-Order Component (HOC) that injects
// asynchronously fetched data into a component.
//
// (See https://reactjs.org/docs/higher-order-components.html#convention-maximizing-composability
// for why this HOC is separated into two parts like this.)
//
// To manage asynchronous data fetching, this component follows React best
// practice:
// https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#fetching-external-data-when-props-change
// This code is a fairly direct port of that example.
//
// Data fetching occurs when the value of `this.props[controlProp]` changes.
// This is simpler, but adequate, special case of the general case that could
// be handled by passing in a function that compares all relevant props.
//
// The fetched data is injected into the base component through a prop passed
// to it named by `dataProp`.

import React from 'react';
import Loader from 'react-loader';


export default function withAsyncData(
  loadAsyncData,  // Async data fetcher. Returns a promise.
  shouldLoadData, // Examines props to determine whether new data should be loaded
  dataPropName    // Name of prop to pass data to base component through
) {
  return function(BaseComponent) {
    return class extends React.Component {
      state = {
        prevProps: undefined,
        externalData: null,
      };

      static getDerivedStateFromProps(props, state) {
        // Store previous props in state so we can evaluate `shouldLoadData()`.
        // Clear out previously-loaded data so we don't deliver stale data.
        if (shouldLoadData(state.prevProps, props)) {
          return {
            externalData: null,
            prevProps: props,  // Robust only if props are immutable
          };
        }

        // No state update necessary
        return null;
      }

      componentDidMount() {
        this._loadAsyncData(this.props);
      }

      componentDidUpdate(prevProps, prevState) {
        if (this.state.externalData === null) {
          this._loadAsyncData(this.props);
        }
      }

      componentWillUnmount() {
        if (this._asyncRequest && this._asyncRequest.cancel) {
          this._asyncRequest.cancel();
        }
      }

      _loadAsyncData(...args) {
        this._asyncRequest = loadAsyncData(...args).then(
          externalData => {
            this._asyncRequest = null;
            this.setState({ externalData });
          }
        );
      }

      render() {
        if (this.state.externalData === null) {
          return <Loader/>;
        }
        return (
          <BaseComponent
            {...{ [dataPropName]: this.state.externalData }}
            {...this.props}
          />
        );
      }
    }
  }
}