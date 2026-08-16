import type { Product, ColorOption, SizeOption } from './types';

/**
 * Mock catalog standing in for a future product API. Every product carries the
 * full detail set (colors/sizes/views/specs/faqs/reviews) so any PDP is complete;
 * pages must still degrade gracefully if a field is absent (that path is covered
 * by component-level fixtures, not by shipping a deliberately-bare product).
 *
 * APEXLINE is a multi-brand retailer, so `brand` spans real Indian-market helmet
 * brands (the store name is separate from the brands it stocks).
 */

/**
 * Standard adult helmet size ladder. Pass the ids that are out of stock, and
 * optionally a per-size units-in-stock map for low-stock urgency ("Only N left").
 * When a size appears in `stock`, its `available` is derived from the count
 * (`> 0`); otherwise it falls back to the `soldOut` list.
 */
function sizeSet(soldOut: string[] = [], stock?: Record<string, number>): SizeOption[] {
  return (
    [
      ['xs', 'XS (53-54cm)'],
      ['s', 'S (55-56cm)'],
      ['m', 'M (57-58cm)'],
      ['l', 'L (59-60cm)'],
      ['xl', 'XL (61-62cm)'],
      ['xxl', 'XXL (63-64cm)'],
    ] as const
  ).map(([id, label]) => {
    if (stock && id in stock) {
      const count = stock[id];
      return { id, label, available: count > 0, stock: count };
    }
    return { id, label, available: !soldOut.includes(id) };
  });
}

/** Shared colourway palette — products pick a subset; ids stay unique per product. */
const C: Record<string, ColorOption> = {
  matteBlack: { id: 'matte-black', name: 'Matte Black', hex: '#1a1a1c' },
  glossBlack: { id: 'gloss-black', name: 'Gloss Black', hex: '#0d0d0f' },
  carbon: { id: 'carbon-fibre', name: 'Carbon Fibre', hex: '#2b2d31' },
  racingRed: { id: 'racing-red', name: 'Racing Red', hex: '#c0392b' },
  pearlWhite: { id: 'pearl-white', name: 'Pearl White', hex: '#f4f3f1' },
  gunmetal: { id: 'gunmetal-grey', name: 'Gunmetal Grey', hex: '#5a5d63' },
  hiViz: { id: 'hi-viz-yellow', name: 'Hi-Viz Yellow', hex: '#d4e04a' },
  midnight: { id: 'midnight-blue', name: 'Midnight Blue', hex: '#1e2a44' },
  sand: { id: 'desert-sand', name: 'Desert Sand', hex: '#c2a878' },
  ranger: { id: 'ranger-green', name: 'Ranger Green', hex: '#3f4a3a' },
  titanium: { id: 'titanium-silver', name: 'Titanium Silver', hex: '#b8bcc2' },
  orange: { id: 'sunset-orange', name: 'Sunset Orange', hex: '#d3661f' },
};

const FULL_FACE_VIEWS = ['front', 'three-quarter', 'side', 'back', 'visor-up'];
const MODULAR_VIEWS = ['front', 'three-quarter', 'side', 'chin-up', 'back'];
const ADVENTURE_VIEWS = ['front', 'three-quarter', 'side', 'peak-detail', 'back'];

/** Reusable FAQ blurbs common to most helmets, personalised per product below. */
const FAQ_SIZING = {
  id: 'sizing',
  question: 'How do I pick the right size?',
  answer:
    'Measure your head circumference just above the eyebrows and match it against the size ' +
    'chart in the size selector. If you fall between two sizes, we recommend sizing down for a ' +
    'snug fit that loosens slightly as the liner breaks in.',
};

const FAQ_RETURNS = {
  id: 'returns',
  question: 'What is the return policy?',
  answer:
    'Unused helmets with tags and the original box can be returned within 15 days of delivery ' +
    'for a full refund. Worn or damaged helmets cannot be returned for hygiene and safety reasons.',
};

