// Render a colour bar indicating the meaning (i.e., data value) of colours
// in a climate layer. The result is a colour scale with ticks showing data
// values at various points along it.
//
// Notes:
//
//  - The colour bar graphic is retrieved from ncWMS. That graphic shows the
//    color gradation varying vertically. For this app, we want it to be
//    horizontal, and that requires a little trickiness with CSS to rotate and
//    reposition it. Unchanging CSS is in NcwmsColourbar.module.css; computed
//    CSS is in the code below.
//
//  - This component uses the same utilities used to set the colour scale
//    in component ClimateLayer. This is convenient, in that it ensures that
//    the colour bar is exactly right for the climate layers, but it's not
//    generic. Some refactoring could make it so.
//
//  - At present the colour bar is rendered only horizontally (i.e., the
//    colour variation runs horizontally, and the whole thing is wider than
//    high.
//
//  - Props `breadth` and `length` are for the unrotated (vertical) graphic;
//    so their meaning is reversed in the rendered graphic. Confusing, sorry.

import PropTypes from 'prop-types';
import React from 'react';
import getOr from 'lodash/fp/getOr';
import identity from 'lodash/fp/identity';
import map from 'lodash/fp/map';
import mapValues from 'lodash/fp/mapValues';
import styles from './NcwmsColourbar.module.css';
import { makeURI } from '../../../utils/uri';
import {
  wmsDataRange,
  wmsLogscale,
  wmsNumcolorbands,
  wmsPalette,
  wmsTicks
} from '../map-utils';


// TODO: Move to data-services.
const getColorbarURI = (displaySpec, variableSpec, width, height) =>
  makeURI(
    process.env.REACT_APP_NCWMS_URL,
    {
      request: 'GetLegendGraphic',
      colorbaronly: 'true',
      width,
      height,
      palette: wmsPalette(displaySpec, variableSpec),
      numcolorbands: wmsNumcolorbands,
    }
  );


export default class NcwmsColourbar extends React.Component {
  static propTypes = {
    // TODO: Change names
    breadth: PropTypes.number,
    length: PropTypes.number,
    belowMinColor: PropTypes.string,
    aboveMaxColor: PropTypes.string,

    title: PropTypes.element,
    note: PropTypes.element,

    variableSpec: PropTypes.object,

    displaySpec: PropTypes.object,
    // Display spec
  };

  static defaultProps = {
    breadth: 20,
    length: 600,
    belowMinColor: 'black',
    aboveMaxColor: 'gray',
  };

  constructor(props) {
    super(props);
    this.thing = React.createRef();
  }

  render() {
    const {
      breadth, length, belowMinColor, aboveMaxColor,
      heading, note, displaySpec, variableSpec,
    } = this.props;

    const logscale = wmsLogscale(displaySpec, variableSpec);
    const scaleOperator = logscale ? Math.log : identity;
    const range = mapValues(
      scaleOperator,
      wmsDataRange(displaySpec, variableSpec)
    );
    const rangeSpan = range.max - range.min;
    const ticks = wmsTicks(displaySpec, variableSpec);

    const belowAboveLength = (100 - length) /2;  //%
    const width = getOr(0, 'current.offsetWidth', this.thing);
    const imageWidth = width * length / 100;

    return (
      <div className={styles.all} ref={this.thing}>
        { heading }
        <div className={styles.allColours}>
          <span
            className={styles.belowabove}
            style={{
              'background-color': belowMinColor,
              height: breadth,
              width: `${belowAboveLength}%`,
            }}
          />
          <img
            className={styles.image}
            style={{
              height: imageWidth,
              'margin-top': -imageWidth + breadth/2,
              'margin-left': -breadth,
              'margin-right': `${length}%`,
            }}
            src={getColorbarURI(
              displaySpec,
              variableSpec,
              breadth,
              Math.round(imageWidth)
            )}
          />
          <span
            className={styles.belowabove}
            style={{
              'background-color': aboveMaxColor,
              height: breadth,
              width: `${belowAboveLength}%`,
            }}
          />
        </div>
        <div
          className={styles.ticks}
          style={{ width: `${length}%` }}
        >
          {
            // <span>s containing tick labels are positioned relative to
            // their enclosing div; a value of `left` in % makes it very
            // easy to place them correctly.
            map(
              tick => {
                const position =
                  (scaleOperator(tick) - range.min) / rangeSpan;
                return (
                  <span
                    style={{
                      left: `${position * 100}%`
                    }}
                  >
                    {tick}
                  </span>
                )
              }
            )(ticks)
          }
        </div>
        { note }
      </div>
    );
  }
}
