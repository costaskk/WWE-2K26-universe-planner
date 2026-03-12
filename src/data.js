export const defaultBrands = [
  { id: crypto.randomUUID(), name: 'Raw', color: '#c1121f' },
  { id: crypto.randomUUID(), name: 'SmackDown', color: '#2563eb' },
  { id: crypto.randomUUID(), name: 'NXT', color: '#f59e0b' },
];

export const defaultRoster = [
  { id: crypto.randomUUID(), name: 'Roman Reigns', brandId: null, alignment: 'Heel', division: 'Main Event' },
  { id: crypto.randomUUID(), name: 'Cody Rhodes', brandId: null, alignment: 'Face', division: 'Main Event' },
  { id: crypto.randomUUID(), name: 'CM Punk', brandId: null, alignment: 'Tweener', division: 'Main Event' },
  { id: crypto.randomUUID(), name: 'Seth Rollins', brandId: null, alignment: 'Face', division: 'Main Event' },
  { id: crypto.randomUUID(), name: 'Rhea Ripley', brandId: null, alignment: 'Tweener', division: 'Women' },
  { id: crypto.randomUUID(), name: 'Bianca Belair', brandId: null, alignment: 'Face', division: 'Women' },
  { id: crypto.randomUUID(), name: 'Jey Uso', brandId: null, alignment: 'Face', division: 'Main Event' },
  { id: crypto.randomUUID(), name: 'LA Knight', brandId: null, alignment: 'Face', division: 'Midcard' },
  { id: crypto.randomUUID(), name: 'Gunther', brandId: null, alignment: 'Heel', division: 'Main Event' },
  { id: crypto.randomUUID(), name: 'Damian Priest', brandId: null, alignment: 'Tweener', division: 'Main Event' },
  { id: crypto.randomUUID(), name: 'Liv Morgan', brandId: null, alignment: 'Heel', division: 'Women' },
  { id: crypto.randomUUID(), name: 'Becky Lynch', brandId: null, alignment: 'Face', division: 'Women' },
  { id: crypto.randomUUID(), name: 'The Usos', brandId: null, alignment: 'Face', division: 'Tag' },
  { id: crypto.randomUUID(), name: 'The Judgment Day', brandId: null, alignment: 'Heel', division: 'Tag' },
  { id: crypto.randomUUID(), name: 'Randy Orton', brandId: null, alignment: 'Face', division: 'Main Event' },
];

export const defaultTitles = [
  { id: crypto.randomUUID(), name: 'World Heavyweight Championship', brandId: null, holderId: null },
  { id: crypto.randomUUID(), name: 'WWE Championship', brandId: null, holderId: null },
  { id: crypto.randomUUID(), name: 'Women’s World Championship', brandId: null, holderId: null },
  { id: crypto.randomUUID(), name: 'Intercontinental Championship', brandId: null, holderId: null },
  { id: crypto.randomUUID(), name: 'United States Championship', brandId: null, holderId: null },
  { id: crypto.randomUUID(), name: 'Tag Team Championship', brandId: null, holderId: null },
];

export const defaultRivalries = [
  {
    id: crypto.randomUUID(),
    brandId: null,
    superstarA: 'Cody Rhodes',
    superstarB: 'Roman Reigns',
    intensity: 'High',
    notes: 'Title rematch with promo interruptions and outside interference.'
  }
];

export const defaultCards = [
  {
    id: crypto.randomUUID(),
    showName: 'Raw',
    episodeName: 'Week 1',
    matches: [
      { id: crypto.randomUUID(), matchType: 'Singles', stipulation: 'Standard', participants: 'Cody Rhodes vs Roman Reigns' },
      { id: crypto.randomUUID(), matchType: 'Tag Team', stipulation: 'Standard', participants: 'The Usos vs The Judgment Day' },
    ]
  }
];
