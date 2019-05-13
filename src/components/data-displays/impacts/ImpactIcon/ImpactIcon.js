import PropTypes from 'prop-types';
import React from 'react';
import flow from 'lodash/fp/flow';
import replace from 'lodash/fp/replace';
import './ImpactIcon.css';


export const textToImageFilename = text =>
  flow(
    replace(/\W+/g, '_'),
    replace(/[A-Z]/g, a => a.toLowerCase()),
  )(text);


const iconDir = `${process.env.PUBLIC_URL}/images/icons/impacts`;


export default class ImpactIcon extends React.Component {
  static propTypes = {
    kind: PropTypes.string,
    icon: PropTypes.string,
  };

  render() {
    return (
      <img
        className='ImpactIcon'
        src={`${iconDir}/${this.props.kind}/${textToImageFilename(this.props.icon)}.png`}
        alt={this.props.icon}
        title={this.props.icon}
      />
    );
  }
}
