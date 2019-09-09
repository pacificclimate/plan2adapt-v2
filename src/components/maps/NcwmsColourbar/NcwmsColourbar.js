import PropTypes from 'prop-types';
import React from 'react';
import map from 'lodash/fp/map';
import styles from './NcwmsColourbar.module.css';
import { makeURI } from '../../../utils/uri';
import {
  wmsDataRange,
  wmsNumcolorbands,
  wmsPalette, wmsTicks
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
    width: PropTypes.number,
    height: PropTypes.number,
  };

  static defaultProps = {
    width: 20,
    height: 300,
  };

  render() {
    const range = wmsDataRange(this.props.variableSpec);
    const span = range.max - range.min;
    const ticks = wmsTicks(this.props.variableSpec);
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
            {
              map(
                tick => (
                  <span
                    style={{
                      left: `${(tick - range.min) / span * 100}%`
                    }}
                  >
                    {tick}
                  </span>
                )
              )(ticks)
            }
          </div>
        </div>
      </div>
    );
  }
}
