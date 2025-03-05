"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allCards = void 0;
const unit_cards_1 = require("./unit-cards");
const gear_cards_1 = require("./gear-cards");
// Combine both arrays into one array containing both types of cards
exports.allCards = [...unit_cards_1.unitCards, ...gear_cards_1.gearCards];
