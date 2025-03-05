import React from "react";
import { Card } from "../../../card-game-backend/src/models/cardModel";
import CardDisplay from "./cardDisplay";

// A component to handle the card list - displays cards in a horizontal line
const CardList: React.FC<{ cards: Card[] }> = ({ cards }) => {
  if (cards.length === 0) {
    return <div className="empty-state">No cards drawn yet.</div>;
  }

  return (
    <ul className="card-list">
      {cards.map(card => <CardDisplay key={card.id} card={card} />)}
    </ul>
  );
};

export default CardList;