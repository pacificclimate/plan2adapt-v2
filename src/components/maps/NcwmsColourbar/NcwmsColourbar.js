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

import PropTypes from 'prop-types';
import React from 'react';
import getOr from 'lodash/fp/getOr';
import identity from 'lodash/fp/identity';
import map from 'lodash/fp/map';
import mapValues from 'lodash/fp/mapValues';
import styles from './NcwmsColourbar.module.css';
import { makeURI } from '../../../utils/uri';
import {
  getWmsDataRange,
  getWmsLogscale,
  wmsNumcolorbands,
  getWmsPalette,
  getWmsTicks,
  getWmsAboveMaxColor,
  getWmsBelowMinColor,
} from '../map-utils';


// TODO: Move to data-services.
const getColorbarURI = (displaySpec, variableId, width, height) =>
  makeURI(
    process.env.REACT_APP_NCWMS_URL,
    {
      request: 'GetLegendGraphic',
      colorbaronly: 'true',
      width,
      height,
      palette: getWmsPalette(displaySpec, variableId),
      numcolorbands: wmsNumcolorbands,
    }
  );


export default class NcwmsColourbar extends React.Component {
  static propTypes = {
    breadth: PropTypes.number,
    // Size of smaller (vertical) dimension, px.

    length: PropTypes.number,
    // Fraction (%) of width of container that colourbar graphic occupies.

    title: PropTypes.element,
    // Title element, placed above colourbar

    note: PropTypes.element,
    // Note element, placed below colourbar

    variableSpec: PropTypes.object,

    // TODO: Rename to variableConfig
    displaySpec: PropTypes.object,
    // Display spec
  };

  static defaultProps = {
    breadth: 20,
    length: 80,
  };

  // Peculiarity: We need to get the width of the container (<div/> returned by
  // this component. The canonical way to do that is to use a React ref to the
  // container (the DOM element), and use the value of
  // `ref.current.offsetWidth`. However, in the `render` component, the DOM
  // element can and sometimes does have no dimension. In particular, when
  // changing tabs, one effect of hiding the unselected tab panels is to
  // give their elements zero width. This dimensionless state is transient, but
  // there appears to be no way to avoid it in `render`. React documentation
  // (https://reactjs.org/docs/refs-and-the-dom.html#adding-a-ref-to-a-dom-element)
  // states that "ref updates happen before componentDidMount or
  // componentDidUpdate lifecycle methods." This suggests that valid widths
  // might be obtainable in these hooks. Experimentation indicates this is true.
  // Hence we store width in state, so that the component is re-rendered when
  // width changes, and update this state in these lifecycle methods.

  state = {
    width: 0,
  };

  constructor(props) {
    super(props);
    this.thing = React.createRef();
  }

  updateWidth = () => {
    const width = getOr(0, 'current.offsetWidth', this.thing);
    if (width > 0 && width !== this.state.width) {
      this.setState({ width });
    }
  };

  componentDidMount() {
    this.updateWidth();
  }

  componentDidUpdate() {
    this.updateWidth();
  }

  render() {
    const {
      breadth, length,
      heading, note, displaySpec, variableSpec,
    } = this.props;

    const variableId = variableSpec.variable_id;

    const logscale = getWmsLogscale(displaySpec, variableId);
    const scaleOperator = logscale ? Math.log : identity;
    const range = getWmsDataRange(displaySpec, variableId);
    const rangeScale = mapValues(scaleOperator, range);
    const rangeSpan = rangeScale.max - rangeScale.min;
    const ticks = getWmsTicks(displaySpec, variableId);

    const belowAboveLength = (100 - length) /2;  //%
    const width = this.state.width;
    const imageWidth = Math.round(width * length / 100);

    const belowMinColor = getWmsBelowMinColor(displaySpec, variableId);
    const aboveMaxColor = getWmsAboveMaxColor(displaySpec, variableId);

    return (
      <div className={styles.all} ref={this.thing}>
        { heading }
        <div
          className={styles.allColours}
          style={{ height: breadth + 2 }}
        >
          <span
            className={styles.belowabove}
            style={{
              'background-color': belowMinColor,
              height: breadth,
              width: `${belowAboveLength}%`,
            }}
          />
          {
            // Zero values for imageWidth provoke a 500 error from ncWMS.
            // Avoid this. It does not suffice to render null from this
            // component if this condition is violated; it has to have a chance
            // to render an actual DOM element: hence this.
            imageWidth > 0 &&
            <img
              className={styles.image}
              style={{
                height: imageWidth,
                top: 5,
                'margin-top': -imageWidth,
                'margin-left': -breadth,
                'margin-right': `${length}%`,
              }}
              src={getColorbarURI(displaySpec, variableId, breadth, imageWidth)}
            />
          }
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
          className={styles.belowaboveLabels}
          style={{ width: `${belowAboveLength}%`}}
        >
          {'<'} {range.min}
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
                  (scaleOperator(tick) - rangeScale.min) / rangeSpan;
                return (
                  <span style={{ left: `${position * 100}%` }}>
                    {tick}
                  </span>
                )
              }
            )(ticks)
          }
        </div>
        <div
          className={styles.belowaboveLabels}
          style={{ width: `${belowAboveLength}%`}}
        >
          {'>'} {range.max}
        </div>
        { note }
      </div>
    );
  }
}
