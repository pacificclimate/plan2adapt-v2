// Region selector component. Selector contents are populated asynchronously
// by a one-time fetch from a server via the regions data service module.
//
// To manage asynchronous data fetching, this component follows React best
// practice:
// https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#fetching-external-data

import PropTypes from 'prop-types';
import React from 'react';
import Select from 'react-select';
import { fetchRegions } from '../../../data-services/regions';
import flow from 'lodash/fp/flow';
import map from 'lodash/fp/map';
import groupBy from 'lodash/fp/groupBy';
import { mapWithKey } from 'pcic-react-components/dist/utils/fp';


export default class RegionSelector extends React.Component {
  static propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func,
  };

  state = {
    regions: null,
  };

  componentDidMount() {
    this._asyncRequest = fetchRegions().then(
      // Transform GeoJSON response to options for React Select.
      // Options are grouped in the selector by the value of each feature's
      // `feature.properties.group`.
      // Option labels (visible to user) are the name of the region.
      // Option values (used by code) are the entire feature for each option,
      // except for the case of the entirety of BC, which has a null feature
      // to prevent unnecessary laborious subsetting of the data. This choice
      // may prove unwise; it is extremely simple to remove.
      data => {
        this._asyncRequest = null;
        const regions = flow(
          groupBy(feature => feature.properties.group),
          mapWithKey((features, group) => ({
            label: group,
            options: map(
              feature => ({
                label: feature.properties.english_na,
                // 'bc-regions-polygon.1' is the whole province; we don't
                // want a polygon for that.
                value: feature.id === 'bc-regions-polygon.1' ? null : feature,
              })
            )(features)
          })),
        )(data.features);
        this.setState({ regions });
      }
    )
  }

  render() {
    return (
      <Select
        isSearchable
        isLoading={this.state.regions === null}
        // loadingMessage={'Loading...'}
        options={this.state.regions || []}
        value={this.props.value}
        onChange={this.props.onChange}
      />
    );
  }
}
