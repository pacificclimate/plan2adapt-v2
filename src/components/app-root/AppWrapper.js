import React from "react";
import {
  BrowserRouter as Router,
  useLocation,
} from "react-router-dom";
import App from './App';


// A custom hook that builds on useLocation to parse
// the query string for you.
function useQuery() {
  return new URLSearchParams(useLocation().search);
}


function AppWithQuery() {
  const query = useQuery();

  return (
    <App foo={query.get('foo')}/>
  );
}


export default function AppWrapper() {
  return (
    <Router>
      <AppWithQuery />
    </Router>
  )
}
