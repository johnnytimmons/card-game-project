import {
  CardOrigin,
  CardPower,
  BoardCard,
  SpellCard,
  GearCard,
  Card,
} from "./cardModel";

//Take generic stuff put in this entity group, make a base level class -- so every card, no matter which group will be using the same class (getHandCards) structure
//Help to write cards interact with one another, based on same ideas
// Define a type for our evolution group structure-------------------------------------------------
//Call CardEntityGroup that every single card will use
export interface EntityGroupConfig {
  name: string;
  description: string;
  evolutionStages: {
    [stageName: string]: {
      base: {
        name: string;
        origin: CardOrigin;
        power: CardPower;
        description: string;
      };
      handCard?: Card;
      boardCard?: BoardCard;
      spell?: SpellCard;
      gear?: GearCard;
    };
  };
}

class EntityGroup {
  public config: EntityGroupConfig;
  constructor(config: EntityGroupConfig) {
    this.config = config;
  }

  // Helper methods to extract all cards of a specific type
  getHandCards(): Card[] {
    return Object.values(this.config.evolutionStages)
      .map((stage) => stage.handCard)
      .filter((unit): unit is Card => unit !== undefined);
  }

  getBoardCards(): BoardCard[] {
    return Object.values(this.config.evolutionStages)
      .map((stage) => stage.boardCard)
      .filter((unit): unit is BoardCard => unit !== undefined);
  }

  getSpells(): SpellCard[] {
    return Object.values(this.config.evolutionStages)
      .map((stage) => stage.spell)
      .filter((spell): spell is SpellCard => spell !== undefined);
  }

  getGear(): GearCard[] {
    return Object.values(this.config.evolutionStages)
      .map((stage) => stage.gear)
      .filter((gear): gear is GearCard => gear !== undefined);
  }
}

export default EntityGroup;
