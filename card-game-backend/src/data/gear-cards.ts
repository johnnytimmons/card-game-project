// data/gear-cards.ts
import { GearCard } from "../models/cardModel";

// Define all gear cards in the game
export const gearCards: GearCard[] = [
  { id: 100, name: 'Makeshift Armor', type: 'Defense', ability: "Increases +10 Def" },
  { id: 101, name: 'Resistance Pistol', type: 'Weapon', damage: 15, ability: "Can Attack Diagonally" },
  { id: 102, name: 'Silent Paws', type: 'Movement', ability: "Can move position without using turn" },
  { id: 103, name: 'Sabotage Kit', type: 'Weapon', damage: 25, ability: "Ignores shield effects" },
  { id: 104, name: 'Camouflage Net', type: 'Movement', ability: "Cannot be targeted by opponent until it attacks" },
  { id: 105, name: 'Adrenaline Shot', type: 'Defense', damage: 10, ability: "Reduces -5 Def" },
  { id: 106, name: 'Field Medic Kit', type: 'Heal', ability: "Restores +20 Health" }
];