import React, { Component } from 'react';
import ExternalText from '../../temporary/external-text';
import ErrorBoundary from '../misc/ErrorBoundary';
import TestApp from './TestApp';
import { makeYamlLoader } from '../../utils/external-text';


const loadTexts = makeYamlLoader(
  `${process.env.PUBLIC_URL}/${process.env.REACT_APP_EXTERNAL_TEXT}`
);


export default class AppWrapper extends Component {
  state = {
    a: 0,
  };

  componentDidMount() {
    setTimeout(
      () => {
        console.log('### Timeout')
        this.setState({ a: 2 });
        // this.setState(state => ({ a: state.a + 1 }));
      },
      2000,
    );
  }

  render() {
    return (
      // <ExternalText.Provider loadTexts={loadTexts}>
        <ErrorBoundary>
          <TestApp a={this.state.a}/>
        </ErrorBoundary>
      // </ExternalText.Provider>
    );
  }

}