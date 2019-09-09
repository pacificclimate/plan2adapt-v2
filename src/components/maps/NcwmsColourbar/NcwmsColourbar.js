import PropTypes from 'prop-types';
import React from 'react';
import styles from './NcwmsColourbar.module.css';
import { makeURI } from '../../../utils/uri';
import {
  wmsDataRange,
  wmsNumcolorbands,
  wmsPalette
} from '../map-utils';


const getColorbarURI = (variableSpec, width, height) =>
  makeURI(
    process.env.REACT_APP_NCWMS_URL,
    {
      request: 'GetLegendGraphic',
      colorbaronly: 'true',
      width,
      height,
      palette: wmsPalette(variableSpec),
      numcolorbands: wmsNumcolorbands,
    }
  );


export default class NcwmsColourbar extends React.Component {
  static propTypes = {
    variableSpec: PropTypes.object,
    height: PropTypes.number,
  };

  static defaultProps = {
    width: 20,
    height: 300,
  };

  render() {
    const range = wmsDataRange(this.props.variableSpec);
    return (
      <div>
        <div
          className={styles.wrapper}
          style={{ width: this.props.height + 20 }}
        >
          <img
            className={styles.image}
            style={{
              'margin-top': -this.props.height,
              'margin-left': -this.props.width,
            }}
            src={getColorbarURI(
              this.props.variableSpec,
              this.props.width,
              this.props.height
            )}
          />
          <div className={styles.values}>
            <span className={styles.left}>{range.min}</span>
            <span className={styles.middle}>{(range.min + range.max) / 2}</span>
            <span className={styles.right}>{range.max}</span>
          </div>
        </div>
      </div>
    );
  }
}