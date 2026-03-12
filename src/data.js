const svgDataUri = (title, subtitle, background) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="${background}" />
        </linearGradient>
      </defs>
      <rect width="1200" height="675" fill="url(#g)" />
      <circle cx="1030" cy="120" r="180" fill="rgba(255,255,255,.08)" />
      <circle cx="180" cy="540" r="220" fill="rgba(255,255,255,.06)" />
      <text x="70" y="250" font-size="86" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-weight="700">${title}</text>
      <text x="74" y="335" font-size="34" fill="#e2e8f0" font-family="Arial, Helvetica, sans-serif">${subtitle}</text>
      <text x="74" y="590" font-size="24" fill="#cbd5e1" font-family="Arial, Helvetica, sans-serif">Replace this demo artwork with a free-source or uploaded image URL.</text>
    </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const image = (title, subtitle, color) => svgDataUri(title, subtitle, color);

export const recommendedImageSources = [
  {
    name: 'Wikimedia Commons',
    type: 'Wrestlers, logos, championship photos',
    url: 'https://commons.wikimedia.org/wiki/Category:World_Wrestling_Entertainment',
    note: 'Best starting point for freely licensed wrestling photos and logos when available.',
  },
  {
    name: 'Unsplash',
    type: 'Arena lights, crowds, pyros, backstage textures',
    url: 'https://unsplash.com',
    note: 'Great for generic show backgrounds and presentation art.',
  },
  {
    name: 'Pexels',
    type: 'Crowds, sports lighting, generic event visuals',
    url: 'https://www.pexels.com',
    note: 'Useful for banners, dashboards, and filler artwork.',
  },
];

export const defaultBrands = [
  { id: crypto.randomUUID(), name: 'Raw', color: '#c1121f', imageUrl: image('RAW', 'Monday night flagship', '#b91c1c') },
  { id: crypto.randomUUID(), name: 'SmackDown', color: '#2563eb', imageUrl: image('SMACKDOWN', 'Friday night blue brand', '#1d4ed8') },
  { id: crypto.randomUUID(), name: 'NXT', color: '#f59e0b', imageUrl: image('NXT', 'Developmental spotlight', '#d97706') },
];

export const defaultRoster = [
  { id: crypto.randomUUID(), name: 'Roman Reigns', brandId: null, alignment: 'Heel', division: 'Main Event', imageUrl: image('ROMAN REIGNS', 'Tribal Chief demo card', '#7f1d1d') },
  { id: crypto.randomUUID(), name: 'Cody Rhodes', brandId: null, alignment: 'Face', division: 'Main Event', imageUrl: image('CODY RHODES', 'American Nightmare demo card', '#0f766e') },
  { id: crypto.randomUUID(), name: 'CM Punk', brandId: null, alignment: 'Tweener', division: 'Main Event', imageUrl: image('CM PUNK', 'Best in the World demo card', '#4b5563') },
  { id: crypto.randomUUID(), name: 'Seth Rollins', brandId: null, alignment: 'Face', division: 'Main Event', imageUrl: image('SETH ROLLINS', 'Visionary demo card', '#7c3aed') },
  { id: crypto.randomUUID(), name: 'Rhea Ripley', brandId: null, alignment: 'Tweener', division: 'Women', imageUrl: image('RHEA RIPLEY', 'Mami demo card', '#1f2937') },
  { id: crypto.randomUUID(), name: 'Bianca Belair', brandId: null, alignment: 'Face', division: 'Women', imageUrl: image('BIANCA BELAIR', 'EST demo card', '#be185d') },
  { id: crypto.randomUUID(), name: 'Jey Uso', brandId: null, alignment: 'Face', division: 'Main Event', imageUrl: image('JEY USO', 'Main event demo card', '#0f766e') },
  { id: crypto.randomUUID(), name: 'LA Knight', brandId: null, alignment: 'Face', division: 'Midcard', imageUrl: image('LA KNIGHT', 'Yeah! demo card', '#334155') },
  { id: crypto.randomUUID(), name: 'Gunther', brandId: null, alignment: 'Heel', division: 'Main Event', imageUrl: image('GUNTHER', 'Ring General demo card', '#78350f') },
  { id: crypto.randomUUID(), name: 'Damian Priest', brandId: null, alignment: 'Tweener', division: 'Main Event', imageUrl: image('DAMIAN PRIEST', 'Judgment Day demo card', '#312e81') },
  { id: crypto.randomUUID(), name: 'Liv Morgan', brandId: null, alignment: 'Heel', division: 'Women', imageUrl: image('LIV MORGAN', 'Women division demo card', '#ec4899') },
  { id: crypto.randomUUID(), name: 'Becky Lynch', brandId: null, alignment: 'Face', division: 'Women', imageUrl: image('BECKY LYNCH', 'The Man demo card', '#ea580c') },
  { id: crypto.randomUUID(), name: 'The Usos', brandId: null, alignment: 'Face', division: 'Tag', imageUrl: image('THE USOS', 'Tag team demo card', '#0f766e') },
  { id: crypto.randomUUID(), name: 'The Judgment Day', brandId: null, alignment: 'Heel', division: 'Tag', imageUrl: image('JUDGMENT DAY', 'Stable demo card', '#111827') },
  { id: crypto.randomUUID(), name: 'Randy Orton', brandId: null, alignment: 'Face', division: 'Main Event', imageUrl: image('RANDY ORTON', 'Legend killer demo card', '#14532d') },
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
    notes: 'Title rematch with promo interruptions and outside interference.',
  },
];

export const defaultCards = [
  {
    id: crypto.randomUUID(),
    showName: 'Raw',
    episodeName: 'Week 1',
    imageUrl: image('RAW', 'Opening week card artwork', '#7f1d1d'),
    matches: [
      { id: crypto.randomUUID(), matchType: 'Singles', stipulation: 'Standard', participants: 'Cody Rhodes vs Roman Reigns' },
      { id: crypto.randomUUID(), matchType: 'Tag Team', stipulation: 'Standard', participants: 'The Usos vs The Judgment Day' },
    ],
  },
];
