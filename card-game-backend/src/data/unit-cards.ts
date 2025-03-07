// data/unit-cards.ts
import { UnitCard } from "../models/cardModel";

// Define all unit cards in the game
export const unitCards: UnitCard[] = [
  { id: 1, name: 'Major Whiskers', type: 'Hero', health: 30, damage: 30, ability: "Leadership" },
  { id: 2, name: 'Ranger Redcoat', type: 'Unit', health: 10, damage: 20, ability: "Scouting" },
  { id: 3, name: 'Bruno', type: 'Creature', health: 40, damage: 25, defense: 5 },
  { id: 4, name: 'Patrol Owl', type: 'Unit', health: 40, damage: 10, ability: "Night Watch" },
  { id: 5, name: 'Captain Barkley', type: 'Hero', health: 25, damage: 20, ability: "Intelligence" },
  { id: 6, name: 'Lieutenant Swift', type: 'Hero', health: 20, damage: 25, ability: "Sabotage" },
  { id: 7, name: 'Sergeant Bristle', type: 'Unit', health: 35, damage: 25, defense: 5, ability: "Heavy Weapons" },
  { id: 8, name: 'Lapin', type: 'Creature', health: 30, damage: 30, ability: "Swift Message" },
  { id: 9, name: 'Armored Farm Truck', type: 'Vehicle', health: 50, damage: 15, defense: 10, ability: "Off-Road" },
  { id: 10, name: 'Stolen Bicycle', type: 'Vehicle', health: 25, damage: 30, ability: "Quick Escape" },
  { id: 11, name: 'Improvised Glider', type: 'Vehicle', health: 40, damage: 10, defense: 5, ability: "Air Drop" }
];