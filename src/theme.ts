// ---------------------------------------------------------------------------
// BRAND + CONTENT LAYER — copy, contact details, colors and the photo list.
// Swap photos by dropping files in public/photos/ and editing PHOTOS below.
// ---------------------------------------------------------------------------

export const BRAND = {
  name: 'Eden & Design',
  nameA: 'Eden',
  nameB: 'Design',
  descriptor: "Singapore's renovation contractor",
  domain: 'renoworks.sg',
  phone: '+65 8850 2000',
  email: 'hello@renoworks.sg',
  statement: 'We make futuristic homes practical and within budget.',
  regions: ['Singapore', 'Johor Bahru'],
  hook: ['Futuristic.', 'Practical.', 'Within budget.'],
  pillarsTitle: 'Designed for how you live',
  pillars: [
    { key: 'future', title: 'Futuristic design', body: 'Clean lines, warm light, smart storage' },
    { key: 'practical', title: 'Practical living', body: 'Layouts that work every single day' },
    { key: 'budget', title: 'Within budget', body: 'A plan that fits what you want to spend' },
  ],
  regionsTitle: 'Now building homes in',
  cta: { lead: 'Get your', big: 'FREE QUOTE', tail: 'Tell us about your home — we’ll plan the rest.', button: 'Get a free quote' },
} as const;

export const PHOTOS = {
  hero: 'photos/home-3.jpg',
  hookSlivers: ['photos/detail-2.jpg', 'photos/detail-1.jpg'],
  portfolio: [
    { src: 'photos/home-1.jpg', label: 'Living room', sub: 'Curved feature wall · pendant lights' },
    { src: 'photos/home-2.jpg', label: 'Condo living', sub: 'Floating TV wall · cove lighting' },
    { src: 'photos/home-3.jpg', label: 'Loft home', sub: 'Floating stairs · open kitchen' },
  ],
  triptych: ['photos/home-1.jpg', 'photos/home-2.jpg', 'photos/home-3.jpg'],
  pillars: ['photos/detail-4.jpg', 'photos/detail-2.jpg', 'photos/detail-3.jpg'],
  regionsBg: 'photos/home-1.jpg',
  montage: [
    'photos/detail-1.jpg',
    'photos/home-2.jpg',
    'photos/detail-2.jpg',
    'photos/home-1.jpg',
    'photos/detail-3.jpg',
    'photos/home-3.jpg',
    'photos/detail-4.jpg',
    'photos/home-2.jpg',
    'photos/detail-1.jpg',
    'photos/home-3.jpg',
    'photos/detail-2.jpg',
    'photos/home-1.jpg',
  ],
  ctaBg: 'photos/home-2.jpg',
};

export const COLORS = {
  bg: '#12100E',
  bgDeep: '#0A0908',
  panel: '#1B1814',
  primary: '#D9A45B', // warm brass — picks up the oak + cove lighting in the photos
  primaryDeep: '#B9823C',
  accent: '#F3E6D2', // cream
  warm: '#E0703C',
  white: '#FBF8F3',
  dim: '#B3A898',
  line: 'rgba(255,245,230,0.12)',
} as const;

export const GRADIENT_TEXT = `linear-gradient(90deg, ${COLORS.primary}, #F2CB8A)`;
export const FONT_STACK = 'Manrope, Inter, -apple-system, sans-serif';
export const SERIF = 'Fraunces, Georgia, serif';
