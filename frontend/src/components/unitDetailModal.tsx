import React from "react";
import ReactDOM from "react-dom";
import "./UnitDetailModal.css";

interface UnitDetailModalProps {
  unit: any;
  position: { left: number; top: number };
  isVisible: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const UnitDetailModal: React.FC<UnitDetailModalProps> = ({
  unit,
  position,
  isVisible,
  onMouseEnter,
  onMouseLeave,
}) => {
  if (!isVisible || !unit) return null;

  // Log the unit to see its structure
  console.log("Modal displaying unit:", unit);

  // Try to get name and type from all possible locations
  const name =
    unit.name ||
    unit.baseUnit?.name ||
    unit.cardDetails?.name ||
    "Unknown Unit";
  const type =
    unit.type || unit.baseUnit?.type || unit.cardDetails?.type || "Unit";

  // Same for other properties
  const damage =
    unit.damage ||
    unit.equippedUnit?.effectiveDamage ||
    unit.baseUnit?.damage ||
    0;
  const health =
    unit.currentHealth ||
    unit.equippedUnit?.effectiveHealth ||
    unit.baseUnit?.health ||
    0;
  const defense = unit.defense || unit.equippedUnit?.defense || 0;

  // Get abilities from all possible locations
  const abilitiesRaw =
    unit.abilities || unit.baseUnit?.abilities || unit.baseUnit?.ability || [];
  const formattedAbilities = Array.isArray(abilitiesRaw)
    ? abilitiesRaw
    : [abilitiesRaw].filter(Boolean);

  // Get equipment (if any)
  const equipment = unit.equippedGear || [];

  // Modal content
  const modalContent = (
    <div
      className="unit-detail-modal"
      style={{
        left: `${position.left}px`,
        top: `${position.top - 20}px`,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="unit-modal-header">
        <h3>{name}</h3>
        <span className="unit-type">{type}</span>
      </div>

      <div className="unit-modal-stats">
        <div className="stat-item">
          <span className="stat-icon">⚔️</span>
          <span className="stat-value">{damage}</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">❤️</span>
          <span className="stat-value">{health}</span>
        </div>
        {defense > 0 && (
          <div className="stat-item">
            <span className="stat-icon">🛡️</span>
            <span className="stat-value">{defense}</span>
          </div>
        )}
      </div>

      {formattedAbilities.length > 0 && (
        <div className="unit-modal-abilities">
          <h4>Abilities</h4>
          <ul className="ability-list">
            {formattedAbilities.map((ability, index) => (
              <li key={index} className="ability-item">
                {ability}
              </li>
            ))}
          </ul>
        </div>
      )}

      {equipment.length > 0 && (
        <div className="unit-modal-equipment">
          <h4>Equipment</h4>
        </div>
      )}
    </div>
  );

  // Use React Portal to render this outside the normal document flow
  return ReactDOM.createPortal(modalContent, document.body);
};

export default UnitDetailModal;
