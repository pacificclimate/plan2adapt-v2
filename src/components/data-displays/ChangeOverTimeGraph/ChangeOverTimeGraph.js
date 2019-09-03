import PropTypes from 'prop-types';
import React from 'react';
import get from 'lodash/fp/get';


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
    return (
      <div className={'data'}>
        {`
          Graph:
          ${this.props.region.label},
          ${this.props.season.label},
          ${get('label', this.props.variable)}
          vs. Time period
        `}
      </div>
    );
  }
}
