import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/app-root/App';
import * as serviceWorker from './serviceWorker';
import { withExternalText } from './utils/external-text';

const EnhancedApp = withExternalText(App);

const loadTexts = setTexts => {
  setTimeout(() => {
    setTexts({
      greeting: 'Hello, ${name}',
    });
  }, 3000);
};

ReactDOM.render(
  <EnhancedApp loadTexts={loadTexts}/>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