const CORE_HELMETS: Product[] = [
  {
    id: 'velocity-rs-carbon',
    featured: 'best',
    name: 'Velocity RS Carbon',
    brand: 'MT Helmets',
    tagline: 'Race-bred carbon shell for the track and the highway',
    category: 'Full-face',
    certification: 'ECE 22.06',
    price: 42999,
    compareAtPrice: 47999,
    rating: 4.7,
    reviewCount: 128,
    badge: 'Bestseller',
    description:
      'The Velocity RS Carbon is our flagship full-face helmet, built on a hand-laid carbon-fibre ' +
      'shell that drops weight without giving up crash protection. Track-tested aerodynamics, a ' +
      'wide anti-fog visor, and a fully removable liner make it equally at home on a Sunday canyon ' +
      'run or the daily commute through city traffic.',
    highlights: [
      'Hand-laid carbon-fibre shell, 3 shell sizes for a precise fit',
      'ISI + ECE 22.06 certified',
      '1,350g average weight (M shell)',
      'Anti-fog, anti-scratch visor with tool-less removal',
      'Removable, washable, moisture-wicking liner',
    ],
    highlightStats: [
      { value: '1,350g', label: 'Carbon-fibre shell' },
      { value: 'ECE 22.06', label: 'ISI + ECE certified' },
      { value: '3 shells', label: 'Precise-fit sizing' },
    ],
    colors: [C.matteBlack, C.carbon, C.racingRed, C.pearlWhite, C.gunmetal],
    sizes: sizeSet(['xl', 'xxl'], { xs: 3, s: 8, m: 14, l: 11, xl: 0, xxl: 0 }),
    views: FULL_FACE_VIEWS,
    specs: [
      { label: 'Shell material', value: 'Carbon fibre composite' },
      { label: 'Certification', value: 'ISI, ECE 22.06' },
      { label: 'Weight', value: '1,350g ± 50g (size M)' },
      { label: 'Visor', value: 'Anti-fog, anti-scratch, UV400' },
      { label: 'Ventilation', value: '4 intake + 2 exhaust vents' },
      { label: 'Liner', value: 'Removable, washable, moisture-wicking' },
      { label: 'Retention system', value: 'Double-D ring' },
      { label: 'Warranty', value: '5 years manufacturer warranty' },
    ],
    faqs: [
      FAQ_SIZING,
      {
        id: 'certification',
        question: 'Is this helmet legal to ride with in India?',
        answer:
          'Yes — the Velocity RS Carbon carries ISI certification, which is mandatory under Indian ' +
          'motor vehicle rules, alongside ECE 22.06 for international touring.',
      },
      FAQ_RETURNS,
    ],
    reviews: [
      {
        id: 'r1',
        author: 'Aditya Rao',
        rating: 5,
        date: '2026-05-12',
        title: 'Worth every rupee',
        body:
          'Been riding with this for three months on the Mumbai-Pune expressway. Barely notice the ' +
          'weight and zero wind noise at 100kmph. The visor seal keeps the rain out too.',
        verified: true,
      },
      {
        id: 'r2',
        author: 'Meera Nair',
        rating: 5,
        date: '2026-04-28',
        title: 'Finally a helmet that fits Indian head shapes',
        body:
          'Most imported shells feel too oval for me. The M shell fit perfectly out of the box and the ' +
          'cheek pads broke in within a week.',
        verified: true,
      },
      {
        id: 'r3',
        author: 'Karthik Subramaniam',
        rating: 4,
        date: '2026-03-30',
        title: 'Great helmet, ventilation could be better in peak summer',
        body:
          'Protection and finish are excellent. In Chennai traffic during April it does get warm at ' +
          'low speeds, but at highway speed the vents do their job.',
        verified: true,
      },
    ],
  },
  {
    id: 'iridium-gp',
    featured: 'best',
    name: 'Iridium GP',
    brand: 'SMK',
    tagline: 'MotoGP-inspired shell for serious track days',
    category: 'Full-face',
    certification: 'ECE 22.06',
    price: 34999,
    rating: 4.6,
    reviewCount: 84,
    badge: 'Track Ready',
    description:
      'The Iridium GP is a track-focused full-face built on a multi-composite fibreglass shell with ' +
      'a wind-tunnel-tuned rear spoiler. A Pinlock-ready visor and emergency-release cheek pads make ' +
      'it as practical for marshals as it is fast on the timing sheet.',
    highlights: [
      'Multi-composite fibreglass shell in 3 sizes',
      'ISI + ECE 22.06 certified, track-day approved',
      'Aerodynamic rear spoiler tuned in the wind tunnel',
      'Pinlock-ready anti-fog visor with quick-release',
      'Emergency-release cheek pads for safe removal',
    ],
    highlightStats: [
      { value: '1,480g', label: 'Composite fibreglass shell' },
      { value: 'Wind-tuned', label: 'Aero rear spoiler' },
      { value: 'ECE 22.06', label: 'Track-day approved' },
    ],
    colors: [C.glossBlack, C.racingRed, C.titanium, C.hiViz],
    sizes: sizeSet(['xxl'], { xs: 5, s: 9, m: 12, l: 7, xl: 2, xxl: 0 }),
    views: FULL_FACE_VIEWS,
    specs: [
      { label: 'Shell material', value: 'Multi-composite fibreglass' },
      { label: 'Certification', value: 'ISI, ECE 22.06' },
      { label: 'Weight', value: '1,480g ± 50g (size M)' },
      { label: 'Visor', value: 'Pinlock-ready, anti-scratch, clear' },
      { label: 'Ventilation', value: '5 intake + 4 exhaust vents' },
      { label: 'Liner', value: 'Removable, washable, anti-bacterial' },
      { label: 'Retention system', value: 'Micrometric ratchet' },
      { label: 'Warranty', value: '2 years manufacturer warranty' },
    ],
    faqs: [
      FAQ_SIZING,
      {
        id: 'pinlock',
        question: 'Does it come with a Pinlock insert?',
        answer:
          'The visor is Pinlock-ready and a Pinlock 70 insert is included in the box. Fit it before ' +
          'monsoon rides to stop the visor fogging in stop-go traffic.',
      },
      FAQ_RETURNS,
    ],
    reviews: [
      {
        id: 'r1',
        author: 'Rohan Deshpande',
        rating: 5,
        date: '2026-05-02',
        title: 'Superb on track days at Kari Motor Speedway',
        body:
          'The spoiler genuinely settles the helmet down past 140kmph. Emergency cheek pads are a ' +
          'reassuring touch for track riding.',
        verified: true,
      },
      {
        id: 'r2',
        author: 'Sneha Iyer',
        rating: 4,
        date: '2026-04-10',
        title: 'Great shell, slightly heavy for the commute',
        body:
          'Brilliant for weekend track sessions. On long commutes the extra weight over my old helmet ' +
          'is noticeable, but the fit and finish more than make up for it.',
        verified: true,
      },
    ],
  },
  {
    id: 'circuit-r',
    featured: 'best',
    name: 'Circuit R',
    brand: 'Axor',
    tagline: 'Everyday sport riding, race-day sharp',
    category: 'Full-face',
    certification: 'DOT',
    price: 18999,
    rating: 4.4,
    reviewCount: 156,
    description:
      'The Circuit R is a do-it-all sport full-face on an injection-moulded polycarbonate shell. A ' +
      'wide eyeport and a drop-down internal sun visor make it an easy pick for daily riders who want ' +
      'one helmet for the commute and the occasional weekend blast.',
    highlights: [
      'Injection-moulded polycarbonate shell',
      'ISI + DOT certified',
      'Drop-down internal sun visor',
      'Wide eyeport for better peripheral vision',
      'Micrometric quick-release strap',
    ],
    highlightStats: [
      { value: '1,520g', label: 'Polycarbonate shell' },
      { value: 'Internal', label: 'Drop-down sun visor' },
      { value: 'ISI + DOT', label: 'Certified' },
    ],
    colors: [C.matteBlack, C.pearlWhite, C.midnight, C.orange],
    sizes: sizeSet([], { xs: 6, s: 12, m: 20, l: 15, xl: 9, xxl: 4 }),
    views: FULL_FACE_VIEWS,
    specs: [
      { label: 'Shell material', value: 'Polycarbonate' },
      { label: 'Certification', value: 'ISI, DOT' },
      { label: 'Weight', value: '1,520g ± 50g (size M)' },
      { label: 'Visor', value: 'Clear outer + internal sun shield' },
      { label: 'Ventilation', value: '3 intake + 2 exhaust vents' },
      { label: 'Liner', value: 'Removable, washable' },
      { label: 'Retention system', value: 'Micrometric ratchet' },
      { label: 'Warranty', value: '1 year manufacturer warranty' },
    ],
    faqs: [
      FAQ_SIZING,
      {
        id: 'sun-visor',
        question: 'Is the internal sun visor legal for road use?',
        answer:
          'Yes. The drop-down sun visor is tinted for glare, not for night riding — flip it up after ' +
          'sunset and use the clear outer visor.',
      },
      FAQ_RETURNS,
    ],
    reviews: [
      {
        id: 'r1',
        author: 'Vikram Menon',
        rating: 5,
        date: '2026-06-01',
        title: 'Best value full-face under 20k',
        body:
          'The internal sun visor alone is worth it for Bengaluru traffic. Light enough that my neck ' +
          "doesn't ache on the ride home.",
        verified: true,
      },
      {
        id: 'r2',
        author: 'Ananya Gupta',
        rating: 4,
        date: '2026-05-18',
        title: 'Comfortable, a bit noisy on the highway',
        body:
          'Great for city use and the sun visor is fantastic. At 90kmph plus there is some wind noise, ' +
          'so I ride with earplugs on long trips.',
        verified: true,
      },
      {
        id: 'r3',
        author: 'Imran Sheikh',
        rating: 4,
        date: '2026-04-22',
        title: 'Solid daily helmet',
        body: 'Had it four months of daily riding, finish is holding up well and the strap is quick to use.',
        verified: false,
      },
    ],
  },
  {
    id: 'urban-gt-modular',
    featured: 'best',
    name: 'Urban GT Modular',
    brand: 'Vega',
    tagline: 'Flip up the chin bar, stay in the saddle',
    category: 'Modular',
    certification: 'ISI',
    price: 15499,
    compareAtPrice: 17999,
    rating: 4.3,
    reviewCount: 211,
    badge: 'City Favourite',
    description:
      'The Urban GT is a flip-up modular for riders who want to grab a coffee, take a call, or clear ' +
      'a toll without unbuckling. A one-touch chin bar, drop-down sun visor, and pre-cut Bluetooth ' +
      'speaker pockets make it the default city helmet for commuters and tourers alike.',
    highlights: [
      'ABS shell with one-touch flip-up chin bar',
      'ISI certified, P/J dual homologation',
      'Drop-down internal sun visor',
      'Bluetooth speaker pockets pre-cut',
      'Micrometric quick-release strap',
    ],
    highlightStats: [
      { value: 'One-touch', label: 'Flip-up chin bar' },
      { value: 'P/J', label: 'Dual homologation' },
      { value: 'BT-ready', label: 'Pre-cut speaker pockets' },
    ],
    colors: [C.matteBlack, C.gunmetal, C.pearlWhite, C.midnight],
    sizes: sizeSet(['xs'], { xs: 0, s: 10, m: 18, l: 13, xl: 6, xxl: 3 }),
    views: MODULAR_VIEWS,
    specs: [
      { label: 'Shell material', value: 'ABS thermoplastic' },
      { label: 'Certification', value: 'ISI (P/J homologation)' },
      { label: 'Weight', value: '1,650g ± 50g (size M)' },
      { label: 'Chin bar', value: 'One-touch flip-up' },
      { label: 'Visor', value: 'Clear + internal sun shield' },
      { label: 'Ventilation', value: '2 intake + 2 exhaust vents' },
      { label: 'Comms', value: 'Bluetooth speaker pockets' },
      { label: 'Warranty', value: '1 year manufacturer warranty' },
    ],
    faqs: [
      FAQ_SIZING,
      {
        id: 'flip-legal',
        question: 'Can I ride with the chin bar flipped up?',
        answer:
          'The P/J homologation certifies the helmet in both the closed (P) and open (J) positions, ' +
          'but for crash protection always ride with the chin bar locked down. Flip it up only when ' +
          'stopped.',
      },
      {
        id: 'bluetooth',
        question: 'Which intercoms fit the speaker pockets?',
        answer:
          'The pre-cut pockets fit most 40mm round intercom speakers, including popular Cardo and ' +
          'Sena units. The clamp mounts on the left shell edge.',
      },
    ],
    reviews: [
      {
        id: 'r1',
        author: 'Sanjay Pillai',
        rating: 5,
        date: '2026-06-08',
        title: 'Perfect for daily city riding',
        body:
          'Flipping the chin bar up at toll booths and to talk to the parking guy is so convenient. ' +
          'Fitted my intercom in ten minutes.',
        verified: true,
      },
      {
        id: 'r2',
        author: 'Priya Krishnan',
        rating: 4,
        date: '2026-05-25',
        title: 'Great features, a little heavy',
        body:
          'The modular mechanism is solid and the sun visor is a lifesaver. It is heavier than a plain ' +
          'full-face, which you feel after a couple of hours.',
        verified: true,
      },
      {
        id: 'r3',
        author: 'Deepak Reddy',
        rating: 4,
        date: '2026-04-30',
        title: 'Good value modular',
        body: 'Chin bar locks with a reassuring click. Wind noise is average, nothing an earplug does not fix.',
        verified: true,
      },
    ],
  },
  {
    id: 'trail-pro-adv',
    featured: 'new',
    name: 'Trail Pro ADV',
    brand: 'Steelbird',
    tagline: 'Built for gravel, tarmac, and everything between',
    category: 'Adventure',
    certification: 'ECE 22.06',
    price: 22999,
    rating: 4.5,
    reviewCount: 97,
    description:
      'The Trail Pro ADV is a dual-sport adventure helmet with a removable peak and goggle-ready ' +
      'eyeport, so it works with a visor on the highway and goggles in the dirt. A roost-guard chin ' +
      'vent and drop-down sun visor round out a genuinely go-anywhere lid.',
    highlights: [
      'Fibreglass-reinforced adventure shell',
      'ISI + ECE 22.06 certified',
      'Removable aerodynamic peak',
      'Goggle-ready eyeport with drop-down sun visor',
      'Roost-guard chin vent for off-road',
    ],
    highlightStats: [
      { value: 'Removable', label: 'Aerodynamic peak' },
      { value: 'Goggle-ready', label: 'Dual-sport eyeport' },
      { value: 'ECE 22.06', label: 'ISI + ECE certified' },
    ],
    colors: [C.matteBlack, C.sand, C.ranger, C.hiViz],
    sizes: sizeSet(['xxl'], { xs: 4, s: 7, m: 11, l: 9, xl: 3, xxl: 0 }),
    views: ADVENTURE_VIEWS,
    specs: [
      { label: 'Shell material', value: 'Fibreglass composite' },
      { label: 'Certification', value: 'ISI, ECE 22.06' },
      { label: 'Weight', value: '1,580g ± 50g (size M)' },
      { label: 'Peak', value: 'Removable, tool-less' },
      { label: 'Visor', value: 'Clear + internal sun shield, goggle compatible' },
      { label: 'Ventilation', value: '4 intake + 3 exhaust vents' },
      { label: 'Liner', value: 'Removable, moisture-wicking' },
      { label: 'Warranty', value: '3 years manufacturer warranty' },
    ],
    faqs: [
      FAQ_SIZING,
      {
        id: 'peak-highway',
        question: 'Does the peak buffet at highway speed?',
        answer:
          'There is mild lift above 100kmph, which is normal for an ADV peak. For long motorway ' +
          'stretches you can remove the peak tool-lessly and ride on the visor alone.',
      },
      {
        id: 'goggles',
        question: 'Can I use goggles instead of the visor?',
        answer:
          'Yes. The eyeport is sized for most MX goggles, and the visor can be left up or removed for ' +
          'off-road sections where goggles seal better against dust.',
      },
    ],
    reviews: [
      {
        id: 'r1',
        author: 'Nikhil Bhat',
        rating: 5,
        date: '2026-05-20',
        title: 'Took it to Spiti and back',
        body:
          'Peak kept the high-altitude sun off, and swapping to goggles on the dusty stretches was ' +
          'painless. Ventilation is excellent when you are moving.',
        verified: true,
      },
      {
        id: 'r2',
        author: 'Farhan Qureshi',
        rating: 4,
        date: '2026-04-15',
        title: 'Great ADV lid, peak lifts a little',
        body:
          'Really versatile helmet. On the expressway the peak tugs slightly at high speed, but it pops ' +
          'off in seconds so it is a non-issue.',
        verified: true,
      },
    ],
  },
  {
    id: 'vega-tour',
    featured: 'new',
    name: 'Vega Tour',
    brand: 'Vega',
    tagline: 'All-day comfort for the long haul',
    category: 'Touring',
    certification: 'ISI',
    price: 12999,
    rating: 4.2,
    reviewCount: 143,
    description:
      'The Vega Tour is a comfort-first touring full-face tuned for quiet, all-day riding. A plush ' +
      'removable liner, wide viewport, and Pinlock-ready main visor keep long highway days fatigue-free, ' +
      'while the internal sun visor handles changing light without a swap.',
    highlights: [
      'Thermoplastic alloy shell tuned for low noise',
      'ISI certified',
      'Plush touring-grade removable liner',
      'Internal sun visor for all-day glare',
      'Pinlock-ready anti-fog main visor',
    ],
    highlightStats: [
      { value: '1,550g', label: 'Low-noise shell' },
      { value: 'All-day', label: 'Plush touring liner' },
      { value: 'Pinlock', label: 'Anti-fog ready' },
    ],
    colors: [C.matteBlack, C.pearlWhite, C.gunmetal, C.midnight],
    sizes: sizeSet([], { xs: 8, s: 14, m: 22, l: 16, xl: 10, xxl: 5 }),
    views: FULL_FACE_VIEWS,
    specs: [
      { label: 'Shell material', value: 'Thermoplastic alloy' },
      { label: 'Certification', value: 'ISI' },
      { label: 'Weight', value: '1,550g ± 50g (size M)' },
      { label: 'Visor', value: 'Pinlock-ready + internal sun shield' },
      { label: 'Ventilation', value: '3 intake + 2 exhaust vents' },
      { label: 'Liner', value: 'Plush removable, washable' },
      { label: 'Retention system', value: 'Micrometric ratchet' },
      { label: 'Warranty', value: '1 year manufacturer warranty' },
    ],
    faqs: [
      FAQ_SIZING,
      {
        id: 'noise',
        question: 'How is wind noise on the highway?',
        answer:
          'The shell is shaped to keep noise down and the plush liner seals well around the ears. On ' +
          'all-day touring most riders still prefer earplugs above 100kmph.',
      },
      FAQ_RETURNS,
    ],
    reviews: [
      {
        id: 'r1',
        author: 'Ramesh Kulkarni',
        rating: 5,
        date: '2026-05-30',
        title: 'Comfort king for long rides',
        body:
          'Did a 600km day to Goa and my head was fresh at the end. The liner is genuinely plush and ' +
          'the sun visor saves a lot of stops.',
        verified: true,
      },
      {
        id: 'r2',
        author: 'Lakshmi Menon',
        rating: 4,
        date: '2026-04-19',
        title: 'Great comfort, basic vents',
        body:
          'Super comfortable and quiet for the price. Ventilation is just okay in peak summer, but for ' +
          'touring pace it is fine.',
        verified: true,
      },
      {
        id: 'r3',
        author: 'Arjun Nair',
        rating: 4,
        date: '2026-03-28',
        title: 'Excellent value tourer',
        body: 'Fit is true to size and the Pinlock keeps the visor clear in the rain. Happy with it.',
        verified: false,
      },
    ],
  },
  {
    id: 'noir-track',
    featured: 'new',
    name: 'Noir Track',
    brand: 'Studds',
    tagline: 'Minimalist shell, maximalist protection',
    category: 'Full-face',
    certification: 'SHARP 5',
    price: 27999,
    rating: 4.5,
    reviewCount: 62,
    badge: 'New',
    description:
      'The Noir Track is a blacked-out performance full-face on a multi-composite fibreglass shell. ' +
      'An all-matte stealth finish, aggressive vents, and emergency-release cheek pads pair race-grade ' +
      'protection with understated looks for riders who want speed without the graphics.',
    highlights: [
      'Multi-composite fibreglass shell',
      'ISI + ECE 22.06 certified',
      'All-matte stealth finish',
      'Pinlock-ready anti-fog visor',
      'Emergency quick-release cheek pads',
    ],
    highlightStats: [
      { value: '1,470g', label: 'Composite fibreglass shell' },
      { value: 'SHARP 5★', label: 'Independent safety rating' },
      { value: 'Stealth', label: 'All-matte finish' },
    ],
    colors: [C.matteBlack, C.gunmetal, C.glossBlack, C.carbon],
    sizes: sizeSet(['xs', 'xxl'], { xs: 0, s: 6, m: 9, l: 5, xl: 2, xxl: 0 }),
    views: FULL_FACE_VIEWS,
    specs: [
      { label: 'Shell material', value: 'Multi-composite fibreglass' },
      { label: 'Certification', value: 'ISI, ECE 22.06' },
      { label: 'Weight', value: '1,470g ± 50g (size M)' },
      { label: 'Visor', value: 'Pinlock-ready, anti-scratch' },
      { label: 'Ventilation', value: '4 intake + 2 exhaust vents' },
      { label: 'Liner', value: 'Removable, anti-bacterial' },
      { label: 'Retention system', value: 'Double-D ring' },
      { label: 'Warranty', value: '2 years manufacturer warranty' },
    ],
    faqs: [
      FAQ_SIZING,
      {
        id: 'finish-care',
        question: 'How do I keep the matte finish looking good?',
        answer:
          'Clean the matte shell with a damp microfibre cloth and mild soap only — avoid polishes and ' +
          'solvent-based cleaners, which leave shiny patches on matte paint.',
      },
      FAQ_RETURNS,
    ],
    reviews: [
      {
        id: 'r1',
        author: 'Kabir Malhotra',
        rating: 5,
        date: '2026-06-05',
        title: 'Stealthy and seriously well made',
        body:
          'The all-black look is exactly what I wanted and the build feels premium. Vents move a ' +
          'surprising amount of air for such a clean shell.',
        verified: true,
      },
      {
        id: 'r2',
        author: 'Tanvi Joshi',
        rating: 4,
        date: '2026-05-11',
        title: 'Love it, runs a touch snug',
        body:
          'Gorgeous helmet and light on the head. It fits a little tight on the cheeks at first, but ' +
          'the pads settled in after a week of riding.',
        verified: true,
      },
    ],
  },
  {
    id: 'summit-adv-carbon',
    featured: 'new',
    name: 'Summit ADV Carbon',
    brand: 'Royal Enfield',
    tagline: 'The carbon adventure shell for cross-country riders',
    category: 'Adventure',
    certification: 'ECE 22.06',
    price: 39999,
    compareAtPrice: 43999,
    rating: 4.6,
    reviewCount: 51,
    badge: 'Premium',
    description:
      'The Summit ADV Carbon is a flagship adventure helmet on a hand-laid carbon-fibre shell, built ' +
      'for riders who cross states in a day. A removable peak and visor, expanded viewport for standing ' +
      'riding, and a moisture-wicking expedition liner make it the lightest way to go the distance.',
    highlights: [
      'Hand-laid carbon-fibre shell, sub-1,450g',
      'ISI + ECE 22.06 certified',
      'Removable peak + visor, goggle compatible',
      'Expanded viewport for standing riding',
      'Moisture-wicking removable expedition liner',
    ],
    highlightStats: [
      { value: '1,440g', label: 'Carbon-fibre shell' },
      { value: 'Removable', label: 'Peak + visor' },
      { value: 'ECE 22.06', label: 'ISI + ECE certified' },
    ],
    colors: [C.matteBlack, C.sand, C.ranger, C.titanium],
    sizes: sizeSet(['xxl'], { xs: 2, s: 5, m: 8, l: 6, xl: 3, xxl: 0 }),
    views: ADVENTURE_VIEWS,
    specs: [
      { label: 'Shell material', value: 'Carbon fibre composite' },
      { label: 'Certification', value: 'ISI, ECE 22.06' },
      { label: 'Weight', value: '1,440g ± 50g (size M)' },
      { label: 'Peak', value: 'Removable, tool-less' },
      { label: 'Visor', value: 'Anti-fog, goggle compatible' },
      { label: 'Ventilation', value: '5 intake + 3 exhaust vents' },
      { label: 'Liner', value: 'Removable, washable, moisture-wicking' },
      { label: 'Warranty', value: '5 years manufacturer warranty' },
    ],
    faqs: [
      FAQ_SIZING,
      {
        id: 'peak-highway',
        question: 'Is the carbon peak stable at touring speeds?',
        answer:
          'The peak is profiled to cut lift, so it stays composed to around 110kmph. For sustained ' +
          'motorway riding you can remove it tool-lessly and refit it before the trails.',
      },
      {
        id: 'carbon-care',
        question: 'How do I care for the carbon shell?',
        answer:
          'Wash with mild soap and a soft cloth, and store out of prolonged direct sun. Carbon is ' +
          'strong but the clear-coat can dull if left on a hot bike seat all day — use the helmet bag.',
      },
    ],
    reviews: [
      {
        id: 'r1',
        author: 'Rahul Verma',
        rating: 5,
        date: '2026-06-10',
        title: 'Lightest ADV helmet I have owned',
        body:
          'Rode Leh to Manali over two days and the low weight makes a real difference standing on the ' +
          'pegs. Viewport is huge and the vents work hard at altitude.',
        verified: true,
      },
      {
        id: 'r2',
        author: 'Divya Menon',
        rating: 4,
        date: '2026-05-08',
        title: 'Premium and feather-light, premium price',
        body:
          'The carbon shell feels fantastic and the fit is spot on. It is expensive, but for serious ' +
          'long-distance ADV riding it is worth it.',
        verified: true,
      },
    ],
  },
];

