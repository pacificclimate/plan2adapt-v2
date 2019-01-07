import PropTypes from 'prop-types';
import React from 'react';


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
          ${this.props.variable.label}
          vs. Time period
        `}
      </div>
    );
  }
}
