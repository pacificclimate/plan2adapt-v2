import PropTypes from 'prop-types';
import React from 'react';
import './SelectorLabel.css'


export default class SelectorLabel extends React.Component {
  render() {
    return (
      <div className={'SelectorLabel'}>{this.props.children}</div>
    );
  }
}
