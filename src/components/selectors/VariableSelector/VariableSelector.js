// This wrapper component is unnecessary at the moment, but allows us to easily
// change the behaviour of the selector here in future.

import PropTypes from 'prop-types';
import React from 'react';
import { VariableSelector } from 'pcic-react-components';

export default class extends React.Component {
  static propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func,
  };

  render() {
    return (
      <VariableSelector
        {...this.props}
      />
    );
  }
}
