"use strict";
// src/components/unit-cards.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCards = exports.sampleCards = void 0;
exports.sampleCards = [
    { id: 1, name: 'Darrowe', type: 'Hero', health: 30, damage: 30 },
    { id: 2, name: 'Howler', type: 'Unit', health: 10, damage: 20 },
    { id: 3, name: 'Bear', type: 'Creature', health: 40, damage: 30 },
    { id: 4, name: 'Sentinel', type: 'Automaton', health: 40, damage: 10 }
];
// Optionally, you could also export a function to fetch cards:
const getCards = () => {
    return exports.sampleCards;
};
exports.getCards = getCards;
