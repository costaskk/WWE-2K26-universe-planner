const svgDataUri = ({
  title,
  subtitle,
  background = '#7c3aed',
  accent = '#ffffff',
  badge = '',
  badgeBg = '#0f172a',
  logoText = '',
}) => {
  const safeTitle = String(title || '').replace(/&/g, '&amp;');
  const safeSubtitle = String(subtitle || '').replace(/&/g, '&amp;');
  const safeBadge = String(badge || '').replace(/&/g, '&amp;');
  const safeLogo = String(logoText || '').replace(/&/g, '&amp;');

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#020617"/>
          <stop offset="55%" stop-color="#081225"/>
          <stop offset="100%" stop-color="${background}"/>
        </linearGradient>
        <linearGradient id="shine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="675" rx="36" fill="url(#bg)"/>
      <circle cx="1040" cy="110" r="170" fill="#ffffff" opacity="0.08"/>
      <circle cx="150" cy="610" r="240" fill="#ffffff" opacity="0.04"/>
      <path d="M0 500 C250 430 420 650 760 560 C920 520 1080 430 1200 455 L1200 675 L0 675 Z" fill="#ffffff" opacity="0.06"/>
      <rect x="70" y="70" width="180" height="44" rx="22" fill="${badgeBg}" opacity="0.9"/>
      <text x="160" y="98" text-anchor="middle" font-size="24" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-weight="700">${safeBadge}</text>
      <circle cx="1048" cy="338" r="130" fill="#020617" opacity="0.45" stroke="#ffffff" stroke-opacity="0.15"/>
      <text x="1048" y="362" text-anchor="middle" font-size="86" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-weight="900">${safeLogo}</text>
      <rect x="60" y="60" width="1080" height="555" rx="28" fill="url(#shine)"/>
      <text x="72" y="282" font-size="92" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-weight="900">${safeTitle}</text>
      <text x="76" y="350" font-size="34" fill="#dbeafe" font-family="Arial, Helvetica, sans-serif">${safeSubtitle}</text>
      <rect x="72" y="528" width="420" height="10" rx="5" fill="${accent}" opacity="0.95"/>
    </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const commonsFile = (filename) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=900`;

export const createBrandArt = (name, color = '#7c3aed') =>
  svgDataUri({
    title: String(name || 'BRAND').toUpperCase(),
    subtitle: 'Brand artwork',
    background: color,
    accent: color,
    badge: 'BRAND',
    badgeBg: '#111827',
    logoText: String(name || 'BR').slice(0, 2).toUpperCase(),
  });

export const createSuperstarArt = (name, color = '#334155', division = 'Main Event') =>
  svgDataUri({
    title: String(name || 'SUPERSTAR').toUpperCase(),
    subtitle: `${division} spotlight card`,
    background: color,
    accent: '#f8fafc',
    badge: 'ROSTER',
    badgeBg: '#0f172a',
    logoText: String(name || 'SS')
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase(),
  });

export const createShowArt = (showName, episodeName, color = '#7c3aed') =>
  svgDataUri({
    title: String(showName || 'SHOW').toUpperCase(),
    subtitle: episodeName || 'Weekly show card',
    background: color,
    accent: '#f8fafc',
    badge: 'SHOW',
    badgeBg: '#111827',
    logoText: String(showName || 'SH').slice(0, 2).toUpperCase(),
  });

export const recommendedImageSources = [
  {
    name: 'Wikimedia Commons',
    type: 'Freely licensed wrestler photos',
    url: 'https://commons.wikimedia.org/wiki/Category:World_Wrestling_Entertainment',
    note: 'Best default source for real wrestler photos and some event imagery that can be reused under free licenses.',
  },
  {
    name: 'Openverse',
    type: 'Search across Creative Commons libraries',
    url: 'https://openverse.org',
    note: 'Useful when you want one place to search multiple open-license image collections for stages, spotlights, and crowd visuals.',
  },
  {
    name: 'Unsplash',
    type: 'Arena lighting and generic event backdrops',
    url: 'https://unsplash.com',
    note: 'Great for stylized PPV-style backgrounds, stage lights, and crowd atmosphere art.',
  },
  {
    name: 'Pexels',
    type: 'Sports and entertainment background art',
    url: 'https://www.pexels.com',
    note: 'Solid option for free generic posters, sports-lighting textures, and dramatic event imagery.',
  },
];

export const superstarPhotoMap = {
  'Roman Reigns': commonsFile('Roman Reigns May 2019.jpg'),
  'Cody Rhodes': commonsFile('Cody Rhodes, Wrestlemania XL in 2024 6 (cropped).jpg'),
  'CM Punk': commonsFile('CM Punk RR25.jpg'),
  'Rhea Ripley': commonsFile('Rhea Ripley 040724.jpg'),
  'Bianca Belair': commonsFile('Bianca Belair 2024.jpg'),
  'Becky Lynch': commonsFile('Becky Lynch November 2018.jpg'),
  'Randy Orton': commonsFile('Randy Orton crop.jpg'),

  /* unstable / unknown Wikimedia filenames: leave blank so UI cleanly falls back */
  'Seth Rollins': '',
  'Gunther': '',
  'Damian Priest': '',
  'Liv Morgan': '',
  'Jey Uso': '',
  'LA Knight': '',
  'The Usos': '',
  'The Judgment Day': '',
};

const brandTheme = {
  Raw: { color: '#d61f2c', short: 'RA' },
  SmackDown: { color: '#2563eb', short: 'SD' },
  NXT: { color: '#f59e0b', short: 'NX' },
};

export const defaultBrands = [
  { id: crypto.randomUUID(), name: 'Raw', color: brandTheme.Raw.color, imageUrl: '' },
  { id: crypto.randomUUID(), name: 'SmackDown', color: brandTheme.SmackDown.color, imageUrl: '' },
  { id: crypto.randomUUID(), name: 'NXT', color: brandTheme.NXT.color, imageUrl: '' },
];

const seededStar = (name, color, division, extra = {}) => ({
  id: crypto.randomUUID(),
  name,
  brandId: null,
  alignment: 'Face',
  division,
  imageUrl: superstarPhotoMap[name] || '',
  ...extra,
});

export const defaultRoster = [
  seededStar('Roman Reigns', '#7f1d1d', 'Main Event', { alignment: 'Heel' }),
  seededStar('Cody Rhodes', '#0f766e', 'Main Event'),
  seededStar('CM Punk', '#4b5563', 'Main Event', { alignment: 'Tweener' }),
  seededStar('Seth Rollins', '#7c3aed', 'Main Event'),
  seededStar('Rhea Ripley', '#111827', 'Women', { alignment: 'Tweener' }),
  seededStar('Bianca Belair', '#be185d', 'Women'),
  seededStar('Jey Uso', '#0f766e', 'Main Event'),
  seededStar('LA Knight', '#334155', 'Midcard'),
  seededStar('Gunther', '#78350f', 'Main Event', { alignment: 'Heel' }),
  seededStar('Damian Priest', '#312e81', 'Main Event', { alignment: 'Tweener' }),
  seededStar('Liv Morgan', '#ec4899', 'Women', { alignment: 'Heel' }),
  seededStar('Becky Lynch', '#ea580c', 'Women'),
  seededStar('The Usos', '#0f766e', 'Tag'),
  seededStar('The Judgment Day', '#111827', 'Tag', { alignment: 'Heel' }),
  seededStar('Randy Orton', '#14532d', 'Main Event'),
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
    imageUrl: '',
    matches: [
      { id: crypto.randomUUID(), matchType: 'Singles', stipulation: 'Standard', participants: 'Cody Rhodes vs Roman Reigns' },
      { id: crypto.randomUUID(), matchType: 'Tag Team', stipulation: 'Standard', participants: 'The Usos vs The Judgment Day' },
    ],
  },
  {
    id: crypto.randomUUID(),
    showName: 'SmackDown',
    episodeName: 'Go-home show',
    imageUrl: '',
    matches: [
      { id: crypto.randomUUID(), matchType: 'Singles', stipulation: 'I Quit', participants: 'LA Knight vs Gunther' },
    ],
  },
];