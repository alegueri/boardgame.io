export interface SorobanBead {
  active: boolean;
}

export interface AbacusColumn {
  heavenBead: SorobanBead;
  earthBeads: [SorobanBead, SorobanBead, SorobanBead, SorobanBead];
  placeValue: number;
}

export interface AbacusState {
  columns: AbacusColumn[];
  value: number;
}
