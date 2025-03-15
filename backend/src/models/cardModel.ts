
export type CardOrigin = 'Dream' | 'Memory' | 'Promise';
export type CardPower = 'Kin' | 'Kindred' | 'Shadow';
// Basic card interface that all cards share-------------------------------------------------

// Base Card type for all cards
export interface Card {
  id: number;
  unit: [];
  name: string;
  type: string;
  origin: CardOrigin;
  power: CardPower;
  description?: string;
  abilities?: string | string[];
  damage?: number;
  health?: number;
  defense?: number;
  evolution?: EvolutionInfo;
  evolvedFrom?: number;
  usageTypes: ('Unit' | 'Spell' | 'Gear' | 'Card')[];
}

export interface BoardCard extends Card {
  type: string;
  position: { row: number, col: number };
  playerId: string;
  currentHealth: number;
  isExhausted: boolean;
  damage: number; // Explicitly make damage required
  tempEffects: {
    damageBuff?: number;
    defenseBuff?: number;
    statusEffects?: Map<string, number>;
    currentHealth?: string;
  };
}

// Spells are one-time effects-------------------------------------------------------------------
export interface SpellCard extends Card {
  type: string;
  effect: string;
  damage: number;
  targetType: 'Single' | 'Area' | 'All';
}

// Gear can be equipped to units-------------------------------------------------------------------
export interface GearCard extends Card {
  type: string;
  defense?: number;
  abilities?: string | string[];
}

// Evolution information-----------------------------------------------------------------------------
export interface EvolutionInfo {
  canEvolve: boolean;
  evolvesToId?: number;
  evolutionConditions?: string[];
}

// Union type for all card types
export type Cards = Card | BoardCard | SpellCard | GearCard;








