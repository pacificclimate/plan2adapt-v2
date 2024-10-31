import React from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import './ImpactsHeatmap.css';

const getCategorySectorHeatmapData = (rulebase, ruleValues) => {
  const categorySectorData = {};

  rulebase.forEach((rule) => {
    const { id, category, sector, effects } = rule;
    const isActive = ruleValues[id];

    // Skip internal rules by checking if effects equal "Internal rule"
    if (effects === "Internal rule") return;

    if (!categorySectorData[category]) {
      categorySectorData[category] = {};
    }
    if (!categorySectorData[category][sector]) {
      categorySectorData[category][sector] = { total: 0, active: 0, effects: [] };
    }

    categorySectorData[category][sector].total += 1;
    if (isActive) {
      categorySectorData[category][sector].active += 1;
      categorySectorData[category][sector].effects.push(effects); // Store effects for active rules
    }
  });

  const heatmapData = {};
  Object.keys(categorySectorData).forEach((category) => {
    heatmapData[category] = {};
    Object.keys(categorySectorData[category]).forEach((sector) => {
      const { total, active, effects } = categorySectorData[category][sector];
      heatmapData[category][sector] = { proportion: active / total, active, total, effects };
    });
  });

  return heatmapData;
};

const ImpactsHeatmap = ({ rulebase, ruleValues }) => {
  const heatmapData = getCategorySectorHeatmapData(rulebase, ruleValues);
  const sectors = Object.keys(heatmapData);
  const categories = Array.from(
    new Set(
      Object.values(heatmapData).flatMap(sectorData => Object.keys(sectorData))
    )
  ).sort();

  return (
    <div className="heatmap-container">
      <h3>Impact Category - Sector Heatmap</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 border-b-2 border-r-2 border-gray-300">Sector</th>
              {categories.map(category => (
                <th key={category} className="p-2 text-center border-b-2 border-gray-300">
                  {category}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sectors.map((sector) => (
              <tr key={sector}>
                <td className="p-2 border-r-2 border-gray-300 font-bold text-right">
                  {sector}
                </td>
                {categories.map((category) => {
                  const data = heatmapData[sector]?.[category] || { proportion: 0, active: 0, total: 0, effects: [] };
                  const { proportion, active, total, effects } = data;
                  const colorClass = proportion >= 0.75
                    ? "high"
                    : proportion >= 0.5
                      ? "moderate"
                      : proportion >= 0.25
                        ? "low"
                        : proportion === 0
                          ? "zero-percent"
                          : "very-low";

                  const tooltipContent = effects.length
                    ? effects.map(effect => `<div>${effect}</div>`).join('')
                    : 'No active rules for this category';

                  return (
                    <td
                      key={`${sector}-${category}`}
                      className={`sector-cell ${colorClass}`}
                      data-tip={tooltipContent}
                    >
                      {proportion === 0 ? '—' : `${Math.round(proportion * 100)}% (${active}/${total})`}
                      <ReactTooltip multiline html />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};



ImpactsHeatmap.propTypes = {
  rulebase: PropTypes.array.isRequired,
  ruleValues: PropTypes.object.isRequired,
};

export default ImpactsHeatmap;
