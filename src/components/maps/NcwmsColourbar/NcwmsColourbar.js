import PropTypes from 'prop-types';
import React from 'react';
import styles from './NcwmsColourbar.module.css';
import { makeURI } from '../../../utils/uri';
import { wmsNumcolorbands, wmsPalette } from '../map-utils';


const getColorbarURI = (props, width, height) =>
  makeURI(
    process.env.REACT_APP_NCWMS_URL,
    {
      request: 'GetLegendGraphic',
      colorbaronly: 'true',
      width,
      height,
      palette: wmsPalette(props),
      numcolorbands: wmsNumcolorbands,
    }
  );


export default class NcwmsColourbar extends React.Component {
  static propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
  };

  static defaultProps = {
    width: 10,
    height: 300,
  };

  render() {
    return (
      <div>
        <div className={styles.wrapper1}>
          <img
            className={styles.image}
            src={getColorbarURI(this.props, this.props.width, this.props.height)}
          />
          <div className={styles.values}>
            <span className={styles.left}>0</span>
            <span className={styles.middle}>50</span>
            <span className={styles.right}>100</span>
          </div>
        </div>
      </div>
    );
  }
}