const OPEN_FACE_VIEWS = ['front', 'three-quarter', 'side', 'rear'];

const VIEWS_BY_CATEGORY: Record<string, string[]> = {
  'Full-face': FULL_FACE_VIEWS,
  Modular: MODULAR_VIEWS,
  Adventure: ADVENTURE_VIEWS,
  'Open-face': OPEN_FACE_VIEWS,
  Touring: FULL_FACE_VIEWS,
};

const CATEGORY_HIGHLIGHT: Record<string, string> = {
  'Full-face': 'Full-face shell with a wide anti-fog visor',
  Modular: 'One-touch flip-up chin bar',
  Adventure: 'Removable peak with a goggle-ready eyeport',
  'Open-face': 'Open-face comfort with a drop-down sun visor',
  Touring: 'Long-haul comfort liner tuned for low wind noise',
};

/** Rotating review blurbs — keeps the catalog realistic without bespoke copy per SKU. */
const REVIEW_POOL: Array<[string, string, string]> = [
  ['Aarav Sharma', 'Perfect fit and finish', 'True to size and the build quality feels well above the price.'],
  ['Isha Reddy', 'Great value for money', 'Comfortable on my daily commute and the visor seals well in the rain.'],
  ['Rohit Nair', 'Solid, dependable lid', 'Light on the head for long rides and the vents actually move air.'],
  ['Neha Kulkarni', 'Really happy with it', 'Looks premium, feels safe, and the strap is quick to use at every stop.'],
  ['Yusuf Khan', 'Would recommend', 'A few hundred kilometres in already and no complaints so far.'],
  ['Ananya Das', 'Comfortable and quiet', 'Wind noise is well controlled and the liner is soft against the cheeks.'],
];

