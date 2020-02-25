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
};
