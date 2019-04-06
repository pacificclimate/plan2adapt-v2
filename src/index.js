import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/app-root/App';
import * as serviceWorker from './serviceWorker';
import { withExternalTexts, WithExternalTexts } from './utils/external-text';

const loadTexts = setTexts => {
  setTimeout(() => {
    setTexts({
      greeting: 'Hello, ${name}',
    });
  }, 3000);
};

ReactDOM.render(
  (
    <WithExternalTexts
      texts={{
        greeting: 'Bonjour, ${name}'
      }}
      loadTexts={loadTexts}
    >
      <App/>
    </WithExternalTexts>
  ),
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
