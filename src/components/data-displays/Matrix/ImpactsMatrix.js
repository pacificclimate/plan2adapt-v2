import React from 'react';
import PropTypes from 'prop-types';
import './ImpactsMatrix.css';

const getCategorySectorMatrixData = (rulebase, cellRuleValues) => {
  const categorySectorData = {};

  rulebase.forEach((rule) => {
    const { id, category, sector, effects } = rule;
    const value = cellRuleValues[id] || 0;
    if (effects === "Internal rule") return;

    if (!categorySectorData[category]) {
      categorySectorData[category] = {};
    }
    if (!categorySectorData[category][sector]) {
      categorySectorData[category][sector] = { rules: [] };
    }

    // Push each rule's id, percentage and effects
    categorySectorData[category][sector].rules.push({ id, value, effects });
  });

  const matrixData = {};
  Object.keys(categorySectorData).forEach((category) => {
    matrixData[category] = {};
    Object.keys(categorySectorData[category]).forEach((sector) => {
      const { rules } = categorySectorData[category][sector];
      if (rules.length === 0) {
        matrixData[category][sector] = { maxValue: 0, rules: [] };
        return;
      }

      // Find the rule with the max value
      const maxRule = rules.reduce((maxR, r) => (r.value > maxR.value ? r : maxR), { value: 0, effects: null });

      // Store all rules plus the identified max value
      matrixData[category][sector] = {
        maxValue: maxRule.value,
        rules,
      };
    });
  });

  return matrixData;
};

const ImpactsMatrix = ({ rulebase, cellRuleValues }) => {
  const matrixData = React.useMemo(
    () => getCategorySectorMatrixData(rulebase, cellRuleValues),
    [rulebase, cellRuleValues]
  );

  const sectors = Object.keys(matrixData);
  const categories = Array.from(
    new Set(
      Object.values(matrixData).flatMap(sectorData => Object.keys(sectorData))
    )
  ).sort();

  const [hoveredCell, setHoveredCell] = React.useState(null);

  return (
    <div className="matrix-container">
      <h3>Impact Category - Sector Matrix</h3>
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
                  const data = matrixData[sector]?.[category] || { maxValue: 0, rules: [] };
                  const { maxValue, rules } = data;

                  // Determine cell color class
                  const proportion = maxValue;
                  const displayProportion = Math.round(proportion);
                  const colorClass =
                    rules.length === 0
                      ? "no-rules"
                      : displayProportion < 1
                        ? "zero-percent"
                        : displayProportion >= 75
                          ? "high"
                          : displayProportion >= 50
                            ? "moderate"
                            : displayProportion >= 25
                              ? "low"
                              : "very-low";

                  return (
                    <td
                      key={`${sector}-${category}`}
                      className={`sector-cell ${colorClass}`}
                      onMouseEnter={() => setHoveredCell({ sector, category, rules })}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      {rules.length === 0 ? "—" : `${Math.round(proportion)}%`}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hoveredCell && (
        <div className="mt-4">
          <h4>Rules for {hoveredCell.sector} - {hoveredCell.category}:</h4>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-2 border-b-2 border-gray-300">Percentage</th>
                <th className="p-2 border-b-2 border-gray-300">Rule ID</th>
                <th className="p-2 border-b-2 border-gray-300">Effects</th>
              </tr>
            </thead>
            <tbody>
              {hoveredCell.rules.map((rule, index) => (
                <tr key={rule.id}>
                  <td
                    className={`p-2 border-b border-gray-300 sector-cell ${getColorClass(rule.value)}`}
                  >
                    {rule.value.toFixed(2)}%
                  </td>
                  <td className="p-2 border-b border-gray-300">{rule.id}</td>
                  <td className="p-2 border-b border-gray-300">{rule.effects}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const getColorClass = (value) => {
  if (value < 1) {
    return 'zero-percent';
  } else if (value >= 75) {
    return 'high';
  } else if (value >= 50) {
    return 'moderate';
  } else if (value >= 25) {
    return 'low';
  } else {
    return 'very-low';
  }
};

ImpactsMatrix.propTypes = {
  rulebase: PropTypes.array.isRequired,
  cellRuleValues: PropTypes.object.isRequired,
};

export default ImpactsMatrix;