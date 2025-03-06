
export interface UnitCard {
    id: number;
    name: string;
    type: string;
    damage: number;
    health: number;
    ability?: string;
    defense?: number;
  }

  export interface GearCard {
    id: number;
    name: string;
    type: string;
    damage?: number;
    health?: number;
    ability?: string;
  }
  export type Card = UnitCard | GearCard;



