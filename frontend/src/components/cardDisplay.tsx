import React, { useMemo } from "react";
import { Card } from "../../../backend/src/models/cardModel";
import "./cardTypeLabels.css";
import "./hoverCard.css";

//====================================================================!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
export const CardDisplay: React.FC<{
  card: Card;
  isInHand?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
  isPlaceable?: boolean; // Added prop for placeable status
}> = React.memo(({ card, isInHand = false, onClick, style }) => {
  // Get background image based on card type===============================================
  const getCardBackground = () => {
    if (["Hero", "Unit", "Creature", "Evolution Kin"].includes(card.type)) {
      return "/assets/backgrounds/unit-background.svg";
    }
    if (card.type === "Gear") {
      return "/assets/backgrounds/gear-background.svg";
    }
    if (card.type === "Spell") {
      return "/assets/backgrounds/spell-background.svg";
    }
    return "/assets/backgrounds/unit-background.svg";
  };
  /* if (card.type === "Gear")
      return "/assets/cards/backgrounds/lightBackground.png";
    if (card.type === "Spell")
      if (!card) return "/assets/cards/artwork/default.png";
    return "/assets/cards/artwork/default.png";
  };
*/
  // Get card artwork based on card name/id
  const getCardArtwork = () => {
    const letter = card.name ? card.name.charAt(0) : "C";
    if (card.type === "Unit") {
      return "/assets/artwork/unit-default.png";
    } else if (card.type === "Gear") {
      return "/assets/artwork/gear-default.jpg";
    } else if (card.type === "Spell") {
      return "/assets/artwork/spell-default.jpg";
    } else {
      return "/assets/artwork/unit-default.png";
    }
  };
  /* if (!card) return "/assets/cards/artwork/default.png";
    // Convert card name to URL-friendly format
    // Convert card name to URL-friendly format
    const artName =
      card.name?.toLowerCase().replace(/\s+/g, "-") || `card-${card.cardId}`;
    //return `/assets/cards/artwork/${artName}.png`;
    return `/assets/cards/artwork/default.png`;
  };
*/
  // If card is undefined, you might want to render nothing or a placeholder
  if (!card) {
    return null; // Or return a placeholder card
  }
  //===========================================================================================

  // Memoize the card type category calculation
  const cardTypeCategory = useMemo(
    () => getCardTypeCategory(card.type),
    [card.type]
  );

  // Memoize ability checks
  const hasAbility = useMemo(
    () => "abilities" in card && card.abilities,
    [card.abilities]
  );
  const hasDamage = useMemo(
    () => "damage" in card && typeof card.damage === "number",
    [card.damage]
  );
  const hasHealth = useMemo(
    () => "health" in card && typeof card.health === "number",
    [card.health]
  );
  const hasDefense = useMemo(
    () => "defense" in card && typeof card.defense === "number",
    [card.defense]
  );

  // Memoize header color
  const headerColor = useMemo(
    () => getHeaderColor(cardTypeCategory),
    [cardTypeCategory]
  );

  // Memoize abilities display
  const abilities = useMemo(
    () => displayAbilities(card.abilities),
    [card.abilities]
  );
  // Helper functions moved outside the component
  function getCardTypeCategory(type: string): string {
    // Unit types
    if (["Hero", "Unit"].includes(type)) {
      return "UNIT";
    }
    // Gear types
    else if (["Gear"].includes(type)) {
      return "GEAR";
    }
    // Spell types
    else if (["Spell"].includes(type)) {
      return "SPELL";
    }
    // Default
    return "UNIT";
  }

  function getHeaderColor(cardTypeCategory: string) {
    switch (cardTypeCategory) {
      case "UNIT":
        return "#ff5c8d";
      case "GEAR":
        return "#63c7ff";
      case "SPELL":
        return "#7b6ef6";
      default:
        return "#2979ff";
    }
  }

  function displayAbilities(abilities: string | string[] | undefined) {
    if (!abilities) return "";
    if (typeof abilities === "string") return abilities;
    if (Array.isArray(abilities)) return abilities.join(", ");
    return "";
  }
  // Use the CSS class structure from hoverCard.css
  return (
    <div
      className="card-container"
      onClick={onClick}
      style={{
        ...style,
        cursor: onClick ? "pointer" : "default", // Add this line for better UX
      }}
    >
      {/* Base card with artwork */}
      <div className="card-base">
        {/* Card artwork as the base layer */}
        <div className="card-artwork">
          <img
            src={getCardArtwork()}
            alt={card.name || "Card"}
            onError={(e) => {
              e.currentTarget.src = "/assets/cards/artwork/default.png";
            }}
          />
        </div>
      </div>

      {/* Card frame with transparent center overlaid on top */}
      <div
        className="card-frame"
        style={{
          backgroundImage: `url(${getCardBackground()})`,
          backgroundSize: "cover",
        }}
        onClick={onClick} // Add this line to also make the frame clickable
      >
        {/* Card name */}
        <div className="card-name">{card.name}</div>

        {/* Card type */}
        <div className="card-type">{card.type}</div>

        {/* Card stats */}
        <div className="card-stats">
          {card.damage !== undefined && (
            <div className="stat damage">
              <span className="stat-value">{card.damage}</span>
            </div>
          )}
          {card.health !== undefined && (
            <div className="stat health">
              <span className="stat-value">{card.health}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default CardDisplay;
