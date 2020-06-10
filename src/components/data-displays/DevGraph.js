import React from 'react';
import T from '../../temporary/external-text';
import C3Chart from '../graphs/C3Chart';
import map from 'lodash/fp/map';


export default class DevColourbar extends React.Component {
  static contextType = T.contextType;
  getConfig = path => T.get(this.context, path, {}, 'raw');

  render() {
    return map(
      chart => (
        <React.Fragment>
          <h3>{chart.title}</h3>
          <p>{chart.comment}</p>
          <C3Chart
            // id={'chart.title'}
            {...chart.options}
          />
        </React.Fragment>
      )
    )(this.getConfig('dev-graph.charts'));
  }
}
