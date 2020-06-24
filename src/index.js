import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import ExternalText from './temporary/external-text';
import ErrorBoundary from './components/misc/ErrorBoundary';
import App from './components/app-root/App';
import { makeYamlLoader } from './utils/external-text';


const loadTexts = makeYamlLoader(
  `${process.env.PUBLIC_URL}/${process.env.REACT_APP_EXTERNAL_TEXT}`
);


ReactDOM.render(
  (
    <ErrorBoundary>
      <ExternalText.Provider loadTexts={loadTexts}>
        <App/>
      </ExternalText.Provider>
    </ErrorBoundary>
  ),
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
