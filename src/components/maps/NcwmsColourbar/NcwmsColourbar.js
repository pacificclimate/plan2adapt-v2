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
//  - Props `width` and `height` are for the unrotated (vertical) graphic;
//    so their meaning is reversed in the rendered graphic. Confusing, sorry.

// TODO: Configuration should be obtained outside this component and passed in;
//  no use of ExternalText here.

import PropTypes from 'prop-types';
import React from 'react';
import get from 'lodash/fp/get';
import map from 'lodash/fp/map';
import T from '../../../temporary/external-text';
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
  // TODO: This component should probably not be getting configuration
  //  values directly from the config file, but be passed them. Why? Because
  //  it is more of a utility than most components, and we should keep it
  //  agnostic about where its config comes from if possible.
  //  OTOH, we do get external texts directly. Sigh.
  static contextType = T.contextType;

  static propTypes = {
    // TODO: Change names
    width: PropTypes.number,
    height: PropTypes.number,

    title: PropTypes.element,
    note: PropTypes.element,

    variableSpec: PropTypes.object,

    displaySpec: PropTypes.object,
    // Display spec
    
    variableConfig: PropTypes.object,
    // Object mapping (scientific) variable names (e.g., 'tasmean') to
    // information used to process and display the variables. Typically this
    // object will be provided from a configuration file, but that is not the
    // job of this component:
    //
    // TODO: Convert this to a more explicit PropType when the layout settles.
    // Example value:
    //  {
    //    tasmean: {
    //      label: 'Temperature',
    //      units: '°C',
    //    },
    //    ...
    //  }
  };

  static defaultProps = {
    width: 20,
    height: 300,
  };

  render() {
    const { width, height, heading, note, displaySpec, variableSpec,  } =
      this.props;
    const logscale = wmsLogscale(displaySpec, variableSpec);
    const range = wmsDataRange(displaySpec, variableSpec);
    const span = range.max - range.min;
    const ticks = wmsTicks(displaySpec, variableSpec);
    return (
      <div
          className={styles.wrapper}
          style={{ width: height + 20 }}
        >
          { heading }
          <img
            className={styles.image}
            style={{
              'margin-top': -height,
              'margin-left': -width,
            }}
            src={getColorbarURI(
              displaySpec,
              variableSpec,
              width,
              height
            )}
          />
          <div className={styles.ticks}>
            {
              // <span>s containing tick labels are positioned relative to
              // their enclosing div; a value of `left` in % makes it very
              // easy to place them correctly.
              map(
                tick => {
                  const position = logscale ?
                    Math.log(tick/range.min) / Math.log(range.max/range.min) :
                    (tick - range.min) / span;
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
