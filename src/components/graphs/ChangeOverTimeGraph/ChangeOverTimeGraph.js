import PropTypes from 'prop-types';
import React from 'react';
import get from 'lodash/fp/get';
import C3Graph from '../C3Graph';


export default class ChangeOverTimeGraph extends React.Component {
  static propTypes = {
    region: PropTypes.any,
    timePeriod: PropTypes.any,
    season: PropTypes.any,
    variable: PropTypes.any,
  };

  state = {
  };

  render() {
    // Let's try this from the ground up
    return (
      <C3Graph/>
    );
  }
}