interface HelmetSeed {
  id: string;
  name: string;
  brand: string;
  tagline: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  rating: number;
  reviewCount: number;
  badge?: string;
  certification: string;
  shell: string;
  colors: ColorOption[];
  /** Size ids that are out of stock; pass every id for a fully sold-out product. */
  soldOut?: string[];
  featured?: 'best' | 'new';
}

/**
 * Builds a fully-detailed helmet from the fields that actually vary per SKU,
 * templating the PDP-only detail (description/specs/faqs/reviews) so the catalog
 * can span enough products for the PLP filters/pagination to be meaningful without
 * hand-authoring identical boilerplate 16 times.
 */
function helmet(seed: HelmetSeed): Product {
  const views = VIEWS_BY_CATEGORY[seed.category] ?? FULL_FACE_VIEWS;
  const a1 = REVIEW_POOL[seed.reviewCount % REVIEW_POOL.length];
  const a2 = REVIEW_POOL[(seed.reviewCount + 3) % REVIEW_POOL.length];
  const r1 = Math.max(1, Math.min(5, Math.round(seed.rating)));
  const r2 = Math.max(1, Math.min(5, Math.round(seed.rating - 0.5)));
  return {
    id: seed.id,
    name: seed.name,
    brand: seed.brand,
    tagline: seed.tagline,
    category: seed.category,
    certification: seed.certification,
    price: seed.price,
    ...(seed.compareAtPrice ? { compareAtPrice: seed.compareAtPrice } : {}),
    rating: seed.rating,
    reviewCount: seed.reviewCount,
    ...(seed.badge ? { badge: seed.badge } : {}),
    ...(seed.featured ? { featured: seed.featured } : {}),
    description:
      `The ${seed.name} is a ${seed.category.toLowerCase()} helmet from ${seed.brand} — ` +
      `${seed.tagline.toLowerCase()}. Built on a ${seed.shell.toLowerCase()} shell and ${seed.certification} ` +
      `certified, it pairs everyday usability with the protection Indian roads demand.`,
    highlights: [
      `${seed.shell} shell`,
      `${seed.certification} certified`,
      CATEGORY_HIGHLIGHT[seed.category] ?? 'Aerodynamic, road-tuned shell',
      'Removable, washable, moisture-wicking liner',
      'Micrometric quick-release strap',
    ],
    colors: seed.colors,
    sizes: sizeSet(seed.soldOut),
    views,
    specs: [
      { label: 'Shell material', value: seed.shell },
      { label: 'Certification', value: seed.certification },
      { label: 'Weight', value: '1,500g ± 60g (size M)' },
      { label: 'Visor', value: 'Anti-scratch, UV-protective' },
      { label: 'Ventilation', value: 'Multi-channel intake + exhaust vents' },
      { label: 'Liner', value: 'Removable, washable' },
      { label: 'Retention system', value: 'Micrometric ratchet' },
      { label: 'Warranty', value: '2 years manufacturer warranty' },
    ],
    faqs: [FAQ_SIZING, FAQ_RETURNS],
    reviews: [
      { id: 'r1', author: a1[0], rating: r1, date: '2026-06-01', title: a1[1], body: a1[2], verified: true },
      { id: 'r2', author: a2[0], rating: r2, date: '2026-05-01', title: a2[1], body: a2[2], verified: false },
    ],
  };
}

