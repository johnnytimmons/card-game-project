// data/unit-cards.ts
import { UnitCard } from "../models/cardModel";

// Define all unit cards in the game
export const unitCards: UnitCard[] = [
  { id: 1, name: 'Darrowe', type: 'Hero', health: 30, damage: 30, ability: "Inspire" },
  { id: 2, name: 'Howler', type: 'Unit', health: 10, damage: 20, ability: "Swiftness" },
  { id: 3, name: 'Bear', type: 'Creature', health: 40, damage: 25, defense: 5 },
  { id: 4, name: 'Sentinel', type: 'Automaton', health: 40, damage: 10, ability: "Defensive" },
  { id: 5, name: 'Mustang', type: 'Hero', health: 25, damage: 20, ability: "Tactics" },
  { id: 6, name: 'Sevro', type: 'Hero', health: 20, damage: 25, ability: "Sneak Attack" },
  { id: 7, name: 'Obsidian', type: 'Unit', health: 35, damage: 25, defense: 5,  ability: "Berserker" },
  { id: 8, name: 'Griffin', type: 'Creature', health: 30, damage: 30, ability: "Flight" },
  { id: 9, name: 'Claw Drill', type: 'Vehicle', health: 50, damage: 15, defense: 10, ability: "Tunnel" },
  { id: 10, name: 'Ripwing', type: 'Vehicle', health: 25, damage: 30, ability: "Swiftness" },
  { id: 11, name: 'Thunderwing', type: 'Vehicle', health: 40, damage: 10, defense: 5, ability: "Bombing Run" }

];