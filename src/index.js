import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/app-root/App';
import * as serviceWorker from './serviceWorker';
import ExternalText from './utils/external-text';

setTimeout(() => {
  ExternalText.setTexts({
    greeting: 'Hello, ${name}',
  });
}, 5000);

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
