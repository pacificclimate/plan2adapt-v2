import React from 'react';
import PropTypes from 'prop-types';
import './ImpactsMatrix.css';

const getCategorySectorMatrixData = (rulebase, cellRuleValues) => {
  const categorySectorData = {};

  rulebase.forEach(({ id, category, sector, effects }) => {
    if (effects === "Internal rule") return;

    const value = cellRuleValues[id] || 0;

    if (!categorySectorData[category]) {
      categorySectorData[category] = {};
    }
    if (!categorySectorData[category][sector]) {
      categorySectorData[category][sector] = { rules: [] };
    }

    categorySectorData[category][sector].rules.push({ id, value, effects });
  });


  const matrixData = {};
  Object.entries(categorySectorData).forEach(([category, sectorData]) => {
    matrixData[category] = {};

    Object.entries(sectorData).forEach(([sector, { rules }]) => {
      if (rules.length === 0) {
        matrixData[category][sector] = { maxValue: 0, rules: [], uniqueValues: [] };
        return;
      }

      const uniqueValues = [...new Set(rules.map(r => Number(r.value.toFixed(2))))];
      const maxRule = rules.reduce((maxR, r) => (r.value > maxR.value ? r : maxR), { value: 0 });

      matrixData[category][sector] = { maxValue: maxRule.value, rules, uniqueValues };
    });
  });

  return matrixData;
};

const ImpactsMatrix = ({ rulebase, cellRuleValues }) => {
  const matrixData = React.useMemo(
    () => getCategorySectorMatrixData(rulebase, cellRuleValues),
    [rulebase, cellRuleValues]
  );

  const sectors = Object.keys(matrixData).sort();
  const categories = Array.from(
    new Set(Object.values(matrixData).flatMap(sectorData => Object.keys(sectorData)))
  ).sort();

  const [selectedCell, setSelectedCell] = React.useState(null);

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
            {sectors.map(sector => (
              <tr key={sector}>
                <td className="p-2 border-r-2 border-gray-300 font-bold text-right">{sector}</td>
                {categories.map(category => {
                  const { rules = [], uniqueValues = [] } = matrixData[sector]?.[category] || {};

                  const isSelected =
                    selectedCell &&
                    selectedCell.sector === sector &&
                    selectedCell.category === category;

                  return (
                    <td
                      key={`${sector}-${category}`}
                      className={`sector-cell ${isSelected ? "selected-cell" : ""}`}
                      onClick={() => setSelectedCell({ sector, category, rules })}
                    >
                      {rules.length === 0 ? (
                        "—"
                      ) : (
                        <div className="partition-container">
                          {uniqueValues.map((value, index) => (
                            <div
                              key={`${value}-${index}`}
                              className={`partition ${getColorClass(value)}`}
                              style={{ flex: 1 }}
                            >
                              {value.toFixed(1)}%
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedCell && (
        <div className="details-container mt-4">
          <h4>
            Details for {selectedCell.sector} - {selectedCell.category}:
          </h4>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-2 border-b-2 border-gray-300">Percentage</th>
                <th className="p-2 border-b-2 border-gray-300">Rule ID</th>
                <th className="p-2 border-b-2 border-gray-300">Effects</th>
              </tr>
            </thead>
            <tbody>
              {selectedCell.rules.map(rule => (
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

const getColorClass = value => {
  if (value < 1) return 'zero-percent';
  if (value >= 75) return 'high';
  if (value >= 50) return 'moderate';
  if (value >= 25) return 'low';
  return 'very-low';
};

ImpactsMatrix.propTypes = {
  rulebase: PropTypes.array.isRequired,
  cellRuleValues: PropTypes.object.isRequired,
};

export default ImpactsMatrix;