/**
 * Extended catalog so the PLP has real breadth — 7 brands, 5 helmet types,
 * four certifications, and a price spread wide enough for the range filter and
 * pagination to do visible work. Includes one fully sold-out SKU for the
 * out-of-stock card + "in stock only" filter.
 */
const MORE_HELMETS: Product[] = [
  helmet({
    id: 'thunder-full-carbon', name: 'Thunder Full Carbon', brand: 'MT Helmets',
    tagline: 'Carbon-shell flagship for the fast lane', category: 'Full-face',
    price: 45999, compareAtPrice: 49999, rating: 4.8, reviewCount: 76, badge: 'Premium',
    certification: 'ECE 22.06', shell: 'Carbon fibre composite', featured: 'best',
    colors: [C.matteBlack, C.carbon, C.racingRed], soldOut: ['xxl'],
  }),
  helmet({
    id: 'stellar-mx', name: 'Stellar MX', brand: 'SMK',
    tagline: 'Dirt-ready dual-sport adventure lid', category: 'Adventure',
    price: 24999, rating: 4.3, reviewCount: 58,
    certification: 'DOT', shell: 'Fibreglass composite',
    colors: [C.matteBlack, C.sand, C.hiViz],
  }),
  helmet({
    id: 'rapide-sport', name: 'Rapide Sport', brand: 'Axor',
    tagline: 'Sharp everyday sport full-face', category: 'Full-face',
    price: 16999, rating: 4.4, reviewCount: 132,
    certification: 'ISI', shell: 'Polycarbonate',
    colors: [C.glossBlack, C.racingRed, C.titanium],
  }),
  helmet({
    id: 'metro-flip', name: 'Metro Flip', brand: 'Vega',
    tagline: 'City flip-up for stop-go commutes', category: 'Modular',
    price: 13999, rating: 4.1, reviewCount: 89,
    certification: 'ISI', shell: 'ABS thermoplastic',
    colors: [C.matteBlack, C.pearlWhite, C.gunmetal], soldOut: ['xs'],
  }),
  helmet({
    id: 'crusader-open', name: 'Crusader Open', brand: 'Steelbird',
    tagline: 'Classic open-face for short city hops', category: 'Open-face',
    price: 12999, rating: 4.0, reviewCount: 74,
    certification: 'DOT', shell: 'ABS thermoplastic',
    colors: [C.glossBlack, C.titanium, C.racingRed],
  }),
  helmet({
    id: 'ranger-adv-pro', name: 'Ranger ADV Pro', brand: 'Studds',
    tagline: 'Budget-friendly go-anywhere adventure', category: 'Adventure',
    price: 21999, rating: 4.4, reviewCount: 63,
    certification: 'ISI', shell: 'Fibreglass composite',
    colors: [C.ranger, C.sand, C.matteBlack],
  }),
  helmet({
    id: 'continental-gt', name: 'Continental GT', brand: 'Royal Enfield',
    tagline: 'Retro-touring comfort for the long road', category: 'Touring',
    price: 19999, rating: 4.5, reviewCount: 118,
    certification: 'ECE 22.06', shell: 'Thermoplastic alloy', featured: 'best',
    colors: [C.midnight, C.matteBlack, C.sand],
  }),
  helmet({
    id: 'apex-gp-carbon', name: 'Apex GP Carbon', brand: 'MT Helmets',
    tagline: 'Homologated race shell, sold out fast', category: 'Full-face',
    price: 47999, rating: 4.9, reviewCount: 44, badge: 'Track Ready',
    certification: 'SHARP 5', shell: 'Carbon fibre composite',
    colors: [C.carbon, C.glossBlack, C.racingRed],
    soldOut: ['xs', 's', 'm', 'l', 'xl', 'xxl'],
  }),
  helmet({
    id: 'voyager-tour', name: 'Voyager Tour', brand: 'SMK',
    tagline: 'Quiet, comfort-first touring full-face', category: 'Touring',
    price: 17999, rating: 4.3, reviewCount: 95,
    certification: 'ISI', shell: 'Thermoplastic alloy',
    colors: [C.gunmetal, C.pearlWhite, C.midnight],
  }),
  helmet({
    id: 'blaze-modular', name: 'Blaze Modular', brand: 'Axor',
    tagline: 'Flip-up versatility with a bold finish', category: 'Modular',
    price: 18499, rating: 4.2, reviewCount: 71,
    certification: 'ISI', shell: 'ABS thermoplastic',
    colors: [C.matteBlack, C.titanium, C.orange],
  }),
  helmet({
    id: 'street-classic', name: 'Street Classic', brand: 'Vega',
    tagline: 'Timeless open-face for the daily ride', category: 'Open-face',
    price: 13499, rating: 3.9, reviewCount: 52,
    certification: 'DOT', shell: 'ABS thermoplastic',
    colors: [C.glossBlack, C.pearlWhite, C.racingRed],
  }),
  helmet({
    id: 'sentinel-ff', name: 'Sentinel FF', brand: 'Steelbird',
    tagline: 'Dependable full-face that just works', category: 'Full-face',
    price: 14999, rating: 4.2, reviewCount: 108,
    certification: 'ISI', shell: 'Polycarbonate',
    colors: [C.matteBlack, C.midnight, C.hiViz],
  }),
  helmet({
    id: 'nomad-adv-carbon', name: 'Nomad ADV Carbon', brand: 'Studds',
    tagline: 'Featherweight carbon for cross-country', category: 'Adventure',
    price: 38999, compareAtPrice: 42999, rating: 4.6, reviewCount: 39, badge: 'New',
    certification: 'ECE 22.06', shell: 'Carbon fibre composite', featured: 'new',
    colors: [C.carbon, C.ranger, C.sand],
  }),
  helmet({
    id: 'himalayan-tour', name: 'Himalayan Tour', brand: 'Royal Enfield',
    tagline: 'High-altitude touring, built for the hills', category: 'Touring',
    price: 23999, rating: 4.5, reviewCount: 87,
    certification: 'ECE 22.06', shell: 'Fibreglass composite', featured: 'new',
    colors: [C.ranger, C.matteBlack, C.sand], soldOut: ['xxl'],
  }),
  helmet({
    id: 'vortex-rs', name: 'Vortex RS', brand: 'SMK',
    tagline: 'Stealth performance full-face', category: 'Full-face',
    price: 29999, rating: 4.5, reviewCount: 66, badge: 'New',
    certification: 'SHARP 5', shell: 'Multi-composite fibreglass', featured: 'new',
    colors: [C.matteBlack, C.gunmetal, C.racingRed],
  }),
  helmet({
    id: 'urban-lite-open', name: 'Urban Lite Open', brand: 'MT Helmets',
    tagline: 'Lightweight open-face for the city', category: 'Open-face',
    price: 13299, rating: 3.8, reviewCount: 61,
    certification: 'ISI', shell: 'ABS thermoplastic',
    colors: [C.pearlWhite, C.matteBlack, C.titanium],
  }),
];

export const PRODUCTS: Product[] = [...CORE_HELMETS, ...MORE_HELMETS];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((product) => product.id === id);
}

/** Products tagged for the "Bestsellers" home rail. Works on any catalog list. */
export function getBestsellers(list: Product[] = PRODUCTS): Product[] {
  return list.filter((product) => product.featured === 'best');
}

/** Products tagged for the "New Arrivals" home rail. Works on any catalog list. */
export function getNewArrivals(list: Product[] = PRODUCTS): Product[] {
  return list.filter((product) => product.featured === 'new');
}
