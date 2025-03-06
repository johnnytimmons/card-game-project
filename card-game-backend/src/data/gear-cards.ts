// data/gear-cards.ts
import { GearCard } from "../models/cardModel";

// Define all gear cards in the game
export const gearCards: GearCard[] = [
  { id: 100, name: 'Shield', type: 'Defense', ability: "Increases +10 Def" },
  { id: 101, name: 'Pulse Fist', type: 'Weapon', damage: 15, ability: "Can Attack Diagonally" },
  { id: 102, name: 'Grav Boots', type: 'Movement', ability: "Can move placement without using turn" },
  { id: 103, name: 'Razor', type: 'Weapon', damage: 25, ability: "Ignores shield effects" },
  { id: 104, name: 'Cloak', type: 'Movement', ability: "Cannot be targetted by opponent until it attacks" },
  { id: 105, name: 'Stim Pack', type: 'Defense', damage: 10 , ability: "Reduces -5 Def" },
  { id: 106, name: 'Med Pen', type: 'Heal', ability: "Restores +20 Health" }
];

