import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/app-root/App';
import * as serviceWorker from './serviceWorker';
import ExternalText from './temporary/external-text';
import { makeYamlLoader } from './utils/external-text';

console.log('index.js: App', App)
console.log('index.js: ExternalText', ExternalText)

const loadTexts = makeYamlLoader(
  `${process.env.PUBLIC_URL}/${process.env.REACT_APP_EXTERNAL_TEXT}`
);

ReactDOM.render(
  (
    <ExternalText.Provider loadTexts={loadTexts}>
      <App/>
    </ExternalText.Provider>
  ),
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
