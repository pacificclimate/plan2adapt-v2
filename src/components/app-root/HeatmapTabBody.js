import React from 'react';
import PropTypes from 'prop-types';
import ImpactsHeatmap from '../../data-displays/Heatmap/ImpactsHeatmap';

const HeatmapTabBody = ({ rulebase, ruleValues }) => (
    <div className="heatmap-tab-body">
        <ImpactsHeatmap rulebase={rulebase} ruleValues={ruleValues} />
    </div>
);

HeatmapTabBody.propTypes = {
    rulebase: PropTypes.array.isRequired,
    ruleValues: PropTypes.object.isRequired,
};

export default HeatmapTabBody;
