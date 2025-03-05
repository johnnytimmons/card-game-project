// data/all-cards.ts
import { Card } from "../models/cardModel";
import { unitCards } from "./unit-cards";
import { gearCards } from "./gear-cards";

// Combine both arrays into one array of Card type
export const allCards: Card[] = [...unitCards, ...gearCards];