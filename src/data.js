const svgDataUri = ({ title, subtitle, background, accent = '#ffffff', badge = '', badgeBg = 'rgba(255,255,255,.14)' }) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#020617" />
          <stop offset="65%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="${background}" />
        </linearGradient>
        <linearGradient id="shine" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="rgba(255,255,255,.35)" />
          <stop offset="100%" stop-color="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      <rect width="1200" height="675" rx="32" fill="url(#g)" />
      <circle cx="1060" cy="110" r="190" fill="rgba(255,255,255,.08)" />
      <circle cx="1040" cy="110" r="110" fill="rgba(255,255,255,.08)" />
      <circle cx="160" cy="580" r="220" fill="rgba(255,255,255,.04)" />
      <path d="M0 540 C220 470 430 650 740 580 C930 535 1080 430 1200 450 L1200 675 L0 675 Z" fill="rgba(255,255,255,.05)" />
      <rect x="72" y="72" width="165" height="40" rx="20" fill="${badgeBg}" />
      <text x="154" y="98" text-anchor="middle" font-size="24" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-weight="700">${badge}</text>
      <text x="72" y="268" font-size="88" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-weight="800">${title}</text>
      <text x="76" y="338" font-size="34" fill="#dbeafe" font-family="Arial, Helvetica, sans-serif">${subtitle}</text>
      <rect x="72" y="528" width="410" height="10" rx="5" fill="${accent}" opacity="0.88" />
      <text x="74" y="602" font-size="24" fill="#cbd5e1" font-family="Arial, Helvetica, sans-serif">Built-in artwork placeholder. Replace with your own image URL any time.</text>
    </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export const createBrandArt = (name, color = '#7c3aed') => svgDataUri({
  title: String(name || 'BRAND').toUpperCase(),
  subtitle: 'Brand artwork',
  background: color,
  accent: color,
  badge: 'BRAND',
  badgeBg: 'rgba(15,23,42,.45)',
});

export const createSuperstarArt = (name, color = '#334155', division = 'Main Event') => svgDataUri({
  title: String(name || 'SUPERSTAR').toUpperCase(),
  subtitle: `${division} spotlight card`,
  background: color,
  accent: '#f8fafc',
  badge: 'ROSTER',
  badgeBg: 'rgba(30,41,59,.55)',
});

export const createShowArt = (showName, episodeName, color = '#7c3aed') => svgDataUri({
  title: String(showName || 'SHOW').toUpperCase(),
  subtitle: episodeName || 'Weekly show card',
  background: color,
  accent: '#f8fafc',
  badge: 'SHOW',
  badgeBg: 'rgba(30,41,59,.55)',
});

export const recommendedImageSources = [
  {
    name: 'Wikimedia Commons',
    type: 'Wrestlers, logos, belts',
    url: 'https://commons.wikimedia.org/wiki/Category:World_Wrestling_Entertainment',
    note: 'Strong option for freely licensed wrestling imagery when specific talent or brand photos exist.',
  },
  {
    name: 'Unsplash',
    type: 'Arena lights, crowds, pyros',
    url: 'https://unsplash.com',
    note: 'Great for premium-looking show banners, stage textures, and event backgrounds.',
  },
  {
    name: 'Pexels',
    type: 'Sports lighting, stage visuals, crowd shots',
    url: 'https://www.pexels.com',
    note: 'Useful for generic event art when you want posters and dashboard imagery to feel more alive.',
  },
  {
    name: 'Openverse',
    type: 'Search across CC images',
    url: 'https://openverse.org',
    note: 'Helpful for scanning multiple open-licensed image libraries from one search box.',
  },
];

export const defaultBrands = [
  { id: crypto.randomUUID(), name: 'Raw', color: '#d61f2c', imageUrl: createBrandArt('RAW', '#d61f2c') },
  { id: crypto.randomUUID(), name: 'SmackDown', color: '#2563eb', imageUrl: createBrandArt('SMACKDOWN', '#2563eb') },
  { id: crypto.randomUUID(), name: 'NXT', color: '#f59e0b', imageUrl: createBrandArt('NXT', '#f59e0b') },
];

export const defaultRoster = [
  { id: crypto.randomUUID(), name: 'Roman Reigns', brandId: null, alignment: 'Heel', division: 'Main Event', imageUrl: createSuperstarArt('Roman Reigns', '#7f1d1d', 'Main Event') },
  { id: crypto.randomUUID(), name: 'Cody Rhodes', brandId: null, alignment: 'Face', division: 'Main Event', imageUrl: createSuperstarArt('Cody Rhodes', '#0f766e', 'Main Event') },
  { id: crypto.randomUUID(), name: 'CM Punk', brandId: null, alignment: 'Tweener', division: 'Main Event', imageUrl: createSuperstarArt('CM Punk', '#4b5563', 'Main Event') },
  { id: crypto.randomUUID(), name: 'Seth Rollins', brandId: null, alignment: 'Face', division: 'Main Event', imageUrl: createSuperstarArt('Seth Rollins', '#7c3aed', 'Main Event') },
  { id: crypto.randomUUID(), name: 'Rhea Ripley', brandId: null, alignment: 'Tweener', division: 'Women', imageUrl: createSuperstarArt('Rhea Ripley', '#111827', 'Women') },
  { id: crypto.randomUUID(), name: 'Bianca Belair', brandId: null, alignment: 'Face', division: 'Women', imageUrl: createSuperstarArt('Bianca Belair', '#be185d', 'Women') },
  { id: crypto.randomUUID(), name: 'Jey Uso', brandId: null, alignment: 'Face', division: 'Main Event', imageUrl: createSuperstarArt('Jey Uso', '#0f766e', 'Main Event') },
  { id: crypto.randomUUID(), name: 'LA Knight', brandId: null, alignment: 'Face', division: 'Midcard', imageUrl: createSuperstarArt('LA Knight', '#334155', 'Midcard') },
  { id: crypto.randomUUID(), name: 'Gunther', brandId: null, alignment: 'Heel', division: 'Main Event', imageUrl: createSuperstarArt('Gunther', '#78350f', 'Main Event') },
  { id: crypto.randomUUID(), name: 'Damian Priest', brandId: null, alignment: 'Tweener', division: 'Main Event', imageUrl: createSuperstarArt('Damian Priest', '#312e81', 'Main Event') },
  { id: crypto.randomUUID(), name: 'Liv Morgan', brandId: null, alignment: 'Heel', division: 'Women', imageUrl: createSuperstarArt('Liv Morgan', '#ec4899', 'Women') },
  { id: crypto.randomUUID(), name: 'Becky Lynch', brandId: null, alignment: 'Face', division: 'Women', imageUrl: createSuperstarArt('Becky Lynch', '#ea580c', 'Women') },
  { id: crypto.randomUUID(), name: 'The Usos', brandId: null, alignment: 'Face', division: 'Tag', imageUrl: createSuperstarArt('The Usos', '#0f766e', 'Tag Team') },
  { id: crypto.randomUUID(), name: 'The Judgment Day', brandId: null, alignment: 'Heel', division: 'Tag', imageUrl: createSuperstarArt('Judgment Day', '#111827', 'Tag Team') },
  { id: crypto.randomUUID(), name: 'Randy Orton', brandId: null, alignment: 'Face', division: 'Main Event', imageUrl: createSuperstarArt('Randy Orton', '#14532d', 'Main Event') },
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
    imageUrl: createShowArt('Raw', 'Week 1', '#d61f2c'),
    matches: [
      { id: crypto.randomUUID(), matchType: 'Singles', stipulation: 'Standard', participants: 'Cody Rhodes vs Roman Reigns' },
      { id: crypto.randomUUID(), matchType: 'Tag Team', stipulation: 'Standard', participants: 'The Usos vs The Judgment Day' },
    ],
  },
  {
    id: crypto.randomUUID(),
    showName: 'SmackDown',
    episodeName: 'Go-home show',
    imageUrl: createShowArt('SmackDown', 'Go-home show', '#2563eb'),
    matches: [
      { id: crypto.randomUUID(), matchType: 'Singles', stipulation: 'I Quit', participants: 'LA Knight vs Gunther' },
    ],
  },
];
