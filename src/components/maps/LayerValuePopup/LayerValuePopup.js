import PropTypes from 'prop-types';
import React from 'react';
import { Popup } from 'react-leaflet'


export default class LayerValuePopup extends React.Component {
  static propTypes = {
    position: PropTypes.object,
    onClose: PropTypes.func,
  };

  state = {
  };

  render() {
    return (
      <Popup
        position={this.props.position}
        onClose={this.props.onClose}
      >
        LayerValuePopup: {this.props.value}
      </Popup>
    );
  }
}
