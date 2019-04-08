import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/app-root/App';
import * as serviceWorker from './serviceWorker';
import ExternalText from './utils/external-text';
import axios from 'axios';
import yaml from 'js-yaml';


const loadTexts = setTexts => {
  axios.get(
    `${process.env.PUBLIC_URL}/${process.env.REACT_APP_EXTERNAL_TEXTS}`,
    {
      responseType: 'text'
    }
  )
  .then(response => response.data)
  .then(yaml.safeLoad)
  .then(setTexts)
  .catch(error => { console.error(error); })
  ;
};

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
