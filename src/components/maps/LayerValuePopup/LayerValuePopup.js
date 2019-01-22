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
        {
          this.props.error ?
            `${this.props.error}` :
            this.props.value === null ?
              'Loading ...' :
              `Value: ${this.props.value}`
        }
      </Popup>
    );
  }
}
