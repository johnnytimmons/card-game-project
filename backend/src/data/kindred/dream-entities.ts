// data/kindred/dream-entities.ts
import { 
    Card, 
    BoardCard,
    SpellCard, 
    GearCard, 
    CardOrigin, 
    CardPower 
  } from "../../models/cardModel";

// Define a type for our evolution group structure-------------------------------------------------
export interface DreamWispEntityGroup {
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
      id?: string;
      handCard?: Card;
      boardCard?: BoardCard;
      spell?: SpellCard;
      gear?: GearCard;
    };
  };
  getHandCards(): Card[];
  getBoardCards(): BoardCard[];
  getSpells(): SpellCard[];
  getGear(): GearCard[];
}

// Create the Dream evolution group--------------------------------------------------------------
export const dreamWispEntityGroup: DreamWispEntityGroup = {
  name: "Dream Wisp Evolution Line",
  description: "The evolution path of dream wisp from a simple Kin to a powerful guardian Kindred",
  
  evolutionStages: {
    // First stage
    dreamWisp: {
      base: {
        name: "Dream Wisp",
        origin: "Dream" as CardOrigin,
        power: "Kin" as CardPower,
        description: "A mystical essence of dreams that manifests in various forms"
      },
  
  // Unit form (card in hand)
  handCard: {
    id: 1,
    name: "Dream Wisp",
    type: "Card",
    origin: "Dream",
    power: "Kin",
    usageTypes: ["Creature", "Spell"],
    health: 15,
    damage: 10,
    abilities: "Dreamtouch",
    description: "A small, ethereal creature of dreams",
    evolution: {
        canEvolve: true,
        evolvesToId: 2,
        evolutionConditions: ["Survive 3 turns"]
      }
   } as Card,

    // Creature form (when placed on board)
    boardCard: {
      id: 1,
      name: "Dream Wisp",
      type: "Unit",
      origin: "Dream",
      power: "Kin",
      usageTypes: ["Unit"],
      health: 15,
      damage: 10,
      abilities: "Dreamtouch",
      description: "A small, ethereal creature of dreams",
      position: { row: 0, col: 0 }, // Initial position, will be updated when placed
      playerId: "", // Will be set when placed
      currentHealth: 15,
      isExhausted: false,
      tempEffects: {},
      unit: [], // Required by Card interface
      evolution: {
          canEvolve: true,
          evolvesToId: 2,
          evolutionConditions: ["Survive 3 turns"]
      }
      } as BoardCard,
  
   // Spell form
   spell: {
    id: 101,
    name: "Dream Fog",
    type: "Spell",
    origin: "Dream",
    power: "Kin",
    usageTypes: ["Spell"],
    effect: "Target creature falls asleep for 1 turn",
    targetType: "Single",
    description: "A mystical spell that induces a dreamy slumber",
    abilities: "sleep"
    
  } as SpellCard,
  
},

// Evolved form: Dream Guardian
dreamGuardian: {
    base: {
      name: "Dream Guardian",
      origin: "Dream" as CardOrigin,
      power: "Kindred" as CardPower,
      description: "An evolved Dream Wisp, now a powerful guardian of the dream realm"
    },
  
   // Unit form (card in hand)
   handCard: {
    id: 2,
    name: "Dream Guardian",
    type: "Card",
    origin: "Dream",
    power: "Kindred",
    usageTypes: ["Creature" , "Spell" , "Gear"],
    health: 30,
    damage: 25,
    abilities: ["Dreamshield", "Dreamtouch"],
    description: "A powerful guardian formed from dream essence",
    evolvedFrom: 1
  } as Card,
  

  // Creature form (when placed on board)
  boardCard: {
    id: 2,
    name: "Dream Guardian",
    type: "BoardCard",
    origin: "Dream",
    power: "Kindred",
    usageTypes: ["Unit"],
    health: 30,
    damage: 25,
    abilities: ["Dreamshield", "Dreamtouch"],
    description: "A powerful guardian formed from dream essence",
    position: { row: 0, col: 0 }, // Initial position
    playerId: "", // Will be set when placed
    currentHealth: 30,
    isExhausted: false,
    tempEffects: {},
    unit: [], // Required by Card interface
    evolvedFrom: 1
  } as BoardCard,

 // Spell form
  spell: {
    id: 102,
    name: "Dream Guard",
    type: "Spell",
    origin: "Dream",
    power: "Kindred",
    usageTypes: ["Spell"],
    effect: "All friendly creatures gain +1 defense until your next turn for every dream creature deployed",
    targetType: "Area",
    description: "A protective aura that shields allies",
    abilities: "Sleep Guard"
  } as SpellCard,

  gear: {
    id: 201,
    name: "Dream Essence",
    type: "Gear",
    origin: "Dream",
    power: "Kin",
    usageTypes: ["Gear"],
    abilities: ["Dreamflow"],
    description: "Ethereal gear infused with dream essence"
  } as GearCard
}
},
// Helper methods to extract all cards of a specific type
getHandCards(): Card[] {
  return Object.values(this.evolutionStages)
    .map(stage => stage.handCard)
    .filter((unit): unit is Card => unit !== undefined);
},

getBoardCards(): BoardCard[] {
  return Object.values(this.evolutionStages)
    .map(stage => stage.boardCard)
    .filter((unit): unit is BoardCard => unit !== undefined);
},

getSpells(): SpellCard[] {
  return Object.values(this.evolutionStages)
    .map(stage => stage.spell)
    .filter((spell): spell is SpellCard => spell !== undefined);
},

getGear(): GearCard[] {
  return Object.values(this.evolutionStages)
    .map(stage => stage.gear)
    .filter((gear): gear is GearCard => gear !== undefined);
}
};


// Export the entire group as the default export
export default dreamWispEntityGroup;

// For convenience, also export individual stages
export const dreamWisp = dreamWispEntityGroup.evolutionStages.dreamWisp;
export const dreamGuardian = dreamWispEntityGroup.evolutionStages.dreamGuardian;