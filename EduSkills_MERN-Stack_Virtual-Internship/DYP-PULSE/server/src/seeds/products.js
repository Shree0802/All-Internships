import { resolveProductImage } from './seedImagesAndStock.js';

const makePlaceholder = (name, categoryOrBg = 'clothing') =>
  resolveProductImage(categoryOrBg, name);

export const seedProducts = [
  // ==========================================
  // DYPULSE PLAY: CRICKET (8 PRODUCTS)
  // ==========================================
  {
    name: 'SS Ton English Willow Cricket Bat',
    slug: 'ss-ton-english-willow-cricket-bat',
    description: 'Handcrafted Grade 1 English Willow cricket bat with massive edges, light pickup, and optimal balance for modern power hitting.',
    department: 'PLAY',
    categorySlug: 'cricket',
    subcategory: 'Bats',
    brand: 'SS',
    sport: 'cricket',
    priceInPaise: 499900, // ₹4,999
    compareAtPriceInPaise: 699900, // ₹6,999
    images: [{ url: makePlaceholder('SS Ton Cricket Bat'), alt: 'SS Ton Cricket Bat' }],
    variants: [
      { sku: 'SS-TON-BAT-SH', size: 'Short Handle', color: 'Natural Wood', stock: 25 },
      { sku: 'SS-TON-BAT-LH', size: 'Long Handle', color: 'Natural Wood', stock: 15 }
    ],
    specifications: { 'Willow Type': 'Grade 1 English Willow', Handle: '12-piece cane', Weight: '1190g' },
    tags: ['cricket', 'bat', 'english willow', 'ss'],
    isFeatured: true,
    isActive: true
  },
  {
    name: 'SG Club Leather Cricket Ball (Pack of 6)',
    slug: 'sg-club-leather-cricket-ball-pack-of-6',
    description: 'Four-piece alum tanned high-grade leather balls with granulated cork and rubber core, ideal for inter-college tournaments and nets.',
    department: 'PLAY',
    categorySlug: 'cricket',
    subcategory: 'Balls',
    brand: 'SG',
    sport: 'cricket',
    priceInPaise: 79900, // ₹799
    compareAtPriceInPaise: 99900,
    images: [{ url: makePlaceholder('SG Club Cricket Balls'), alt: 'SG Club Cricket Balls' }],
    variants: [
      { sku: 'SG-BALL-RED-6', size: 'Standard', color: 'Red', stock: 45 },
      { sku: 'SG-BALL-WHT-6', size: 'Standard', color: 'White', stock: 35 }
    ],
    specifications: { Material: 'Alum tanned leather', Core: 'Portuguese cork' },
    tags: ['cricket', 'ball', 'leather ball', 'sg'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Moonwalkr Cricket Batting Legguards',
    slug: 'moonwalkr-cricket-batting-legguards',
    description: 'Ultra-lightweight composite ballistic pads designed for unrestricted agility and lightning running between the wickets.',
    department: 'PLAY',
    categorySlug: 'cricket',
    subcategory: 'Protective Gear',
    brand: 'Moonwalkr',
    sport: 'cricket',
    priceInPaise: 249900, // ₹2,499
    compareAtPriceInPaise: 299900,
    images: [{ url: makePlaceholder('Moonwalkr Pads'), alt: 'Moonwalkr Pads' }],
    variants: [
      { sku: 'MW-PAD-M-WHT', size: 'Medium', color: 'White', stock: 20 },
      { sku: 'MW-PAD-L-WHT', size: 'Large', color: 'White', stock: 20 },
      { sku: 'MW-PAD-M-BLK', size: 'Medium', color: 'Matte Black', stock: 15 }
    ],
    specifications: { Weight: '480g per pad', Material: 'Ballistic Composite' },
    tags: ['cricket', 'pads', 'legguards', 'moonwalkr'],
    isFeatured: true,
    isActive: true
  },
  {
    name: 'DSC Intense Pro Batting Gloves',
    slug: 'dsc-intense-pro-batting-gloves',
    description: 'Premium sheep leather palm batting gloves with multi-flex ergonomic finger joints and reinforced fiber inserts for high-speed bowling impact.',
    department: 'PLAY',
    categorySlug: 'cricket',
    subcategory: 'Protective Gear',
    brand: 'DSC',
    sport: 'cricket',
    priceInPaise: 119900, // ₹1,199
    compareAtPriceInPaise: 149900,
    images: [{ url: makePlaceholder('DSC Batting Gloves'), alt: 'DSC Batting Gloves' }],
    variants: [
      { sku: 'DSC-GLV-RH-M', size: 'Adult M', color: 'White/Volt', stock: 30 },
      { sku: 'DSC-GLV-RH-L', size: 'Adult L', color: 'White/Volt', stock: 25 }
    ],
    specifications: { Palm: 'Supple sheep leather', Protection: 'Split finger fiber' },
    tags: ['cricket', 'gloves', 'dsc', 'batting'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Shrey Master Class Air Cricket Helmet',
    slug: 'shrey-master-class-air-cricket-helmet',
    description: 'High-impact titanium steel grille cricket helmet featuring extended rear protection and dual ventilation channels.',
    department: 'PLAY',
    categorySlug: 'cricket',
    subcategory: 'Protective Gear',
    brand: 'Shrey',
    sport: 'cricket',
    priceInPaise: 329900, // ₹3,299
    compareAtPriceInPaise: 399900,
    images: [{ url: makePlaceholder('Shrey Helmet'), alt: 'Shrey Helmet' }],
    variants: [
      { sku: 'SHR-HLM-NAVY-M', size: 'Medium', color: 'Navy', stock: 18 },
      { sku: 'SHR-HLM-NAVY-L', size: 'Large', color: 'Navy', stock: 14 }
    ],
    specifications: { Certification: 'BSI 7928:2013', Grille: 'Carbon steel' },
    tags: ['cricket', 'helmet', 'shrey', 'protective'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Kookaburra Dypulse Wheelie Cricket Kitbag',
    slug: 'kookaburra-dypulse-wheelie-cricket-kitbag',
    description: 'Heavy-duty 1680D nylon tournament wheelie bag with internal triple bat cave and ventilated footwear pocket.',
    department: 'PLAY',
    categorySlug: 'cricket',
    subcategory: 'Kitbags',
    brand: 'Kookaburra',
    sport: 'cricket',
    priceInPaise: 279900, // ₹2,799
    compareAtPriceInPaise: 349900,
    images: [{ url: makePlaceholder('Kookaburra Wheelie Kitbag'), alt: 'Kookaburra Kitbag' }],
    variants: [
      { sku: 'KB-BAG-WHL-BLK', size: 'Large (100L)', color: 'Black/Teal', stock: 22 }
    ],
    specifications: { Capacity: '105 Liters', Material: '1680D Ballistic Nylon' },
    tags: ['cricket', 'bag', 'wheelie', 'kitbag'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Cosco Championship Heavy Cricket Tennis Balls (Pack of 6)',
    slug: 'cosco-championship-heavy-cricket-tennis-balls-pack-of-6',
    description: 'Heavyweight durable felt tennis balls engineered for high bounce and durability on campus concrete pitches and turf.',
    department: 'PLAY',
    categorySlug: 'cricket',
    subcategory: 'Balls',
    brand: 'Cosco',
    sport: 'cricket',
    priceInPaise: 39900, // ₹399
    compareAtPriceInPaise: 49900,
    images: [{ url: makePlaceholder('Cosco Cricket Tennis Balls'), alt: 'Cosco Tennis Balls' }],
    variants: [
      { sku: 'CSC-TNS-YEL-6', size: 'Pack of 6', color: 'Fluorescent Yellow', stock: 65 }
    ],
    specifications: { Core: 'Pressurized Heavy Rubber', Weight: '125g each' },
    tags: ['cricket', 'tennis ball', 'cosco', 'gully cricket'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'SS Match Master Padded Batting Inner Gloves',
    slug: 'ss-match-master-padded-batting-inner-gloves',
    description: 'Breathable 100% cotton chamois batting inner gloves with sweat absorption and padded palm pads to prolong batting glove life.',
    department: 'PLAY',
    categorySlug: 'cricket',
    subcategory: 'Accessories',
    brand: 'SS',
    sport: 'cricket',
    priceInPaise: 24900, // ₹249
    compareAtPriceInPaise: 34900,
    images: [{ url: makePlaceholder('SS Batting Inner Gloves'), alt: 'Inner Gloves' }],
    variants: [
      { sku: 'SS-INR-GLV-M', size: 'Adult Free Size', color: 'White', stock: 75 }
    ],
    specifications: { Material: '100% Cotton Towel Palm', Cuff: 'Elasticated Rib' },
    tags: ['cricket', 'inner gloves', 'ss', 'accessories'],
    isFeatured: false,
    isActive: true
  },

  // ==========================================
  // DYPULSE PLAY: FOOTBALL (8 PRODUCTS)
  // ==========================================
  {
    name: 'Nivia Storm Match Football (Size 5)',
    slug: 'nivia-storm-match-football-size-5',
    description: 'FIFA Basic certified 32-panel thermal bonded football with reinforced latex bladder, built for fast campus turf and grass matches.',
    department: 'PLAY',
    categorySlug: 'football',
    subcategory: 'Footballs',
    brand: 'Nivia',
    sport: 'football',
    priceInPaise: 89900, // ₹899
    compareAtPriceInPaise: 119900,
    images: [{ url: makePlaceholder('Nivia Storm Football'), alt: 'Nivia Storm Football' }],
    variants: [
      { sku: 'NIV-STM-SZ5-WHT', size: 'Size 5', color: 'White/Orange', stock: 40 },
      { sku: 'NIV-STM-SZ5-YEL', size: 'Size 5', color: 'Volt Yellow', stock: 30 }
    ],
    specifications: { Certification: 'FIFA Basic', Construction: 'Thermal Bonded' },
    tags: ['football', 'nivia', 'match ball', 'turf'],
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Cosco Milano Pro Goalkeeper Gloves',
    slug: 'cosco-milano-pro-goalkeeper-gloves',
    description: '3.5mm German Contact latex palms with negative cut stitch construction and removable spines for high-velocity shot stopping.',
    department: 'PLAY',
    categorySlug: 'football',
    subcategory: 'Goalkeeper Gear',
    brand: 'Cosco',
    sport: 'football',
    priceInPaise: 129900, // ₹1,299
    compareAtPriceInPaise: 169900,
    images: [{ url: makePlaceholder('Cosco Milano Goalkeeper Gloves'), alt: 'Cosco Goalkeeper Gloves' }],
    variants: [
      { sku: 'CSC-GK-SZ8', size: 'Size 8', color: 'Cyan/Black', stock: 20 },
      { sku: 'CSC-GK-SZ9', size: 'Size 9', color: 'Cyan/Black', stock: 25 },
      { sku: 'CSC-GK-SZ10', size: 'Size 10', color: 'Cyan/Black', stock: 15 }
    ],
    specifications: { Palm: '3.5mm Contact Latex', Cut: 'Negative Cut' },
    tags: ['football', 'gloves', 'goalkeeper', 'cosco'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Nivia Shining Star Official Tournament Football',
    slug: 'nivia-shining-star-official-tournament-football',
    description: 'Top-tier official tournament match football featuring micro-textured PU outer cover, butyl air-retention bladder, and aerodynamic seam bonding.',
    department: 'PLAY',
    categorySlug: 'football',
    subcategory: 'Footballs',
    brand: 'Nivia',
    sport: 'football',
    priceInPaise: 149900, // ₹1,499
    compareAtPriceInPaise: 199900,
    images: [{ url: makePlaceholder('Nivia Shining Star Football'), alt: 'Shining Star Football' }],
    variants: [
      { sku: 'NIV-STAR-SZ5', size: 'Size 5', color: 'Silver/Navy', stock: 25 }
    ],
    specifications: { PanelCount: '32 Panels', Surface: 'Micro-Grain PU' },
    tags: ['football', 'nivia', 'shining star', 'fifa'],
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Nivia Carbon Flex Shin Guards',
    slug: 'nivia-carbon-flex-shin-guards',
    description: 'Anatomically shaped high-impact PP shell shin guards with EVA cushioning foam and dual compression sleeves.',
    department: 'PLAY',
    categorySlug: 'football',
    subcategory: 'Protective Gear',
    brand: 'Nivia',
    sport: 'football',
    priceInPaise: 39900, // ₹399
    compareAtPriceInPaise: 49900,
    images: [{ url: makePlaceholder('Nivia Shin Guards'), alt: 'Nivia Shin Guards' }],
    variants: [
      { sku: 'NIV-SHN-M', size: 'Medium', color: 'Black/Silver', stock: 35 },
      { sku: 'NIV-SHN-L', size: 'Large', color: 'Black/Silver', stock: 35 }
    ],
    specifications: { Shell: 'Reinforced Polypropylene', Backing: 'Perforated EVA' },
    tags: ['football', 'shin guards', 'nivia', 'protective'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'DYPULSE Varsity Football Training Cones (Set of 20)',
    slug: 'dypulse-varsity-football-training-cones-set-of-20',
    description: 'Flexible shatterproof saucer training cones with carrier stand for speed drills, dribbling circuits, and agility practice.',
    department: 'PLAY',
    categorySlug: 'football',
    subcategory: 'Training Accessories',
    brand: 'DYPULSE PLAY',
    sport: 'football',
    priceInPaise: 44900, // ₹449
    compareAtPriceInPaise: 59900,
    images: [{ url: makePlaceholder('DYPULSE Training Cones'), alt: 'Training Cones' }],
    variants: [
      { sku: 'DYP-CONE-20-MULTI', size: 'Set of 20', color: 'Multi-Color', stock: 50 }
    ],
    specifications: { Material: 'Flexible LDPE', Includes: '20 Cones + Metal Carry Rack' },
    tags: ['football', 'training', 'cones', 'agility'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'DYPULSE Pro-Grip Breathable Anti-Slip Football Socks',
    slug: 'dypulse-pro-grip-breathable-anti-slip-football-socks',
    description: 'Silicone chevron grip pads underfoot lock feet into cleats, reducing blisters and maximizing explosive change-of-direction cuts.',
    department: 'PLAY',
    categorySlug: 'football',
    subcategory: 'Apparel',
    brand: 'DYPULSE PLAY',
    sport: 'football',
    priceInPaise: 39900, // ₹399
    compareAtPriceInPaise: 54900,
    images: [{ url: makePlaceholder('DYPULSE Football Grip Socks'), alt: 'Grip Socks' }],
    variants: [
      { sku: 'DYP-GRP-SCK-WHT', size: 'Free Size (UK 7-11)', color: 'White', stock: 60 },
      { sku: 'DYP-GRP-SCK-BLK', size: 'Free Size (UK 7-11)', color: 'Black', stock: 55 }
    ],
    specifications: { GripMaterial: 'Hexagonal Non-Slip Silicone', Fabric: 'Spandex Poly-Blend' },
    tags: ['football', 'grip socks', 'anti-slip', 'accessories'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'DYPULSE Pop-Up Mini Football Target Goals (Pair)',
    slug: 'dypulse-pop-up-mini-football-target-goals-pair',
    description: 'Instant folding fiberglass pop-up football target nets with ground stakes and zip carry bag for campus dorm lawn practice.',
    department: 'PLAY',
    categorySlug: 'football',
    subcategory: 'Training',
    brand: 'DYPULSE PLAY',
    sport: 'football',
    priceInPaise: 119900, // ₹1,199
    compareAtPriceInPaise: 149900,
    images: [{ url: makePlaceholder('DYPULSE Pop-Up Goals'), alt: 'Pop-Up Goal Nets' }],
    variants: [
      { sku: 'DYP-GL-MINI-PAIR', size: '4ft x 2.5ft (Pair)', color: 'Neon Yellow/Black', stock: 20 }
    ],
    specifications: { Dimensions: '120cm x 80cm', Net: 'Knotted Weatherproof Dacron' },
    tags: ['football', 'goal net', 'target', 'training'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'DYPULSE Official Tournament Captain Armband & Whistle Kit',
    slug: 'dypulse-official-tournament-captain-armband-and-whistle-kit',
    description: 'High-visibility elastic captain armband with hook-and-loop closure plus a pea-less 115dB pea referee whistle with lanyard.',
    department: 'PLAY',
    categorySlug: 'football',
    subcategory: 'Accessories',
    brand: 'DYPULSE PLAY',
    sport: 'football',
    priceInPaise: 24900, // ₹249
    compareAtPriceInPaise: 39900,
    images: [{ url: makePlaceholder('Captain Armband and Whistle'), alt: 'Captain Armband' }],
    variants: [
      { sku: 'DYP-CAPT-KIT', size: 'Standard', color: 'Volt Yellow/Black', stock: 80 }
    ],
    specifications: { Armband: 'Elastic Nylon with Velcro', Whistle: 'Pealess High-Pitch 115dB' },
    tags: ['football', 'captain', 'armband', 'whistle'],
    isFeatured: false,
    isActive: true
  },

  // ==========================================
  // DYPULSE PLAY: BASKETBALL (7 PRODUCTS)
  // ==========================================
  {
    name: 'Spalding TF-150 Outdoor Basketball (Size 7)',
    slug: 'spalding-tf-150-outdoor-basketball-size-7',
    description: 'Durable rubber cover with deep channel design providing superior grip on rough outdoor college asphalt courts.',
    department: 'PLAY',
    categorySlug: 'basketball',
    subcategory: 'Basketballs',
    brand: 'Spalding',
    sport: 'basketball',
    priceInPaise: 99900, // ₹999
    compareAtPriceInPaise: 139900,
    images: [{ url: makePlaceholder('Spalding TF-150 Basketball'), alt: 'Spalding Basketball' }],
    variants: [
      { sku: 'SPL-BB-SZ7-ORG', size: 'Size 7', color: 'Brick Orange', stock: 45 }
    ],
    specifications: { Size: 'Size 7 (Official 29.5")', Surface: 'Outdoor concrete/asphalt' },
    tags: ['basketball', 'spalding', 'outdoor', 'sports'],
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Wilson Evolution Indoor Game Basketball (Size 7)',
    slug: 'wilson-evolution-indoor-game-basketball-size-7',
    description: 'Microfiber composite cover with laid-in composite channels provides supreme touch, moisture control, and tournament grip.',
    department: 'PLAY',
    categorySlug: 'basketball',
    subcategory: 'Basketballs',
    brand: 'Wilson',
    sport: 'basketball',
    priceInPaise: 139900, // ₹1,399
    compareAtPriceInPaise: 189900,
    images: [{ url: makePlaceholder('Wilson Evolution Basketball'), alt: 'Wilson Basketball' }],
    variants: [
      { sku: 'WLS-EVO-SZ7', size: 'Size 7', color: 'Classic Amber', stock: 30 }
    ],
    specifications: { Cover: 'Evo Microfiber Composite', Channels: 'Pebbled Composite' },
    tags: ['basketball', 'wilson', 'indoor', 'game ball'],
    isFeatured: true,
    isActive: true
  },
  {
    name: 'DYPULSE Slam Dunk Reversible Mesh Basketball Jersey',
    slug: 'dypulse-slam-dunk-reversible-mesh-basketball-jersey',
    description: 'Dual-layer breathable open-hole mesh reversible tank top for full-court pick-up runs, tournaments, and team practice scrimmages.',
    department: 'PLAY',
    categorySlug: 'basketball',
    subcategory: 'Jerseys',
    brand: 'DYPULSE PLAY',
    sport: 'basketball',
    priceInPaise: 84900, // ₹849
    compareAtPriceInPaise: 119900,
    images: [{ url: makePlaceholder('DYPULSE Reversible Jersey'), alt: 'Reversible Basketball Jersey' }],
    variants: [
      { sku: 'DYP-BB-JRS-S', size: 'S', color: 'Navy / White', stock: 25 },
      { sku: 'DYP-BB-JRS-M', size: 'M', color: 'Navy / White', stock: 40 },
      { sku: 'DYP-BB-JRS-L', size: 'L', color: 'Navy / White', stock: 35 },
      { sku: 'DYP-BB-JRS-XL', size: 'XL', color: 'Navy / White', stock: 20 }
    ],
    specifications: { Material: '100% Breathable Poly Mesh', Reversible: 'Yes (Dual Sided)' },
    tags: ['basketball', 'jersey', 'mesh', 'reversible'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'DYPULSE Dual-Action Heavy-Duty Ball Pump with Gauge',
    slug: 'dypulse-dual-action-heavy-duty-ball-pump-with-gauge',
    description: 'High-volume dual-action pump inflates on both push and pull strokes with integrated PSI pressure gauge and flexible hose.',
    department: 'PLAY',
    categorySlug: 'basketball',
    subcategory: 'Accessories',
    brand: 'DYPULSE PLAY',
    sport: 'basketball',
    priceInPaise: 44900, // ₹449
    compareAtPriceInPaise: 64900,
    images: [{ url: makePlaceholder('DYPULSE Ball Pump'), alt: 'Ball Pump with Gauge' }],
    variants: [
      { sku: 'DYP-PUMP-BLK', size: 'Standard', color: 'Matte Black', stock: 50 }
    ],
    specifications: { Action: 'Dual-Action Bi-Directional', Includes: '3 Needles + Gauge + Flexible Hose' },
    tags: ['basketball', 'ball pump', 'pressure gauge', 'football'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'DYPULSE Padded Compression Arm & Elbow Sleeves (Pair)',
    slug: 'dypulse-padded-compression-arm-and-elbow-sleeves-pair',
    description: 'Targeted honeycomb EVA elbow protection with gradient muscle compression to stabilize shooting arm and reduce fatigue.',
    department: 'PLAY',
    categorySlug: 'basketball',
    subcategory: 'Protective Gear',
    brand: 'DYPULSE PLAY',
    sport: 'basketball',
    priceInPaise: 49900, // ₹499
    compareAtPriceInPaise: 69900,
    images: [{ url: makePlaceholder('DYPULSE Arm Sleeves'), alt: 'Padded Arm Sleeves' }],
    variants: [
      { sku: 'DYP-SLV-M-BLK', size: 'Medium', color: 'Stealth Black', stock: 35 },
      { sku: 'DYP-SLV-L-BLK', size: 'Large', color: 'Stealth Black', stock: 30 }
    ],
    specifications: { Padding: 'Honeycomb Molded EVA', Compression: 'Graduated 15-20 mmHg' },
    tags: ['basketball', 'arm sleeve', 'compression', 'shooting sleeve'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Spalding Weatherproof Heavy-Duty Basketball Rim Net',
    slug: 'spalding-weatherproof-heavy-duty-basketball-rim-net',
    description: 'Anti-whip 12-loop braided polyester net treated with UV coating to withstand harsh college weather and outdoor slam dunks.',
    department: 'PLAY',
    categorySlug: 'basketball',
    subcategory: 'Accessories',
    brand: 'Spalding',
    sport: 'basketball',
    priceInPaise: 29900, // ₹299
    compareAtPriceInPaise: 44900,
    images: [{ url: makePlaceholder('Spalding Rim Net'), alt: 'Basketball Net' }],
    variants: [
      { sku: 'SPL-NET-WHT-12L', size: '12 Loops', color: 'White/Red/Blue', stock: 70 }
    ],
    specifications: { Loops: '12 Standard Loops', Construction: 'Heavy-Duty Braided Nylon' },
    tags: ['basketball', 'net', 'rim', 'accessories'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'DYPULSE Fastbreak Athletic Basketball Shorts',
    slug: 'dypulse-fastbreak-athletic-basketball-shorts',
    description: '10-inch inseam relaxed-fit basketball shorts with wide comfort waistband, drawstring, and deep pockets designed to hold essentials.',
    department: 'PLAY',
    categorySlug: 'basketball',
    subcategory: 'Apparel',
    brand: 'DYPULSE PLAY',
    sport: 'basketball',
    priceInPaise: 74900, // ₹749
    compareAtPriceInPaise: 99900,
    images: [{ url: makePlaceholder('Fastbreak Basketball Shorts'), alt: 'Basketball Shorts' }],
    variants: [
      { sku: 'DYP-BB-SHRT-M', size: 'M', color: 'Solid Black', stock: 35 },
      { sku: 'DYP-BB-SHRT-L', size: 'L', color: 'Solid Black', stock: 30 },
      { sku: 'DYP-BB-SHRT-XL', size: 'XL', color: 'Solid Black', stock: 25 }
    ],
    specifications: { Inseam: '10 Inches', Material: '100% Moisture-Wicking Poly' },
    tags: ['basketball', 'shorts', 'fastbreak', 'apparel'],
    isFeatured: false,
    isActive: true
  },

  // ==========================================
  // DYPULSE PLAY: BADMINTON (7 PRODUCTS)
  // ==========================================
  {
    name: 'Yonex Muscle Power 29 Carbon Badminton Racquet',
    slug: 'yonex-muscle-power-29-carbon-badminton-racquet',
    description: 'Isometric head shape badminton racquet made of high-modulus graphite that delivers sharp smashes and rapid net-kill response.',
    department: 'PLAY',
    categorySlug: 'badminton',
    subcategory: 'Racquets',
    brand: 'Yonex',
    sport: 'badminton',
    priceInPaise: 219900, // ₹2,199
    compareAtPriceInPaise: 279900,
    images: [{ url: makePlaceholder('Yonex Badminton Racquet'), alt: 'Yonex Badminton Racquet' }],
    variants: [
      { sku: 'YNX-MP29-3UG4', size: '3U (88g)', color: 'Metallic Red', stock: 35 },
      { sku: 'YNX-MP29-3UG5', size: '3U (88g)', color: 'Matte Blue', stock: 25 }
    ],
    specifications: { Frame: 'Full Carbon Graphite', StringTension: 'Up to 30 lbs' },
    tags: ['badminton', 'yonex', 'racquet', 'carbon'],
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Yonex Mavis 350 Nylon Shuttlecocks (Pack of 6)',
    slug: 'yonex-mavis-350-nylon-shuttlecocks-pack-of-6',
    description: 'Precision engineered nylon skirt shuttlecocks with natural Portuguese cork base, offering recovery performance close to feather shuttles.',
    department: 'PLAY',
    categorySlug: 'badminton',
    subcategory: 'Shuttlecocks',
    brand: 'Yonex',
    sport: 'badminton',
    priceInPaise: 84900, // ₹849
    compareAtPriceInPaise: 99900,
    images: [{ url: makePlaceholder('Yonex Mavis 350 Shuttlecocks'), alt: 'Yonex Shuttlecocks' }],
    variants: [
      { sku: 'YNX-M350-YEL-SLW', size: 'Pack of 6', color: 'Yellow (Slow)', stock: 50 },
      { sku: 'YNX-M350-YEL-MED', size: 'Pack of 6', color: 'Yellow (Medium)', stock: 65 }
    ],
    specifications: { Skirt: 'Precision Nylon', Base: 'Natural Cork' },
    tags: ['badminton', 'shuttlecock', 'yonex', 'mavis 350'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Yonex Astrox 99 Pro Tour Badminton Racquet',
    slug: 'yonex-astrox-99-pro-tour-badminton-racquet',
    description: 'Head-heavy power frame equipped with Rotational Generator System and Namd graphite for relentless steep smashes and drive dominance.',
    department: 'PLAY',
    categorySlug: 'badminton',
    subcategory: 'Racquets',
    brand: 'Yonex',
    sport: 'badminton',
    priceInPaise: 349900, // ₹3,499
    compareAtPriceInPaise: 429900,
    images: [{ url: makePlaceholder('Yonex Astrox 99 Pro'), alt: 'Astrox 99 Racquet' }],
    variants: [
      { sku: 'YNX-AX99-4UG5', size: '4U (83g)', color: 'Cherry Sunburst', stock: 18 }
    ],
    specifications: { Balance: 'Head Heavy', Shaft: 'Extra Slim Namd' },
    tags: ['badminton', 'racquet', 'yonex', 'astrox'],
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Li-Ning G-Tek Carbon Power Badminton Racquet',
    slug: 'li-ning-g-tek-carbon-power-badminton-racquet',
    description: 'Aerodynamic high-tensile carbon graphite racket with dynamic-optimum frame geometry for fast swing speeds and effortless clears.',
    department: 'PLAY',
    categorySlug: 'badminton',
    subcategory: 'Racquets',
    brand: 'Li-Ning',
    sport: 'badminton',
    priceInPaise: 129900, // ₹1,299
    compareAtPriceInPaise: 179900,
    images: [{ url: makePlaceholder('Li-Ning G-Tek Racquet'), alt: 'Li-Ning Racquet' }],
    variants: [
      { sku: 'LN-GTEK-BLK', size: '3U (86g)', color: 'Matte Black/Gold', stock: 30 }
    ],
    specifications: { Frame: 'High Tensile Carbon', Flex: 'Medium' },
    tags: ['badminton', 'racquet', 'li-ning', 'carbon'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Yonex Aerosensa 2 Feather Tournament Shuttlecocks (Tube of 12)',
    slug: 'yonex-aerosensa-2-feather-tournament-shuttlecocks-tube-of-12',
    description: 'Grade 1 goose feather tournament shuttlecocks providing flight stability, precise trajectory, and crisp impact sound.',
    department: 'PLAY',
    categorySlug: 'badminton',
    subcategory: 'Shuttlecocks',
    brand: 'Yonex',
    sport: 'badminton',
    priceInPaise: 169900, // ₹1,699
    compareAtPriceInPaise: 219900,
    images: [{ url: makePlaceholder('Yonex Feather Shuttles'), alt: 'Feather Shuttlecocks' }],
    variants: [
      { sku: 'YNX-AS2-TUBE', size: 'Tube of 12', color: 'White Feathers', stock: 40 }
    ],
    specifications: { Feathers: '100% Goose Feathers', Speed: 'Speed 77 (Medium)' },
    tags: ['badminton', 'feather shuttle', 'tournament', 'yonex'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'DYPULSE Super Tacky Anti-Slip Badminton Grip Tapes (Pack of 5)',
    slug: 'dypulse-super-tacky-anti-slip-badminton-grip-tapes-pack-of-5',
    description: 'Ultra-absorbent polyurethane overgrips with moisture-wicking perforations ensuring zero slip during intense rally tiebreaks.',
    department: 'PLAY',
    categorySlug: 'badminton',
    subcategory: 'Accessories',
    brand: 'DYPULSE PLAY',
    sport: 'badminton',
    priceInPaise: 29900, // ₹299
    compareAtPriceInPaise: 49900,
    images: [{ url: makePlaceholder('DYPULSE Badminton Grips'), alt: 'Badminton Overgrips' }],
    variants: [
      { sku: 'DYP-GRP-5PK-MULTI', size: 'Pack of 5', color: 'Assorted Multi', stock: 90 }
    ],
    specifications: { Thickness: '0.6mm', Material: 'High-Tack Polyurethane' },
    tags: ['badminton', 'grip', 'overgrip', 'accessories'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'DYPULSE Double Compartment Thermal Badminton Kitbag',
    slug: 'dypulse-double-compartment-thermal-badminton-kitbag',
    description: 'Thermo-guard foil lined double compartment bag holds up to 6 racquets with dedicated shoe tunnel and padded backpack straps.',
    department: 'PLAY',
    categorySlug: 'badminton',
    subcategory: 'Bags',
    brand: 'DYPULSE PLAY',
    sport: 'badminton',
    priceInPaise: 119900, // ₹1,199
    compareAtPriceInPaise: 169900,
    images: [{ url: makePlaceholder('DYPULSE Badminton Bag'), alt: 'Thermal Badminton Bag' }],
    variants: [
      { sku: 'DYP-BDM-BAG-NVY', size: 'Holds 6 Rackets', color: 'Varsity Navy/Volt', stock: 25 }
    ],
    specifications: { ThermalLining: 'Yes', Capacity: '6 Rackets + Footwear' },
    tags: ['badminton', 'kitbag', 'thermal', 'racket bag'],
    isFeatured: false,
    isActive: true
  },

  // ==========================================
  // DYPULSE PLAY: RUNNING (7 PRODUCTS)
  // ==========================================
  {
    name: 'Puma Fast-Trac Nitro Lightweight Running Shoes',
    slug: 'puma-fast-trac-nitro-lightweight-running-shoes',
    description: 'Dual-foam nitrogen-injected midsole running shoes engineered for fast 5k sprints and long-distance campus cardio laps.',
    department: 'PLAY',
    categorySlug: 'running',
    subcategory: 'Running Shoes',
    brand: 'Puma',
    sport: 'running',
    priceInPaise: 349900, // ₹3,499
    compareAtPriceInPaise: 499900,
    images: [{ url: makePlaceholder('Puma Nitro Running Shoes'), alt: 'Puma Running Shoes' }],
    variants: [
      { sku: 'PUM-RUN-UK7', size: 'UK 7', color: 'Neon Lime', stock: 15 },
      { sku: 'PUM-RUN-UK8', size: 'UK 8', color: 'Neon Lime', stock: 28 },
      { sku: 'PUM-RUN-UK9', size: 'UK 9', color: 'Neon Lime', stock: 22 },
      { sku: 'PUM-RUN-UK10', size: 'UK 10', color: 'Neon Lime', stock: 14 }
    ],
    specifications: { Drop: '8mm', Weight: '240g', Foam: 'Nitro Cushioning' },
    tags: ['running', 'shoes', 'puma', 'nitro', 'marathon'],
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Asics Gel-Contend 8 Breathable Road Running Shoes',
    slug: 'asics-gel-contend-8-breathable-road-running-shoes',
    description: 'Rearfoot GEL technology cushioning with durable jacquard mesh upper and AmpliFoam midsole for daily campus jogger comfort.',
    department: 'PLAY',
    categorySlug: 'running',
    subcategory: 'Running Shoes',
    brand: 'Asics',
    sport: 'running',
    priceInPaise: 299900, // ₹2,999
    compareAtPriceInPaise: 399900,
    images: [{ url: makePlaceholder('Asics Gel-Contend 8'), alt: 'Asics Running Shoes' }],
    variants: [
      { sku: 'ASC-GEL-UK8', size: 'UK 8', color: 'Midnight/Electric Blue', stock: 20 },
      { sku: 'ASC-GEL-UK9', size: 'UK 9', color: 'Midnight/Electric Blue', stock: 25 },
      { sku: 'ASC-GEL-UK10', size: 'UK 10', color: 'Midnight/Electric Blue', stock: 15 }
    ],
    specifications: { Technology: 'Rearfoot GEL', Upper: 'Jacquard Mesh' },
    tags: ['running', 'shoes', 'asics', 'gel cushioning'],
    isFeatured: true,
    isActive: true
  },
  {
    name: 'DYPULSE Aeroflow 2-in-1 Compression Running Shorts',
    slug: 'dypulse-aeroflow-2-in-1-compression-running-shorts',
    description: 'Built-in anti-chafing inner compression liner with dedicated drop-in phone pocket and breathable featherlight woven outer shell.',
    department: 'PLAY',
    categorySlug: 'running',
    subcategory: 'Apparel',
    brand: 'DYPULSE PLAY',
    sport: 'running',
    priceInPaise: 74900, // ₹749
    compareAtPriceInPaise: 109900,
    images: [{ url: makePlaceholder('DYPULSE 2-in-1 Shorts'), alt: 'Running Shorts' }],
    variants: [
      { sku: 'DYP-RUN-SHRT-M', size: 'M (30-32)', color: 'Graphite Grey', stock: 35 },
      { sku: 'DYP-RUN-SHRT-L', size: 'L (32-34)', color: 'Graphite Grey', stock: 30 }
    ],
    specifications: { Inseam: '5 Inches', Features: 'Drop-In Phone Pocket + Anti-Chafe Liner' },
    tags: ['running', 'shorts', '2-in-1', 'compression'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'DYPULSE Hydration Running Waistpack & Phone Belt',
    slug: 'dypulse-hydration-running-waistpack-and-phone-belt',
    description: 'Bounce-free ergonomic running belt with expandable zipper pocket for phones up to 6.8", dual gel loops, and key carabiner clip.',
    department: 'PLAY',
    categorySlug: 'running',
    subcategory: 'Accessories',
    brand: 'DYPULSE PLAY',
    sport: 'running',
    priceInPaise: 49900, // ₹499
    compareAtPriceInPaise: 69900,
    images: [{ url: makePlaceholder('DYPULSE Running Belt'), alt: 'Running Waistpack' }],
    variants: [
      { sku: 'DYP-RN-BLT-BLK', size: 'One Size (Adjustable)', color: 'Stealth Black', stock: 45 }
    ],
    specifications: { Fit: 'Adjustable 26-44 Inch Waist', Waterproofing: 'Sweat-Resistant TPU' },
    tags: ['running', 'waistpack', 'hydration', 'belt'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'DYPULSE Ultra-Lightweight Breathable Running Singlet',
    slug: 'dypulse-ultra-lightweight-breathable-running-singlet',
    description: 'Under 80g featherweight athletic race vest engineered with bonded flatlock seams to prevent friction and maximize airflow.',
    department: 'PLAY',
    categorySlug: 'running',
    subcategory: 'Apparel',
    brand: 'DYPULSE PLAY',
    sport: 'running',
    priceInPaise: 59900, // ₹599
    compareAtPriceInPaise: 89900,
    images: [{ url: makePlaceholder('DYPULSE Running Singlet'), alt: 'Running Singlet' }],
    variants: [
      { sku: 'DYP-SNG-M-ORG', size: 'M', color: 'Volt Orange', stock: 30 },
      { sku: 'DYP-SNG-L-ORG', size: 'L', color: 'Volt Orange', stock: 25 }
    ],
    specifications: { Weight: '78g', Fabric: 'Micro-Grid Quick-Dry Poly' },
    tags: ['running', 'singlet', 'vest', 'marathon'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Nivia High-Precision Digital Sports Stopwatch & Lap Timer',
    slug: 'nivia-high-precision-digital-sports-stopwatch-and-lap-timer',
    description: '1/100 second accuracy chronograph with dual split lap memory, calendar display, alarm, and shock-resistant grip casing.',
    department: 'PLAY',
    categorySlug: 'running',
    subcategory: 'Accessories',
    brand: 'Nivia',
    sport: 'running',
    priceInPaise: 34900, // ₹349
    compareAtPriceInPaise: 49900,
    images: [{ url: makePlaceholder('Nivia Sports Stopwatch'), alt: 'Sports Stopwatch' }],
    variants: [
      { sku: 'NIV-STP-WCH', size: 'Standard', color: 'Black/Yellow', stock: 50 }
    ],
    specifications: { Accuracy: '1/100th Second', Memory: 'Dual Split Lap' },
    tags: ['running', 'stopwatch', 'timer', 'nivia', 'track'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'DYPULSE Reflective Night-Runner Cap with Laser Perforations',
    slug: 'dypulse-reflective-night-runner-cap-with-laser-perforations',
    description: 'Featherweight moisture-wicking running cap with 360-degree high-luminescence reflective trims and laser-cut side ventilation holes.',
    department: 'PLAY',
    categorySlug: 'running',
    subcategory: 'Headwear',
    brand: 'DYPULSE PLAY',
    sport: 'running',
    priceInPaise: 44900, // ₹449
    compareAtPriceInPaise: 59900,
    images: [{ url: makePlaceholder('DYPULSE Runner Cap'), alt: 'Runner Cap' }],
    variants: [
      { sku: 'DYP-RUN-CAP-BLK', size: 'Adjustable', color: 'Charcoal / Reflective', stock: 40 }
    ],
    specifications: { Weight: '52g', UVProtection: 'UPF 50+' },
    tags: ['running', 'cap', 'reflective', 'night run'],
    isFeatured: false,
    isActive: true
  },

  // ==========================================
  // DYPULSE PLAY: FITNESS & GYM (8 PRODUCTS)
  // ==========================================
  {
    name: 'DYPULSE Precision High-Speed Jump Rope',
    slug: 'dypulse-precision-high-speed-jump-rope',
    description: '360-degree dual ball bearing steel wire speed rope designed for crossfit double-unders, boxers, and athletic conditioning.',
    department: 'PLAY',
    categorySlug: 'fitness-gym',
    subcategory: 'Conditioning',
    brand: 'DYPULSE PLAY',
    sport: 'fitness',
    priceInPaise: 39900, // ₹399
    compareAtPriceInPaise: 59900,
    images: [{ url: makePlaceholder('DYPULSE Speed Jump Rope'), alt: 'Speed Rope' }],
    variants: [
      { sku: 'DYP-ROPE-BLK', size: 'Adjustable 3M', color: 'Midnight Black', stock: 55 },
      { sku: 'DYP-ROPE-RED', size: 'Adjustable 3M', color: 'Crimson Red', stock: 40 }
    ],
    specifications: { Cable: 'Coated braided steel wire', Bearings: 'Double 360 rotation' },
    tags: ['fitness', 'jump rope', 'crossfit', 'speed'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Boldfit Power Resistance Loop Bands (Set of 5)',
    slug: 'boldfit-power-resistance-loop-bands-set-of-5',
    description: 'Natural 100% Malaysian latex resistance bands ranging from X-Light (5 lbs) to X-Heavy (40 lbs) for dorm workouts and rehab.',
    department: 'PLAY',
    categorySlug: 'fitness-gym',
    subcategory: 'Resistance Gear',
    brand: 'Boldfit',
    sport: 'fitness',
    priceInPaise: 49900, // ₹499
    compareAtPriceInPaise: 79900,
    images: [{ url: makePlaceholder('Boldfit Resistance Bands'), alt: 'Resistance Bands' }],
    variants: [
      { sku: 'BLD-BND-SET5', size: 'Set of 5', color: 'Color-Coded Gradient', stock: 60 }
    ],
    specifications: { Material: '100% Natural Latex', Resistance: '5 lbs to 40 lbs' },
    tags: ['fitness', 'resistance bands', 'gym', 'boldfit'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'DYPULSE IronGrip Hex Dumbbell Pair (5kg x 2)',
    slug: 'dypulse-irongrip-hex-dumbbell-pair-5kg-x-2',
    description: 'Solid cast iron anti-roll hex dumbbells encased in thick virgin rubber with ergonomic knurled chrome handles.',
    department: 'PLAY',
    categorySlug: 'fitness-gym',
    subcategory: 'Weights',
    brand: 'DYPULSE PLAY',
    sport: 'fitness',
    priceInPaise: 169900, // ₹1,699
    compareAtPriceInPaise: 219900,
    images: [{ url: makePlaceholder('DYPULSE Hex Dumbbells'), alt: 'Hex Dumbbells' }],
    variants: [
      { sku: 'DYP-DB-5KG', size: 'Pair (10kg Total)', color: 'Cast Black', stock: 20 }
    ],
    specifications: { Weight: '5 kg each', Core: 'Solid Cast Iron', Coating: 'Virgin Rubber' },
    tags: ['fitness', 'dumbbells', 'weights', 'gym'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Boldfit 100% Stainless Steel Gym Shaker Bottle (750ml)',
    slug: 'boldfit-100-stainless-steel-gym-shaker-bottle-750ml',
    description: 'Odor-free food-grade stainless steel protein shaker bottle with leak-proof flip cap, measurement markings, and wire whisk ball.',
    department: 'PLAY',
    categorySlug: 'fitness-gym',
    subcategory: 'Hydration',
    brand: 'Boldfit',
    sport: 'fitness',
    priceInPaise: 64900, // ₹649
    compareAtPriceInPaise: 89900,
    images: [{ url: makePlaceholder('Boldfit Steel Shaker'), alt: 'Steel Gym Shaker' }],
    variants: [
      { sku: 'BLD-SHK-750-SLV', size: '750 ml', color: 'Brushed Silver', stock: 50 },
      { sku: 'BLD-SHK-750-BLK', size: '750 ml', color: 'Matte Black', stock: 45 }
    ],
    specifications: { Material: 'Pro 304 Stainless Steel', Capacity: '750 ml' },
    tags: ['fitness', 'shaker', 'protein', 'stainless steel'],
    isFeatured: true,
    isActive: true
  },
  {
    name: 'DYPULSE 10mm Heavy-Duty Leather Weightlifting Lever Belt',
    slug: 'dypulse-10mm-heavy-duty-leather-weightlifting-lever-belt',
    description: 'Competition-spec vegetable tanned genuine suede leather belt with zinc-alloy rapid lever buckle for squat and deadlift spine support.',
    department: 'PLAY',
    categorySlug: 'fitness-gym',
    subcategory: 'Support',
    brand: 'DYPULSE PLAY',
    sport: 'fitness',
    priceInPaise: 149900, // ₹1,499
    compareAtPriceInPaise: 219900,
    images: [{ url: makePlaceholder('DYPULSE Lever Belt'), alt: 'Weightlifting Belt' }],
    variants: [
      { sku: 'DYP-BLT-M', size: 'M (28-34")', color: 'Onyx Suede', stock: 20 },
      { sku: 'DYP-BLT-L', size: 'L (34-40")', color: 'Onyx Suede', stock: 25 }
    ],
    specifications: { Thickness: '10mm Uniform', Buckle: 'Chrome Quick-Release Lever' },
    tags: ['fitness', 'weightlifting', 'lever belt', 'gym'],
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Kobo Non-Slip 8mm High-Density TPE Workout & Yoga Mat',
    slug: 'kobo-non-slip-8mm-high-density-tpe-workout-and-yoga-mat',
    description: 'Eco-friendly double-sided textured grip mat offering spine cushioning on hard hostel tiles, with alignment lines and carry strap.',
    department: 'PLAY',
    categorySlug: 'fitness-gym',
    subcategory: 'Mats',
    brand: 'Kobo',
    sport: 'fitness',
    priceInPaise: 79900, // ₹799
    compareAtPriceInPaise: 119900,
    images: [{ url: makePlaceholder('Kobo Workout Mat'), alt: 'Workout Yoga Mat' }],
    variants: [
      { sku: 'KOB-MAT-8MM-BLU', size: '183cm x 61cm x 8mm', color: 'Ocean Blue/Grey', stock: 35 }
    ],
    specifications: { Thickness: '8mm High Density', Material: '100% Non-Toxic TPE' },
    tags: ['fitness', 'yoga mat', 'exercise', 'kobo'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'USI Universal Padded Weightlifting Wrist Wraps (Pair)',
    slug: 'usi-universal-padded-weightlifting-wrist-wraps-pair',
    description: 'Heavy elastane reinforced cotton wrist wraps with thumb loops and heavy-duty industrial velcro for bench presses and overhead lifts.',
    department: 'PLAY',
    categorySlug: 'fitness-gym',
    subcategory: 'Accessories',
    brand: 'USI',
    sport: 'fitness',
    priceInPaise: 34900, // ₹349
    compareAtPriceInPaise: 49900,
    images: [{ url: makePlaceholder('USI Wrist Wraps'), alt: 'Wrist Wraps' }],
    variants: [
      { sku: 'USI-WRP-18IN', size: '18 Inch Length', color: 'Black/Red Stripe', stock: 60 }
    ],
    specifications: { Length: '18 Inches', Closure: 'Wide Heavy-Duty Velcro' },
    tags: ['fitness', 'wrist wraps', 'lifting', 'gym'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'DYPULSE Multi-Grip Doorway Pull-Up & Chin-Up Bar',
    slug: 'dypulse-multi-grip-doorway-pull-up-and-chin-up-bar',
    description: 'No-screw leverage doorway bar with foam grip handles supporting wide, narrow, and neutral grip upper-body strength training.',
    department: 'PLAY',
    categorySlug: 'fitness-gym',
    subcategory: 'Strength',
    brand: 'DYPULSE PLAY',
    sport: 'fitness',
    priceInPaise: 129900, // ₹1,299
    compareAtPriceInPaise: 179900,
    images: [{ url: makePlaceholder('DYPULSE Pull-Up Bar'), alt: 'Doorway Pull-Up Bar' }],
    variants: [
      { sku: 'DYP-PULLUP-BAR', size: 'Fits standard 24-32" doors', color: 'Black/Chrome', stock: 25 }
    ],
    specifications: { WeightCapacity: '130 kg', Frame: 'Heavy Gauge Steel' },
    tags: ['fitness', 'pull up bar', 'calisthenics', 'home gym'],
    isFeatured: false,
    isActive: true
  },

  // ==========================================
  // DYPULSE PLAY: SPORTS FOOTWEAR (4 PRODUCTS)
  // ==========================================
  {
    name: 'Puma Attacanto FG Turf Football Boots',
    slug: 'puma-attacanto-fg-turf-football-boots',
    description: 'Low-maintenance synthetic upper football boots with conical and bladed studs for optimal acceleration on firm ground and artificial grass.',
    department: 'PLAY',
    categorySlug: 'sports-footwear',
    subcategory: 'Football Boots',
    brand: 'Puma',
    sport: 'football',
    priceInPaise: 229900, // ₹2,299
    compareAtPriceInPaise: 299900,
    images: [{ url: makePlaceholder('Puma Football Boots'), alt: 'Puma Football Boots' }],
    variants: [
      { sku: 'PUM-FB-UK7', size: 'UK 7', color: 'Electric Blue', stock: 15 },
      { sku: 'PUM-FB-UK8', size: 'UK 8', color: 'Electric Blue', stock: 25 },
      { sku: 'PUM-FB-UK9', size: 'UK 9', color: 'Electric Blue', stock: 20 },
      { sku: 'PUM-FB-UK10', size: 'UK 10', color: 'Electric Blue', stock: 12 }
    ],
    specifications: { Outsole: 'Multi-ground TPU', Weight: '235g' },
    tags: ['football', 'boots', 'puma', 'cleats'],
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Nivia Pro Court Basketball Shoes',
    slug: 'nivia-pro-court-basketball-shoes',
    description: 'High-top padded ankle collar basketball sneakers with herringbone traction sole for hard cuts and quick pivots.',
    department: 'PLAY',
    categorySlug: 'sports-footwear',
    subcategory: 'Basketball Shoes',
    brand: 'Nivia',
    sport: 'basketball',
    priceInPaise: 179900, // ₹1,799
    compareAtPriceInPaise: 249900,
    images: [{ url: makePlaceholder('Nivia Basketball Shoes'), alt: 'Nivia Basketball Shoes' }],
    variants: [
      { sku: 'NIV-BB-UK8', size: 'UK 8', color: 'Black/Red', stock: 18 },
      { sku: 'NIV-BB-UK9', size: 'UK 9', color: 'Black/Red', stock: 24 },
      { sku: 'NIV-BB-UK10', size: 'UK 10', color: 'Black/Red', stock: 16 }
    ],
    specifications: { Collar: 'High Top Ankle Support', Sole: 'Non-marking Rubber' },
    tags: ['basketball', 'shoes', 'nivia', 'footwear'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Yonex Power Cushion Pro Indoor Badminton Shoes',
    slug: 'yonex-power-cushion-pro-indoor-badminton-shoes',
    description: 'Hexagrip non-marking gum rubber court shoes with Power Cushion impact absorption for rapid lunges and court stability.',
    department: 'PLAY',
    categorySlug: 'sports-footwear',
    subcategory: 'Badminton Shoes',
    brand: 'Yonex',
    sport: 'badminton',
    priceInPaise: 269900, // ₹2,699
    compareAtPriceInPaise: 349900,
    images: [{ url: makePlaceholder('Yonex Badminton Shoes'), alt: 'Yonex Badminton Shoes' }],
    variants: [
      { sku: 'YNX-SH-UK8', size: 'UK 8', color: 'White/Cyan', stock: 20 },
      { sku: 'YNX-SH-UK9', size: 'UK 9', color: 'White/Cyan', stock: 25 },
      { sku: 'YNX-SH-UK10', size: 'UK 10', color: 'White/Cyan', stock: 18 }
    ],
    specifications: { Sole: 'Hexagrip Gum Rubber Non-Marking', Midsole: 'Power Cushion EVA' },
    tags: ['badminton', 'shoes', 'yonex', 'court shoes'],
    isFeatured: true,
    isActive: true
  },
  {
    name: 'SG Tournament Leather Cricket Spikes',
    slug: 'sg-tournament-leather-cricket-spikes',
    description: 'High-traction full metal/rubber interchangeable spike cricket shoes with molded EVA midsole and reinforced toe cap protection.',
    department: 'PLAY',
    categorySlug: 'sports-footwear',
    subcategory: 'Cricket Spikes',
    brand: 'SG',
    sport: 'cricket',
    priceInPaise: 219900, // ₹2,199
    compareAtPriceInPaise: 289900,
    images: [{ url: makePlaceholder('SG Cricket Spikes'), alt: 'Cricket Spike Shoes' }],
    variants: [
      { sku: 'SG-SPK-UK8', size: 'UK 8', color: 'White/Navy', stock: 18 },
      { sku: 'SG-SPK-UK9', size: 'UK 9', color: 'White/Navy', stock: 22 },
      { sku: 'SG-SPK-UK10', size: 'UK 10', color: 'White/Navy', stock: 15 }
    ],
    specifications: { Spikes: 'Configurable TPU + Steel Spikes', Upper: 'Full Grain PU Leather' },
    tags: ['cricket', 'shoes', 'spikes', 'sg'],
    isFeatured: false,
    isActive: true
  },

  // ==========================================
  // DYPULSE PLAY: SPORTS JERSEYS & KITS (4 PRODUCTS)
  // ==========================================
  {
    name: 'DYPULSE Varsity Athletic Training Shorts',
    slug: 'dypulse-varsity-athletic-training-shorts',
    description: '4-way stretch moisture-wicking athletic shorts with concealed phone zipper pocket and breathable mesh side vents.',
    department: 'PLAY',
    categorySlug: 'sports-jerseys',
    subcategory: 'Apparel',
    brand: 'DYPULSE PLAY',
    sport: 'fitness',
    priceInPaise: 69900, // ₹699
    compareAtPriceInPaise: 99900,
    images: [{ url: makePlaceholder('DYPULSE Training Shorts'), alt: 'Training Shorts' }],
    variants: [
      { sku: 'DYP-SHRT-BLK-S', size: 'S', color: 'Black', stock: 20 },
      { sku: 'DYP-SHRT-BLK-M', size: 'M', color: 'Black', stock: 35 },
      { sku: 'DYP-SHRT-BLK-L', size: 'L', color: 'Black', stock: 30 },
      { sku: 'DYP-SHRT-NVY-M', size: 'M', color: 'Navy', stock: 25 }
    ],
    specifications: { Inseam: '7 inches', Fabric: '88% Polyester, 12% Spandex' },
    tags: ['play', 'shorts', 'fitness', 'athletic'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'DYPULSE Matchday Poly-Mesh Sports Jersey',
    slug: 'dypulse-matchday-poly-mesh-sports-jersey',
    description: 'Pro-grade sublimated collegiate match jersey with anti-bacterial finish and quick-dry hydro-ventilation fabric.',
    department: 'PLAY',
    categorySlug: 'sports-jerseys',
    subcategory: 'Jerseys',
    brand: 'DYPULSE PLAY',
    sport: 'football',
    priceInPaise: 89900, // ₹899
    compareAtPriceInPaise: 129900,
    images: [{ url: makePlaceholder('DYPULSE Matchday Jersey'), alt: 'Matchday Jersey' }],
    variants: [
      { sku: 'DYP-JRS-BLU-S', size: 'S', color: 'Electric Blue', stock: 25 },
      { sku: 'DYP-JRS-BLU-M', size: 'M', color: 'Electric Blue', stock: 40 },
      { sku: 'DYP-JRS-BLU-L', size: 'L', color: 'Electric Blue', stock: 35 },
      { sku: 'DYP-JRS-BLU-XL', size: 'XL', color: 'Electric Blue', stock: 20 }
    ],
    specifications: { Fabric: '100% Interlock Poly-Mesh', Fit: 'Athletic Tournament Fit' },
    tags: ['jersey', 'team kit', 'play', 'matchday'],
    isFeatured: true,
    isActive: true
  },
  {
    name: 'DYPULSE Inter-Department Championship Cricket Whites Jersey',
    slug: 'dypulse-inter-department-championship-cricket-whites-jersey',
    description: 'Collegiate test-match half-sleeve cream white jersey with rib polo collar and mesh side inserts for cooling in long cricket innings.',
    department: 'PLAY',
    categorySlug: 'sports-jerseys',
    subcategory: 'Jerseys',
    brand: 'DYPULSE PLAY',
    sport: 'cricket',
    priceInPaise: 79900, // ₹799
    compareAtPriceInPaise: 109900,
    images: [{ url: makePlaceholder('DYPULSE Cricket Whites'), alt: 'Cricket Whites Jersey' }],
    variants: [
      { sku: 'DYP-CRK-WHT-M', size: 'M', color: 'Cream White', stock: 30 },
      { sku: 'DYP-CRK-WHT-L', size: 'L', color: 'Cream White', stock: 35 }
    ],
    specifications: { Material: '100% Jacquard Micro-Poly', SunProtection: 'UPF 40+' },
    tags: ['cricket', 'whites', 'jersey', 'team kit'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'DYPULSE Pro-Compression Quick-Dry Baselayer Top',
    slug: 'dypulse-pro-compression-quick-dry-baselayer-top',
    description: 'Second-skin long-sleeve compression baselayer with 4-way stretch fabric that retains body warmth and wicks sweat during cold morning training.',
    department: 'PLAY',
    categorySlug: 'sports-jerseys',
    subcategory: 'Baselayers',
    brand: 'DYPULSE PLAY',
    sport: 'fitness',
    priceInPaise: 64900, // ₹649
    compareAtPriceInPaise: 89900,
    images: [{ url: makePlaceholder('DYPULSE Baselayer Top'), alt: 'Compression Baselayer' }],
    variants: [
      { sku: 'DYP-CMP-BLK-M', size: 'M', color: 'Solid Black', stock: 30 },
      { sku: 'DYP-CMP-BLK-L', size: 'L', color: 'Solid Black', stock: 25 }
    ],
    specifications: { Fabric: '85% Poly, 15% Elastane', Seams: 'Flatlock Anti-Chafe' },
    tags: ['compression', 'baselayer', 'fitness', 'training'],
    isFeatured: false,
    isActive: true
  },

  // ==========================================
  // DYPULSE CAMPUS: CLOTHING (7 PRODUCTS)
  // ==========================================
  {
    name: 'DYPULSE Signature Oversized Boxy Tee',
    slug: 'dypulse-signature-oversized-boxy-tee',
    description: '240 GSM drop-shoulder premium streetwear tee with high-density ribbed collar that maintains structure wash after wash.',
    department: 'CAMPUS',
    categorySlug: 'clothing',
    subcategory: 'T-Shirts',
    brand: 'DYPULSE CAMPUS',
    priceInPaise: 79900, // ₹799
    compareAtPriceInPaise: 99900,
    images: [{ url: makePlaceholder('DYPULSE Oversized Tee'), alt: 'Oversized Tee' }],
    variants: [
      { sku: 'DYP-TEE-BLK-S', size: 'S', color: 'Washed Black', stock: 30 },
      { sku: 'DYP-TEE-BLK-M', size: 'M', color: 'Washed Black', stock: 50 },
      { sku: 'DYP-TEE-BLK-L', size: 'L', color: 'Washed Black', stock: 45 },
      { sku: 'DYP-TEE-WHT-M', size: 'M', color: 'Clean White', stock: 40 },
      { sku: 'DYP-TEE-WHT-L', size: 'L', color: 'Clean White', stock: 35 }
    ],
    specifications: { GSM: '240 GSM Single Jersey', Fit: 'Boxy Drop-Shoulder' },
    tags: ['t-shirt', 'oversized', 'streetwear', 'campus'],
    isFeatured: true,
    isActive: true
  },
  {
    name: 'DYPULSE Campus Relaxed Cargo Trackpants',
    slug: 'dypulse-campus-relaxed-cargo-trackpants',
    description: 'Durable cotton-twill cargo joggers featuring 6 functional pockets, elasticated waistband with metal-tipped drawcords, and cinch ankles.',
    department: 'CAMPUS',
    categorySlug: 'clothing',
    subcategory: 'Bottoms',
    brand: 'DYPULSE CAMPUS',
    priceInPaise: 139900, // ₹1,399
    compareAtPriceInPaise: 179900,
    images: [{ url: makePlaceholder('DYPULSE Cargo Trackpants'), alt: 'Cargo Pants' }],
    variants: [
      { sku: 'DYP-CRG-OLV-M', size: 'M (30-32)', color: 'Olive Drab', stock: 25 },
      { sku: 'DYP-CRG-OLV-L', size: 'L (32-34)', color: 'Olive Drab', stock: 30 },
      { sku: 'DYP-CRG-BLK-M', size: 'M (30-32)', color: 'Pitch Black', stock: 35 },
      { sku: 'DYP-CRG-BLK-L', size: 'L (32-34)', color: 'Pitch Black', stock: 30 }
    ],
    specifications: { Fabric: '98% Cotton, 2% Elastane Twill', Pockets: '6 Utilitarian Pockets' },
    tags: ['cargo', 'pants', 'joggers', 'campus'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'DYPULSE Classic College Polo Shirt',
    slug: 'dypulse-classic-college-polo-shirt',
    description: 'Cotton pique knit polo shirt featuring custom tipped knit collar, mother-of-pearl buttons, and discrete embroidered university crest.',
    department: 'CAMPUS',
    categorySlug: 'clothing',
    subcategory: 'Polos',
    brand: 'DYPULSE CAMPUS',
    priceInPaise: 94900, // ₹949
    compareAtPriceInPaise: 119900,
    images: [{ url: makePlaceholder('DYPULSE College Polo'), alt: 'Polo Shirt' }],
    variants: [
      { sku: 'DYP-POLO-NVY-M', size: 'M', color: 'Navy/White', stock: 25 },
      { sku: 'DYP-POLO-NVY-L', size: 'L', color: 'Navy/White', stock: 30 },
      { sku: 'DYP-POLO-BUR-M', size: 'M', color: 'Burgundy', stock: 20 }
    ],
    specifications: { Knit: 'Honeycomb Pique', Composition: '100% Ring-Spun Cotton' },
    tags: ['polo', 'casual', 'college', 'clothing'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'DYPULSE Retro Zip-Up Track Jacket',
    slug: 'dypulse-retro-zip-up-track-jacket',
    description: 'Vintage 90s colorblock lightweight polyester track jacket with stand collar, raglan sleeves, and custom metal pullers.',
    department: 'CAMPUS',
    categorySlug: 'clothing',
    subcategory: 'Jackets',
    brand: 'DYPULSE CAMPUS',
    priceInPaise: 169900, // ₹1,699
    compareAtPriceInPaise: 219900,
    images: [{ url: makePlaceholder('DYPULSE Retro Track Jacket'), alt: 'Track Jacket' }],
    variants: [
      { sku: 'DYP-TRK-TEAL-M', size: 'M', color: 'Teal/Navy/White', stock: 20 },
      { sku: 'DYP-TRK-TEAL-L', size: 'L', color: 'Teal/Navy/White', stock: 25 }
    ],
    specifications: { Lining: 'Breathable Poly-Mesh', Shell: 'Taslan Matte Nylon' },
    tags: ['jacket', 'streetwear', 'retro', 'outerwear'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'DYPULSE Varsity Baseball Cap',
    slug: 'dypulse-varsity-baseball-cap',
    description: '6-panel structured low-profile baseball cap with pre-curved visor, antique brass buckle adjuster, and 3D embroidered DP emblem.',
    department: 'CAMPUS',
    categorySlug: 'clothing',
    subcategory: 'Headwear',
    brand: 'DYPULSE CAMPUS',
    priceInPaise: 49900, // ₹499
    compareAtPriceInPaise: 69900,
    images: [{ url: makePlaceholder('DYPULSE Varsity Cap'), alt: 'Varsity Cap' }],
    variants: [
      { sku: 'DYP-CAP-NAVY', size: 'One Size (Adjustable)', color: 'Varsity Navy', stock: 45 },
      { sku: 'DYP-CAP-BLK', size: 'One Size (Adjustable)', color: 'Solid Black', stock: 40 }
    ],
    specifications: { Panels: '6 Panels Structured', Closure: 'Brass Buckle Tuck-in' },
    tags: ['cap', 'hat', 'headwear', 'accessories'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'DYPULSE Heavyweight Boxy Drop-Shoulder Graphic Tee',
    slug: 'dypulse-heavyweight-boxy-drop-shoulder-graphic-tee',
    description: '260 GSM high-density screenprinted heavyweight tee with custom "Feel The Campus" typography across the back.',
    department: 'CAMPUS',
    categorySlug: 'clothing',
    subcategory: 'T-Shirts',
    brand: 'DYPULSE CAMPUS',
    priceInPaise: 84900, // ₹849
    compareAtPriceInPaise: 109900,
    images: [{ url: makePlaceholder('DYPULSE Graphic Tee'), alt: 'Graphic Tee' }],
    variants: [
      { sku: 'DYP-GPH-M', size: 'M', color: 'Vintage Olive', stock: 35 },
      { sku: 'DYP-GPH-L', size: 'L', color: 'Vintage Olive', stock: 40 }
    ],
    specifications: { GSM: '260 GSM French Cotton', Print: 'High-Density Puff & Screen' },
    tags: ['t-shirt', 'graphic', 'streetwear', 'campus'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'DYPULSE Heritage Cotton Chino Trousers',
    slug: 'dypulse-heritage-cotton-chino-trousers',
    description: 'Smart-casual stretch cotton chinos with welt rear pockets, tailored tapered fit, and comfortable stain-resistant finish.',
    department: 'CAMPUS',
    categorySlug: 'clothing',
    subcategory: 'Bottoms',
    brand: 'DYPULSE CAMPUS',
    priceInPaise: 129900, // ₹1,299
    compareAtPriceInPaise: 169900,
    images: [{ url: makePlaceholder('DYPULSE Chino Trousers'), alt: 'Chino Trousers' }],
    variants: [
      { sku: 'DYP-CHN-KHK-32', size: '32 Waist', color: 'Classic Khaki', stock: 25 },
      { sku: 'DYP-CHN-KHK-34', size: '34 Waist', color: 'Classic Khaki', stock: 25 }
    ],
    specifications: { Fabric: '97% Cotton, 3% Spandex', Fit: 'Tailored Tapered' },
    tags: ['chinos', 'pants', 'trousers', 'casual'],
    isFeatured: false,
    isActive: true
  },

  // ==========================================
  // DYPULSE CAMPUS: HOODIES & SWEATSHIRTS (5 PRODUCTS)
  // ==========================================
  {
    name: 'DYPULSE Heavyweight Collegiate Varsity Hoodie',
    slug: 'dypulse-heavyweight-collegiate-varsity-hoodie',
    description: '380 GSM combed cotton French terry hoodie with double-lined drawstring hood, chenille chest lettering, and ribbed cuffs.',
    department: 'CAMPUS',
    categorySlug: 'hoodies-sweatshirts',
    subcategory: 'Hoodies',
    brand: 'DYPULSE CAMPUS',
    priceInPaise: 189900, // ₹1,899
    compareAtPriceInPaise: 249900,
    images: [{ url: makePlaceholder('DYPULSE Varsity Hoodie'), alt: 'Varsity Hoodie' }],
    variants: [
      { sku: 'DYP-HD-NVY-S', size: 'S', color: 'Deep Navy', stock: 20 },
      { sku: 'DYP-HD-NVY-M', size: 'M', color: 'Deep Navy', stock: 40 },
      { sku: 'DYP-HD-NVY-L', size: 'L', color: 'Deep Navy', stock: 35 },
      { sku: 'DYP-HD-NVY-XL', size: 'XL', color: 'Deep Navy', stock: 25 },
      { sku: 'DYP-HD-OAT-M', size: 'M', color: 'Oatmeal Heather', stock: 30 },
      { sku: 'DYP-HD-OAT-L', size: 'L', color: 'Oatmeal Heather', stock: 25 }
    ],
    specifications: { GSM: '380 GSM Heavyweight', Material: '100% Combed Cotton' },
    tags: ['hoodie', 'campus', 'varsity', 'winter wear'],
    isFeatured: true,
    isActive: true
  },
  {
    name: 'DYPULSE Campus Core Crewneck Sweatshirt',
    slug: 'dypulse-campus-core-crewneck-sweatshirt',
    description: '320 GSM fleece crewneck pullover with relaxed armholes, triangle V-stitch collar insert, and super-soft brushed interior.',
    department: 'CAMPUS',
    categorySlug: 'hoodies-sweatshirts',
    subcategory: 'Sweatshirts',
    brand: 'DYPULSE CAMPUS',
    priceInPaise: 129900, // ₹1,299
    compareAtPriceInPaise: 159900,
    images: [{ url: makePlaceholder('DYPULSE Core Crewneck'), alt: 'Crewneck Sweatshirt' }],
    variants: [
      { sku: 'DYP-CRW-GRY-S', size: 'S', color: 'Melange Grey', stock: 20 },
      { sku: 'DYP-CRW-GRY-M', size: 'M', color: 'Melange Grey', stock: 35 },
      { sku: 'DYP-CRW-GRY-L', size: 'L', color: 'Melange Grey', stock: 30 }
    ],
    specifications: { GSM: '320 GSM Brushed Fleece', Fit: 'Standard Relaxed' },
    tags: ['sweatshirt', 'crewneck', 'winter wear', 'campus'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'DYPULSE 450 GSM Heavy French Terry Boxy Zip Hoodie',
    slug: 'dypulse-450-gsm-heavy-french-terry-boxy-zip-hoodie',
    description: 'Ultra-heavyweight 450 GSM boxy zip hoodie with dual two-way antique silver YKK zippers and kangaroo hand pockets.',
    department: 'CAMPUS',
    categorySlug: 'hoodies-sweatshirts',
    subcategory: 'Zip Hoodies',
    brand: 'DYPULSE CAMPUS',
    priceInPaise: 219900, // ₹2,199
    compareAtPriceInPaise: 289900,
    images: [{ url: makePlaceholder('DYPULSE 450GSM Zip Hoodie'), alt: 'Heavyweight Zip Hoodie' }],
    variants: [
      { sku: 'DYP-ZIP-BLK-M', size: 'M', color: 'Faded Black', stock: 25 },
      { sku: 'DYP-ZIP-BLK-L', size: 'L', color: 'Faded Black', stock: 30 }
    ],
    specifications: { Weight: '450 GSM Ultra-Heavy French Terry', Zippers: 'Two-Way YKK Silver' },
    tags: ['hoodie', 'zip hoodie', 'heavyweight', 'streetwear'],
    isFeatured: true,
    isActive: true
  },
  {
    name: 'DYPULSE Vintage Athletic Quarter-Zip Fleece Pullover',
    slug: 'dypulse-vintage-athletic-quarter-zip-fleece-pullover',
    description: 'Collegiate mock-neck quarter-zip fleece pullover with elasticated cuffs, warm thermal lining, and embroidered varsity monogram.',
    department: 'CAMPUS',
    categorySlug: 'hoodies-sweatshirts',
    subcategory: 'Quarter-Zips',
    brand: 'DYPULSE CAMPUS',
    priceInPaise: 149900, // ₹1,499
    compareAtPriceInPaise: 199900,
    images: [{ url: makePlaceholder('DYPULSE Quarter Zip'), alt: 'Quarter Zip Fleece' }],
    variants: [
      { sku: 'DYP-QTR-FOR-M', size: 'M', color: 'Forest Green', stock: 25 },
      { sku: 'DYP-QTR-FOR-L', size: 'L', color: 'Forest Green', stock: 25 }
    ],
    specifications: { Collar: 'Mock Neck with Brass Zip', Fabric: '300 GSM Polar Fleece' },
    tags: ['quarter-zip', 'fleece', 'pullover', 'varsity'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'DYPULSE College Crest Embroidered Relaxed Hoodie',
    slug: 'dypulse-college-crest-embroidered-relaxed-hoodie',
    description: 'Subtle high-density embroidered university crest on the chest with soft peach-finish fleece and ribbed hem.',
    department: 'CAMPUS',
    categorySlug: 'hoodies-sweatshirts',
    subcategory: 'Hoodies',
    brand: 'DYPULSE CAMPUS',
    priceInPaise: 179900, // ₹1,799
    compareAtPriceInPaise: 229900,
    images: [{ url: makePlaceholder('DYPULSE Crest Hoodie'), alt: 'Crest Hoodie' }],
    variants: [
      { sku: 'DYP-CRST-BUR-M', size: 'M', color: 'Deep Burgundy', stock: 25 },
      { sku: 'DYP-CRST-BUR-L', size: 'L', color: 'Deep Burgundy', stock: 30 }
    ],
    specifications: { GSM: '350 GSM Combed Fleece', Detail: 'Satin Thread Embroidery' },
    tags: ['hoodie', 'embroidered', 'collegiate', 'winter wear'],
    isFeatured: false,
    isActive: true
  },

  // ==========================================
  // DYPULSE CAMPUS: SNEAKERS (6 PRODUCTS)
  // ==========================================
  {
    name: 'Puma Rebound Retro Court High-Top Sneakers',
    slug: 'puma-rebound-retro-court-high-top-sneakers',
    description: 'Heritage collegiate basketball-inspired streetwear high-tops featuring padded collars, cushioned SoftFoam+ sockliner, and durable rubber cupsole.',
    department: 'CAMPUS',
    categorySlug: 'sneakers',
    subcategory: 'High Tops',
    brand: 'Puma',
    priceInPaise: 379900, // ₹3,799
    compareAtPriceInPaise: 499900,
    images: [{ url: makePlaceholder('Puma Retro High Tops'), alt: 'High Top Sneakers' }],
    variants: [
      { sku: 'PUM-RB-UK7', size: 'UK 7', color: 'White/Navy', stock: 15 },
      { sku: 'PUM-RB-UK8', size: 'UK 8', color: 'White/Navy', stock: 25 },
      { sku: 'PUM-RB-UK9', size: 'UK 9', color: 'White/Navy', stock: 20 },
      { sku: 'PUM-RB-UK10', size: 'UK 10', color: 'White/Navy', stock: 12 }
    ],
    specifications: { Upper: 'Synthetic leather', Cushioning: 'SoftFoam+ insole' },
    tags: ['sneakers', 'high top', 'puma', 'streetwear'],
    isFeatured: true,
    isActive: true
  },
  {
    name: 'DYPULSE Court Classic Low Vulcanized Sneakers',
    slug: 'dypulse-court-classic-low-vulcanized-sneakers',
    description: 'Clean minimal low-profile everyday campus sneakers with vulcanized rubber foxing tape and breathable ortholite foam footbed.',
    department: 'CAMPUS',
    categorySlug: 'sneakers',
    subcategory: 'Low Tops',
    brand: 'DYPULSE CAMPUS',
    priceInPaise: 189900, // ₹1,899
    compareAtPriceInPaise: 249900,
    images: [{ url: makePlaceholder('DYPULSE Court Classic Sneakers'), alt: 'Court Sneakers' }],
    variants: [
      { sku: 'DYP-SNK-WHT-UK7', size: 'UK 7', color: 'Triple White', stock: 20 },
      { sku: 'DYP-SNK-WHT-UK8', size: 'UK 8', color: 'Triple White', stock: 35 },
      { sku: 'DYP-SNK-WHT-UK9', size: 'UK 9', color: 'Triple White', stock: 30 },
      { sku: 'DYP-SNK-BLK-UK8', size: 'UK 8', color: 'Black/Gum', stock: 25 }
    ],
    specifications: { Sole: 'Vulcanized Gum Rubber', Footbed: 'Ortholite comfort' },
    tags: ['sneakers', 'low top', 'classic', 'white sneakers'],
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Red Tape Retro Chunky Campus Walkers',
    slug: 'red-tape-retro-chunky-campus-walkers',
    description: 'Chunky dad-shoe silhouette sneakers with multi-layered suede and mesh panels, shock-absorbing EVA midsole, and high-grip rubber pods.',
    department: 'CAMPUS',
    categorySlug: 'sneakers',
    subcategory: 'Chunky',
    brand: 'Red Tape',
    priceInPaise: 169900, // ₹1,699
    compareAtPriceInPaise: 299900,
    images: [{ url: makePlaceholder('Red Tape Chunky Walkers'), alt: 'Chunky Walkers' }],
    variants: [
      { sku: 'RT-CHNK-UK8', size: 'UK 8', color: 'Off-White/Grey', stock: 20 },
      { sku: 'RT-CHNK-UK9', size: 'UK 9', color: 'Off-White/Grey', stock: 25 },
      { sku: 'RT-CHNK-UK10', size: 'UK 10', color: 'Off-White/Grey', stock: 15 }
    ],
    specifications: { Midsole: 'Molded Dual-Density EVA', Styling: 'Retro Chunky' },
    tags: ['sneakers', 'chunky', 'dad shoes', 'red tape'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Puma Smash V2 Leather Low Court Sneakers',
    slug: 'puma-smash-v2-leather-low-court-sneakers',
    description: 'Timeless clean tennis silhouette with durable genuine leather upper, signature Puma formstrip, and herringbone rubber grip sole.',
    department: 'CAMPUS',
    categorySlug: 'sneakers',
    subcategory: 'Low Tops',
    brand: 'Puma',
    priceInPaise: 249900, // ₹2,499
    compareAtPriceInPaise: 349900,
    images: [{ url: makePlaceholder('Puma Smash V2 Sneakers'), alt: 'Puma Smash Sneakers' }],
    variants: [
      { sku: 'PUM-SM-UK8', size: 'UK 8', color: 'Puma White/Black', stock: 25 },
      { sku: 'PUM-SM-UK9', size: 'UK 9', color: 'Puma White/Black', stock: 25 }
    ],
    specifications: { Upper: '100% Genuine Leather', Outsole: 'Textured Cupsole' },
    tags: ['sneakers', 'puma', 'leather', 'court classic'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Converse Chuck 70 Heritage High Top Canvas Sneakers',
    slug: 'converse-chuck-70-heritage-high-top-canvas-sneakers',
    description: 'Premium 12oz organic canvas upper high-tops with winged tongue stitching, glossy vintage egret midsole foxing, and Ortholite insole.',
    department: 'CAMPUS',
    categorySlug: 'sneakers',
    subcategory: 'High Tops',
    brand: 'Converse',
    priceInPaise: 289900, // ₹2,899
    compareAtPriceInPaise: 399900,
    images: [{ url: makePlaceholder('Converse Chuck 70'), alt: 'Chuck 70 High Tops' }],
    variants: [
      { sku: 'CNV-70-UK8', size: 'UK 8', color: 'Black/Egret', stock: 20 },
      { sku: 'CNV-70-UK9', size: 'UK 9', color: 'Black/Egret', stock: 20 }
    ],
    specifications: { Canvas: '12oz Heavyweight Duck Canvas', Insole: 'Cushioned Ortholite' },
    tags: ['sneakers', 'converse', 'high top', 'canvas'],
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Red Tape Air-Cushioned Chunky Streetwear Trainers',
    slug: 'red-tape-air-cushioned-chunky-streetwear-trainers',
    description: 'Visible air bubble cushion heel trainers designed for all-day campus walking, lecture commutes, and casual evening outings.',
    department: 'CAMPUS',
    categorySlug: 'sneakers',
    subcategory: 'Chunky',
    brand: 'Red Tape',
    priceInPaise: 179900, // ₹1,799
    compareAtPriceInPaise: 289900,
    images: [{ url: makePlaceholder('Red Tape Air Cushion'), alt: 'Air Cushion Trainers' }],
    variants: [
      { sku: 'RT-AIR-UK8', size: 'UK 8', color: 'Triple Jet Black', stock: 25 },
      { sku: 'RT-AIR-UK9', size: 'UK 9', color: 'Triple Jet Black', stock: 25 }
    ],
    specifications: { HeelUnit: 'Pressurized Air Cushion Cell', Upper: 'Breathable Mesh' },
    tags: ['sneakers', 'red tape', 'air cushion', 'streetwear'],
    isFeatured: false,
    isActive: true
  },

  // ==========================================
  // DYPULSE CAMPUS: BACKPACKS & BAGS (6 PRODUCTS)
  // ==========================================
  {
    name: 'Wildcraft Campus Tech Armor 32L Backpack',
    slug: 'wildcraft-campus-tech-armor-32l-backpack',
    description: 'Ergonomic 3-compartment college backpack with padded 15.6" laptop cradle, integrated rain cover, and breathable back airflow padding.',
    department: 'CAMPUS',
    categorySlug: 'backpacks',
    subcategory: 'Laptop Backpacks',
    brand: 'Wildcraft',
    priceInPaise: 189900, // ₹1,899
    compareAtPriceInPaise: 249900,
    images: [{ url: makePlaceholder('Wildcraft Campus Backpack'), alt: 'Wildcraft Backpack' }],
    variants: [
      { sku: 'WC-BP-32L-BLK', size: '32 Liters', color: 'Charcoal Black', stock: 35 },
      { sku: 'WC-BP-32L-NVY', size: '32 Liters', color: 'Navy/Orange', stock: 25 }
    ],
    specifications: { Capacity: '32 Liters', LaptopFit: 'Up to 15.6 inches', Raincover: 'Included' },
    tags: ['backpack', 'wildcraft', 'laptop bag', 'campus'],
    isFeatured: true,
    isActive: true
  },
  {
    name: 'DYPULSE Commuter Minimalist Slim Laptop Daypack',
    slug: 'dypulse-commuter-minimalist-slim-laptop-daypack',
    description: 'Sleek weather-resistant polyester urban backpack with hidden anti-theft back pocket, magnetic sternum clip, and luggage pass-through strap.',
    department: 'CAMPUS',
    categorySlug: 'backpacks',
    subcategory: 'Daypacks',
    brand: 'DYPULSE CAMPUS',
    priceInPaise: 149900, // ₹1,499
    compareAtPriceInPaise: 199900,
    images: [{ url: makePlaceholder('DYPULSE Commuter Daypack'), alt: 'Commuter Backpack' }],
    variants: [
      { sku: 'DYP-BP-SLM-GRY', size: '22 Liters', color: 'Slate Grey', stock: 30 },
      { sku: 'DYP-BP-SLM-BLK', size: '22 Liters', color: 'Matte Black', stock: 40 }
    ],
    specifications: { Fabric: '600D Hydro-Repellent Oxford', LaptopPocket: 'Padded 16" Sleeve' },
    tags: ['backpack', 'commuter', 'minimalist', 'daypack'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Cosco Varsity Cylinder Gym Duffel Bag',
    slug: 'cosco-varsity-cylinder-gym-duffel-bag',
    description: 'Water-resistant barrel duffel bag with isolated ventilated sneaker tunnel, side mesh shaker holder, and detachable shoulder strap.',
    department: 'PLAY',
    categorySlug: 'backpacks',
    subcategory: 'Duffel Bags',
    brand: 'Cosco',
    priceInPaise: 89900, // ₹899
    compareAtPriceInPaise: 119900,
    images: [{ url: makePlaceholder('Cosco Gym Duffel Bag'), alt: 'Gym Duffel' }],
    variants: [
      { sku: 'CSC-DFL-35L-RED', size: '35 Liters', color: 'Black/Crimson', stock: 35 },
      { sku: 'CSC-DFL-35L-BLU', size: '35 Liters', color: 'Black/Royal Blue', stock: 30 }
    ],
    specifications: { Capacity: '35 Liters', ShoeCompartment: 'Yes (Ventilated)' },
    tags: ['duffel', 'gym bag', 'sports bag', 'cosco'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'DYPULSE Crossbody Campus Sling Pack',
    slug: 'dypulse-crossbody-campus-sling-pack',
    description: 'Hands-free compact chest sling bag for daily essentials, power bank, headphones, and student ID badge with quick-release YKK buckle.',
    department: 'CAMPUS',
    categorySlug: 'backpacks',
    subcategory: 'Sling Bags',
    brand: 'DYPULSE CAMPUS',
    priceInPaise: 59900, // ₹599
    compareAtPriceInPaise: 79900,
    images: [{ url: makePlaceholder('DYPULSE Sling Pack'), alt: 'Campus Sling Pack' }],
    variants: [
      { sku: 'DYP-SLNG-BLK', size: '5 Liters', color: 'Stealth Black', stock: 45 }
    ],
    specifications: { Strap: 'Reversible Ambidextrous', Zippers: 'Weather-Taped YKK' },
    tags: ['sling', 'crossbody', 'small bag', 'accessories'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'DYPULSE Heavyweight Cotton Canvas Tote Bag',
    slug: 'dypulse-heavyweight-cotton-canvas-tote-bag',
    description: '14 oz unbleached natural canvas carry tote with reinforced webbing straps and zippered internal key pouch for daily campus commutes.',
    department: 'CAMPUS',
    categorySlug: 'backpacks',
    subcategory: 'Totes',
    brand: 'DYPULSE CAMPUS',
    priceInPaise: 44900, // ₹449
    compareAtPriceInPaise: 59900,
    images: [{ url: makePlaceholder('DYPULSE Canvas Tote'), alt: 'Canvas Tote Bag' }],
    variants: [
      { sku: 'DYP-TOTE-ECRU', size: '20 Liters', color: 'Natural Ecru', stock: 50 }
    ],
    specifications: { Fabric: '14oz Cotton Duck Canvas', Handles: 'Reinforced Cross-Stitch' },
    tags: ['tote', 'bag', 'canvas', 'eco-friendly'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Wildcraft Explorer 45L College Travel Rucksack',
    slug: 'wildcraft-explorer-45l-college-travel-rucksack',
    description: 'Top-loading trekking and weekend sports tour rucksack with ergonomic lumbar hip belt, hydration bladder port, and rainfly.',
    department: 'CAMPUS',
    categorySlug: 'backpacks',
    subcategory: 'Travel Rucksacks',
    brand: 'Wildcraft',
    priceInPaise: 239900, // ₹2,399
    compareAtPriceInPaise: 319900,
    images: [{ url: makePlaceholder('Wildcraft 45L Rucksack'), alt: '45L Rucksack' }],
    variants: [
      { sku: 'WC-EXP-45L-RED', size: '45 Liters', color: 'Crimson/Graphite', stock: 20 }
    ],
    specifications: { Capacity: '45 Liters', Suspension: 'Padded Ergonomic Hip Support' },
    tags: ['rucksack', 'travel bag', 'wildcraft', 'backpack'],
    isFeatured: false,
    isActive: true
  },

  // ==========================================
  // DYPULSE CAMPUS: STATIONERY (6 PRODUCTS)
  // ==========================================
  {
    name: 'Classmate Pulse Spiral Bound Notebook (Pack of 4)',
    slug: 'classmate-pulse-spiral-bound-notebook-pack-of-4',
    description: '300-page single line ruled notebooks with micro-perforated bleed-resistant 70 GSM paper and durable poly cover for semester notes.',
    department: 'CAMPUS',
    categorySlug: 'stationery',
    subcategory: 'Notebooks',
    brand: 'Classmate',
    priceInPaise: 38000, // ₹380
    compareAtPriceInPaise: 44000,
    images: [{ url: makePlaceholder('Classmate Pulse Notebooks'), alt: 'Classmate Notebooks' }],
    variants: [
      { sku: 'CLS-NTB-PK4-A4', size: 'A4 Size (300 pgs)', color: 'Assorted Cover Art', stock: 95 }
    ],
    specifications: { Pages: '300 Pages each', Paper: '70 GSM Elemental Chlorine Free' },
    tags: ['stationery', 'notebook', 'spiral', 'classmate', 'exam'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Uniball Eye Rollerball Pen Set (Pack of 5)',
    slug: 'uniball-eye-rollerball-pen-set-pack-of-5',
    description: 'Fade-proof and waterproof pigment ink 0.5mm micro-tip roller pens with Uni-Flow system for smooth exam writing.',
    department: 'CAMPUS',
    categorySlug: 'stationery',
    subcategory: 'Pens',
    brand: 'Uniball',
    priceInPaise: 34900, // ₹349
    compareAtPriceInPaise: 40000,
    images: [{ url: makePlaceholder('Uniball Eye Pens'), alt: 'Uniball Pens' }],
    variants: [
      { sku: 'UNI-EYE-BLU-5', size: '0.5mm Micro Tip', color: 'Blue Ink', stock: 120 },
      { sku: 'UNI-EYE-BLK-5', size: '0.5mm Micro Tip', color: 'Black Ink', stock: 90 }
    ],
    specifications: { Tip: '0.5mm Stainless Steel Micro', Ink: 'Super Ink (Waterproof & Archival)' },
    tags: ['pens', 'stationery', 'uniball', 'rollerball'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Casio FX-991CW ClassWiz Advanced Scientific Calculator',
    slug: 'casio-fx-991cw-classwiz-advanced-scientific-calculator',
    description: 'High-definition 4-gradation natural textbook display with 540+ mathematical functions, approved for university exams and engineering coursework.',
    department: 'CAMPUS',
    categorySlug: 'stationery',
    subcategory: 'Calculators',
    brand: 'Casio',
    priceInPaise: 139500, // ₹1,395
    compareAtPriceInPaise: 159500,
    images: [{ url: makePlaceholder('Casio FX-991CW Calculator'), alt: 'Casio Scientific Calculator' }],
    variants: [
      { sku: 'CASIO-991CW-BLK', size: 'Standard', color: 'Matte Charcoal', stock: 50 }
    ],
    specifications: { Functions: '540+ Functions', Power: 'Dual Solar + Battery (LR44)' },
    tags: ['calculator', 'casio', 'engineering', 'stationery', 'exam'],
    isFeatured: true,
    isActive: true
  },
  {
    name: 'DYPULSE Hardcover Dot Grid B5 Bullet Journal',
    slug: 'dypulse-hardcover-dot-grid-b5-bullet-journal',
    description: '120 GSM thick bamboo bleed-proof dot grid paper journal with expanding rear pocket, twin ribbon bookmarks, and elastic pen loop.',
    department: 'CAMPUS',
    categorySlug: 'stationery',
    subcategory: 'Journals',
    brand: 'DYPULSE CAMPUS',
    priceInPaise: 54900, // ₹549
    compareAtPriceInPaise: 74900,
    images: [{ url: makePlaceholder('DYPULSE Bullet Journal'), alt: 'B5 Dot Grid Journal' }],
    variants: [
      { sku: 'DYP-JRNL-NVY', size: 'B5 (17.6 x 25 cm)', color: 'Varsity Navy', stock: 45 },
      { sku: 'DYP-JRNL-OLV', size: 'B5 (17.6 x 25 cm)', color: 'Sage Green', stock: 35 }
    ],
    specifications: { PaperWeight: '120 GSM Acid-Free Ivory', Pages: '192 Numbered Pages' },
    tags: ['journal', 'notebook', 'stationery', 'bullet journal'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Faber-Castell Textliner 46 Pastel Highlighters (Pack of 6)',
    slug: 'faber-castell-textliner-46-pastel-highlighters-pack-of-6',
    description: 'Water-based soft pastel chisel-tip highlighters for lecture notes that do not bleed through thin textbook pages.',
    department: 'CAMPUS',
    categorySlug: 'stationery',
    subcategory: 'Highlighters',
    brand: 'Faber-Castell',
    priceInPaise: 24900, // ₹249
    compareAtPriceInPaise: 32000,
    images: [{ url: makePlaceholder('Faber-Castell Highlighters'), alt: 'Pastel Highlighters' }],
    variants: [
      { sku: 'FC-PSTL-6PK', size: 'Pack of 6', color: 'Pastel Assorted', stock: 80 }
    ],
    specifications: { Tip: 'Chisel Tip (1mm, 2mm, 5mm)', Ink: 'Water-based lightfast' },
    tags: ['highlighter', 'stationery', 'faber castell', 'notes'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Staedtler Triplus Fineliner 0.3mm Sketching Pens (Set of 10)',
    slug: 'staedtler-triplus-fineliner-0-3mm-sketching-pens-set-of-10',
    description: 'Ergonomic triangular barrel superfine 0.3mm metal-clad tip pens with DRY SAFE ink that can be left uncapped for days without drying out.',
    department: 'CAMPUS',
    categorySlug: 'stationery',
    subcategory: 'Pens',
    brand: 'Staedtler',
    priceInPaise: 59900, // ₹599
    compareAtPriceInPaise: 79900,
    images: [{ url: makePlaceholder('Staedtler Fineliners'), alt: 'Staedtler Pens' }],
    variants: [
      { sku: 'STD-TRIP-10PK', size: '0.3mm Tip (Pack of 10)', color: 'Multi-Color Box', stock: 40 }
    ],
    specifications: { Tip: '0.3mm Metal-Clad', Barrel: 'Ergonomic Triangular' },
    tags: ['fineliner', 'pens', 'staedtler', 'sketching', 'notes'],
    isFeatured: false,
    isActive: true
  },

  // ==========================================
  // DYPULSE CAMPUS: TECH ACCESSORIES (7 PRODUCTS)
  // ==========================================
  {
    name: 'Boat Airdopes 141 ANC Wireless Earbuds',
    slug: 'boat-airdopes-141-anc-wireless-earbuds',
    description: 'True wireless Bluetooth 5.3 earbuds featuring 32dB active noise cancellation, ENx quad-mic calling, and massive 42-hour battery case.',
    department: 'CAMPUS',
    categorySlug: 'tech-accessories',
    subcategory: 'Audio',
    brand: 'Boat',
    priceInPaise: 139900, // ₹1,399
    compareAtPriceInPaise: 299900,
    images: [{ url: makePlaceholder('Boat Airdopes 141 ANC'), alt: 'Boat Wireless Earbuds' }],
    variants: [
      { sku: 'BT-AD141-BLK', size: 'Standard Case', color: 'Bold Black', stock: 45 },
      { sku: 'BT-AD141-WHT', size: 'Standard Case', color: 'Pure White', stock: 35 }
    ],
    specifications: { ANC: '32 dB Hybrid Active Noise Cancellation', Playtime: '42 Hours total' },
    tags: ['earbuds', 'audio', 'bluetooth', 'boat', 'anc'],
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Portronics 20000mAh 22.5W Fast Charge Power Bank',
    slug: 'portronics-20000mah-22-5w-fast-charge-power-bank',
    description: 'High-capacity dual-input power bank with Power Delivery 3.0 and Quick Charge 3.0 support, capable of charging phone and tablet simultaneously.',
    department: 'CAMPUS',
    categorySlug: 'tech-accessories',
    subcategory: 'Chargers',
    brand: 'Portronics',
    priceInPaise: 129900, // ₹1,299
    compareAtPriceInPaise: 199900,
    images: [{ url: makePlaceholder('Portronics Power Bank'), alt: 'Portronics Power Bank' }],
    variants: [
      { sku: 'PRT-PB-20K-BLK', size: '20,000 mAh', color: 'Matte Black', stock: 40 }
    ],
    specifications: { Output: '22.5W Max Type-C PD + USB-A', Protection: '12-Layer Circuit Protection' },
    tags: ['powerbank', 'charger', 'tech', 'portronics'],
    isFeatured: true,
    isActive: true
  },
  {
    name: 'DYPULSE ArmorBraided Type-C Fast Cable (2-Meter)',
    slug: 'dypulse-armorbraided-type-c-fast-cable-2-meter',
    description: 'Military-grade nylon braided 65W PD charging cable with reinforced aluminum connectors tested to withstand 25,000+ bends.',
    department: 'CAMPUS',
    categorySlug: 'tech-accessories',
    subcategory: 'Cables',
    brand: 'DYPULSE CAMPUS',
    priceInPaise: 29900, // ₹299
    compareAtPriceInPaise: 49900,
    images: [{ url: makePlaceholder('DYPULSE Type-C Cable'), alt: 'Type-C Braided Cable' }],
    variants: [
      { sku: 'DYP-CBL-2M-BLK', size: '2 Meters', color: 'Black/Silver', stock: 90 },
      { sku: 'DYP-CBL-2M-BLU', size: '2 Meters', color: 'Electric Blue', stock: 60 }
    ],
    specifications: { Power: '65W Power Delivery', Transfer: '480 Mbps Data Sync' },
    tags: ['cable', 'type-c', 'fast charging', 'accessories'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'DYPULSE ShockShield Padded Laptop Sleeve (15.6")',
    slug: 'dypulse-shockshield-padded-laptop-sleeve-15-6',
    description: 'Plush velvet-lined memory foam laptop sleeve with exterior water-repellent neoprene skin and zippered accessories pouch.',
    department: 'CAMPUS',
    categorySlug: 'tech-accessories',
    subcategory: 'Sleeves',
    brand: 'DYPULSE CAMPUS',
    priceInPaise: 64900, // ₹649
    compareAtPriceInPaise: 89900,
    images: [{ url: makePlaceholder('DYPULSE Laptop Sleeve'), alt: 'Laptop Sleeve' }],
    variants: [
      { sku: 'DYP-SLV-15-GRY', size: '15.6 Inch', color: 'Heather Charcoal', stock: 40 },
      { sku: 'DYP-SLV-14-GRY', size: '14 Inch', color: 'Heather Charcoal', stock: 35 }
    ],
    specifications: { Lining: 'High-Density Memory Foam + Fleece', Shell: 'Splash-proof Neoprene' },
    tags: ['laptop sleeve', 'protection', 'tech', 'accessories'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Noise ColorFit Pro 5 Smart Sports Watch with AMOLED Display',
    slug: 'noise-colorfit-pro-5-smart-sports-watch-with-amoled-display',
    description: '1.96" AMOLED display smartwatch with Bluetooth calling, 100+ sports modes, 24/7 heart rate and SpO2 tracking, and 7-day battery.',
    department: 'CAMPUS',
    categorySlug: 'tech-accessories',
    subcategory: 'Smartwatches',
    brand: 'Noise',
    priceInPaise: 219900, // ₹2,199
    compareAtPriceInPaise: 399900,
    images: [{ url: makePlaceholder('Noise ColorFit Smartwatch'), alt: 'Noise Smartwatch' }],
    variants: [
      { sku: 'NSE-CF5-BLK', size: '1.96" AMOLED', color: 'Jet Black', stock: 30 },
      { sku: 'NSE-CF5-BLU', size: '1.96" AMOLED', color: 'Deep Blue', stock: 25 }
    ],
    specifications: { Screen: '1.96" AMOLED 410x502', WaterResistance: 'IP68' },
    tags: ['smartwatch', 'noise', 'fitness tracker', 'tech'],
    isFeatured: true,
    isActive: true
  },
  {
    name: 'DYPULSE 65W GaN Triple-Port Fast Wall Charger',
    slug: 'dypulse-65w-gan-triple-port-fast-wall-charger',
    description: 'Compact Gallium Nitride (GaN) fast charger with dual Type-C and one USB-A port capable of fast charging laptop, phone, and watch together.',
    department: 'CAMPUS',
    categorySlug: 'tech-accessories',
    subcategory: 'Chargers',
    brand: 'DYPULSE CAMPUS',
    priceInPaise: 134900, // ₹1,349
    compareAtPriceInPaise: 189900,
    images: [{ url: makePlaceholder('DYPULSE 65W GaN Charger'), alt: 'GaN Wall Charger' }],
    variants: [
      { sku: 'DYP-GAN-65W-WHT', size: '65W Triple Port', color: 'Polar White', stock: 45 }
    ],
    specifications: { Technology: 'Gallium Nitride III', Ports: '2x USB-C PD 65W + 1x USB-A QC' },
    tags: ['charger', 'gan', 'fast charging', 'tech accessories'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Portronics Magnetic 15W Wireless Power Bank (10000mAh)',
    slug: 'portronics-magnetic-15w-wireless-power-bank-10000mah',
    description: 'Snap-on magnetic wireless 15W power bank with 20W PD wired fast charging and built-in kickstand for hands-free lecture watching.',
    department: 'CAMPUS',
    categorySlug: 'tech-accessories',
    subcategory: 'Power Banks',
    brand: 'Portronics',
    priceInPaise: 149900, // ₹1,499
    compareAtPriceInPaise: 229900,
    images: [{ url: makePlaceholder('Portronics Mag Power Bank'), alt: 'Magnetic Power Bank' }],
    variants: [
      { sku: 'PRT-MAG-10K-BLK', size: '10,000 mAh', color: 'Titanium Grey', stock: 30 }
    ],
    specifications: { Wireless: '15W Mag-Safe Compatible', WiredOutput: '20W PD Type-C' },
    tags: ['powerbank', 'wireless charger', 'magnetic', 'portronics'],
    isFeatured: false,
    isActive: true
  },

  // ==========================================
  // DYPULSE CAMPUS: EVERYDAY ESSENTIALS (7 PRODUCTS)
  // ==========================================
  {
    name: 'DYPULSE Insulated Thermo-Shield Water Bottle (750ml)',
    slug: 'dypulse-insulated-thermo-shield-water-bottle-750ml',
    description: 'Double-walled vacuum insulated 18/8 food-grade stainless steel bottle that keeps liquids cold for 24 hours and hot for 12 hours.',
    department: 'CAMPUS',
    categorySlug: 'everyday-essentials',
    subcategory: 'Hydration',
    brand: 'DYPULSE CAMPUS',
    priceInPaise: 69900, // ₹699
    compareAtPriceInPaise: 99900,
    images: [{ url: makePlaceholder('DYPULSE Water Bottle'), alt: 'Insulated Bottle' }],
    variants: [
      { sku: 'DYP-BTL-BLK-750', size: '750 ml', color: 'Matte Stealth Black', stock: 50 },
      { sku: 'DYP-BTL-BLU-750', size: '750 ml', color: 'Electric Blue', stock: 45 }
    ],
    specifications: { Steel: '18/8 Pro Grade Stainless Steel', Insulation: 'TempShield Double Wall' },
    tags: ['bottle', 'water bottle', 'hydration', 'campus', 'gym'],
    isFeatured: true,
    isActive: true
  },
  {
    name: 'DYPULSE Campus Dorm Slide Sandals',
    slug: 'dypulse-campus-dorm-slide-sandals',
    description: 'One-piece molded EVA comfort slides with contoured arch support, textured non-slip footbed, and water-friendly quick-dry construction.',
    department: 'CAMPUS',
    categorySlug: 'everyday-essentials',
    subcategory: 'Footwear',
    brand: 'DYPULSE CAMPUS',
    priceInPaise: 59900, // ₹599
    compareAtPriceInPaise: 79900,
    images: [{ url: makePlaceholder('DYPULSE Dorm Slides'), alt: 'Dorm Slides' }],
    variants: [
      { sku: 'DYP-SLD-BLK-UK8', size: 'UK 8', color: 'Onyx Black', stock: 40 },
      { sku: 'DYP-SLD-BLK-UK9', size: 'UK 9', color: 'Onyx Black', stock: 45 },
      { sku: 'DYP-SLD-NVY-UK8', size: 'UK 8', color: 'Deep Navy', stock: 30 }
    ],
    specifications: { Material: 'Hydrophobic Injected EVA', Weight: '140g per slide' },
    tags: ['slides', 'sandals', 'dorm', 'hostel essentials'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'DYPULSE Cushioned Quarter Crew Socks (Pack of 3)',
    slug: 'dypulse-cushioned-quarter-crew-socks-pack-of-3',
    description: 'Combed cotton quarter crew athletic socks with targeted arch band compression, terry footbed cushioning, and ribbed ankle cuff.',
    department: 'CAMPUS',
    categorySlug: 'everyday-essentials',
    subcategory: 'Socks',
    brand: 'DYPULSE CAMPUS',
    priceInPaise: 34900, // ₹349
    compareAtPriceInPaise: 49900,
    images: [{ url: makePlaceholder('DYPULSE Quarter Crew Socks'), alt: 'Crew Socks' }],
    variants: [
      { sku: 'DYP-SCK-TRIO-WHT', size: 'Free Size (UK 7-11)', color: 'White Pack (3 Pairs)', stock: 80 },
      { sku: 'DYP-SCK-TRIO-BLK', size: 'Free Size (UK 7-11)', color: 'Black Pack (3 Pairs)', stock: 70 }
    ],
    specifications: { Composition: '80% Combed Cotton, 17% Polyester, 3% Elastane' },
    tags: ['socks', 'athletic', 'cushioned', 'essentials'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'DYPULSE University Lanyard & Quick-ID Holder',
    slug: 'dypulse-university-lanyard-and-quick-id-holder',
    description: 'Soft woven polyester neck strap with heavy-duty swivel trigger hook and transparent acrylic card protector for college student ID.',
    department: 'CAMPUS',
    categorySlug: 'everyday-essentials',
    subcategory: 'Lanyards',
    brand: 'DYPULSE CAMPUS',
    priceInPaise: 19900, // ₹199
    compareAtPriceInPaise: 29900,
    images: [{ url: makePlaceholder('DYPULSE Lanyard ID Holder'), alt: 'Lanyard Holder' }],
    variants: [
      { sku: 'DYP-LNY-NVY', size: 'Standard (45cm)', color: 'Varsity Navy', stock: 150 },
      { sku: 'DYP-LNY-BLU', size: 'Standard (45cm)', color: 'Electric Blue', stock: 100 }
    ],
    specifications: { Strap: '20mm Soft Poly-Woven', Hook: 'Zinc Alloy Swivel Claw' },
    tags: ['lanyard', 'id holder', 'essentials', 'campus'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'DYPULSE 1000ml HydroVault Stainless Vacuum Flask',
    slug: 'dypulse-1000ml-hydrovault-stainless-vacuum-flask',
    description: 'Large 1-liter double-wall insulated flask with paracord carry handle, wide mouth for ice cubes, and powder-coated sweat-free exterior.',
    department: 'CAMPUS',
    categorySlug: 'everyday-essentials',
    subcategory: 'Hydration',
    brand: 'DYPULSE CAMPUS',
    priceInPaise: 74900, // ₹749
    compareAtPriceInPaise: 109900,
    images: [{ url: makePlaceholder('DYPULSE HydroVault Flask'), alt: 'HydroVault Flask' }],
    variants: [
      { sku: 'DYP-FLSK-1L-BLK', size: '1000 ml', color: 'Stealth Black', stock: 45 },
      { sku: 'DYP-FLSK-1L-MNT', size: '1000 ml', color: 'Sage Mint', stock: 35 }
    ],
    specifications: { Capacity: '1000 ml (1 Liter)', ThermalRetention: '24h Cold / 12h Hot' },
    tags: ['flask', 'water bottle', 'hydration', 'essentials'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'DYPULSE Quick-Dry Microfiber Hostel Bath Towel',
    slug: 'dypulse-quick-dry-microfiber-hostel-bath-towel',
    description: 'Ultra-absorbent antimicrobial microfiber towel that absorbs 4x its weight in water and dries 3x faster than cotton, perfect for dorm bathrooms and gym lockers.',
    department: 'CAMPUS',
    categorySlug: 'everyday-essentials',
    subcategory: 'Bath & Dorm',
    brand: 'DYPULSE CAMPUS',
    priceInPaise: 44900, // ₹449
    compareAtPriceInPaise: 64900,
    images: [{ url: makePlaceholder('DYPULSE Microfiber Towel'), alt: 'Hostel Bath Towel' }],
    variants: [
      { sku: 'DYP-TWL-NVY', size: '140cm x 70cm', color: 'Navy Blue', stock: 50 },
      { sku: 'DYP-TWL-GRY', size: '140cm x 70cm', color: 'Slate Grey', stock: 40 }
    ],
    specifications: { Material: '85% Polyester, 15% Polyamide Microfiber', Features: 'Antimicrobial & Quick-Dry Loop' },
    tags: ['towel', 'microfiber', 'hostel', 'dorm', 'gym'],
    isFeatured: false,
    isActive: true
  },
  {
    name: 'DYPULSE Heavy-Duty 4-Dial Combination Locker Padlock',
    slug: 'dypulse-heavy-duty-4-dial-combination-locker-padlock',
    description: 'Hardened steel shackle padlock with 10,000 resettable combinations, built for college gym lockers, dorm wardrobes, and travel kitbags.',
    department: 'CAMPUS',
    categorySlug: 'everyday-essentials',
    subcategory: 'Security',
    brand: 'DYPULSE CAMPUS',
    priceInPaise: 29900, // ₹299
    compareAtPriceInPaise: 44900,
    images: [{ url: makePlaceholder('DYPULSE Combination Padlock'), alt: 'Locker Padlock' }],
    variants: [
      { sku: 'DYP-LOCK-4D-BLK', size: 'Standard (Shackle 6mm)', color: 'Matte Black', stock: 70 }
    ],
    specifications: { Shackle: 'Hardened Cut-Resistant Steel', Dials: '4 Resettable Dials (10,000 Combos)' },
    tags: ['padlock', 'lock', 'hostel', 'security', 'gym locker'],
    isFeatured: false,
    isActive: true
  },
  // ==========================================
  // DYPULSE ICONIC HERO & FEATURED PRODUCTS (8 PRODUCTS)
  // ==========================================
  {
    name: 'Heritage Wool Varsity Bomber Jacket',
    slug: 'campus-heritage-varsity-bomber',
    description: 'The crown jewel of college streetwear. Premium melton wool blend torso, vegan leather sleeves, and custom chenille DYPULSE emblems.',
    department: 'CAMPUS',
    categorySlug: 'clothing',
    subcategory: 'Jackets',
    brand: 'DYPULSE CAMPUS',
    priceInPaise: 389900,
    compareAtPriceInPaise: 499900,
    images: [
      { url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80', alt: 'Heritage Wool Varsity Bomber Jacket' },
      { url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80', alt: 'Heritage Wool Varsity Bomber Jacket Back' }
    ],
    variants: [
      { sku: 'DY-VARS-BOMBER-S', size: 'S', color: 'Midnight Navy & Cream', stock: 20 },
      { sku: 'DY-VARS-BOMBER-M', size: 'M', color: 'Midnight Navy & Cream', stock: 25 },
      { sku: 'DY-VARS-BOMBER-L', size: 'L', color: 'Forest & Bone', stock: 25 },
      { sku: 'DY-VARS-BOMBER-XL', size: 'XL', color: 'Forest & Bone', stock: 15 }
    ],
    specifications: {
      'Shell': 'Heavy Melton Wool Blend & Vegan Leather',
      'Lining': 'Diamond-quilted satin thermal lining',
      'Closure': 'Custom antique matte snap buttons'
    },
    tags: ['varsity', 'bomber', 'jacket', 'campus', 'streetwear', 'heritage'],
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Pulse Pro Aero Team Jersey',
    slug: 'pulse-pro-aero-football-jersey',
    description: 'Engineered for tournament champions. Ultra-breathable AeroMesh moisture-wicking fabric with athletic ergonomic seams and anti-chafing trim.',
    department: 'PLAY',
    categorySlug: 'football',
    subcategory: 'Jerseys',
    brand: 'DYPULSE PLAY',
    sport: 'football',
    priceInPaise: 189900,
    compareAtPriceInPaise: 249900,
    images: [
      { url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80', alt: 'Pulse Pro Aero Team Jersey' },
      { url: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=800&q=80', alt: 'Pulse Pro Aero Team Jersey Side' }
    ],
    variants: [
      { sku: 'DY-PULSE-AERO-S', size: 'S', color: 'Electric Blue', stock: 30 },
      { sku: 'DY-PULSE-AERO-M', size: 'M', color: 'Electric Blue', stock: 40 },
      { sku: 'DY-PULSE-AERO-L', size: 'L', color: 'Navy Onyx', stock: 35 },
      { sku: 'DY-PULSE-AERO-XL', size: 'XL', color: 'Pulse White', stock: 25 }
    ],
    specifications: {
      'Material': '100% Recycled AeroMesh Polyester',
      'Fit': 'Athletic Performance Fit',
      'Technology': 'Dri-Pulse Moisture Evaporation'
    },
    tags: ['jersey', 'football', 'play', 'team kit', 'aeromesh'],
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Varsity 450GSM Oversized Hoodie',
    slug: 'varsity-heavyweight-oversized-hoodie',
    description: 'The definitive campus staple. Custom-milled 450GSM french terry fleece with high-density puff print typography and drop-shoulder silhouette.',
    department: 'CAMPUS',
    categorySlug: 'clothing',
    subcategory: 'Hoodies',
    brand: 'DYPULSE CAMPUS',
    priceInPaise: 249900,
    compareAtPriceInPaise: 329900,
    images: [
      { url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80', alt: 'Varsity 450GSM Oversized Hoodie' },
      { url: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80', alt: 'Varsity Hoodie Detail' }
    ],
    variants: [
      { sku: 'DY-HOODIE-S', size: 'S', color: 'Vintage Charcoal', stock: 25 },
      { sku: 'DY-HOODIE-M', size: 'M', color: 'Vintage Charcoal', stock: 35 },
      { sku: 'DY-HOODIE-L', size: 'L', color: 'College Navy', stock: 30 },
      { sku: 'DY-HOODIE-XL', size: 'XL', color: 'Washed Rose', stock: 20 }
    ],
    specifications: {
      'Material': '100% Heavyweight Organic French Terry Cotton',
      'Weight': '450 GSM',
      'Fit': 'Relaxed Drop-Shoulder Boxy'
    },
    tags: ['hoodie', 'campus', 'streetwear', 'oversized', 'fleece'],
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Velocity 5" Lined Training Shorts',
    slug: 'pulse-velocity-running-shorts',
    description: 'Engineered for relentless sprints and high-intensity campus track meets. Built with an ultra-soft compression liner and secure zipper phone pocket.',
    department: 'PLAY',
    categorySlug: 'running',
    subcategory: 'Shorts',
    brand: 'DYPULSE PLAY',
    sport: 'running',
    priceInPaise: 129900,
    compareAtPriceInPaise: 179900,
    images: [
      { url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=80', alt: 'Velocity 5" Lined Training Shorts' },
      { url: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80', alt: 'Velocity Shorts Runner' }
    ],
    variants: [
      { sku: 'DY-SHORTS-S', size: 'S', color: 'Onyx Black', stock: 30 },
      { sku: 'DY-SHORTS-M', size: 'M', color: 'Cobalt Blue', stock: 40 },
      { sku: 'DY-SHORTS-L', size: 'L', color: 'Cadet Grey', stock: 25 }
    ],
    specifications: {
      'Inseam': '5 Inches',
      'Liner': 'Anti-odor built-in compression liner',
      'Pockets': 'Zippered moisture-shield pocket'
    },
    tags: ['shorts', 'running', 'training', 'play', 'compression'],
    isFeatured: true,
    isActive: true
  },
  {
    name: 'DYPULSE Archetype Boxy Graphic Tee',
    slug: 'dypulse-signature-box-tee',
    description: 'Everyday campus confidence. 260GSM combed compact cotton with silk-screen back graphic celebrating collegiate sports heritage.',
    department: 'CAMPUS',
    categorySlug: 'clothing',
    subcategory: 'T-Shirts',
    brand: 'DYPULSE CAMPUS',
    priceInPaise: 119900,
    compareAtPriceInPaise: 159900,
    images: [
      { url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80', alt: 'DYPULSE Archetype Boxy Graphic Tee' },
      { url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80', alt: 'DYPULSE Graphic Tee Street' }
    ],
    variants: [
      { sku: 'DY-TEE-XS', size: 'XS', color: 'Oatmeal Heather', stock: 20 },
      { sku: 'DY-TEE-S', size: 'S', color: 'Deep Navy', stock: 30 },
      { sku: 'DY-TEE-M', size: 'M', color: 'Deep Navy', stock: 45 },
      { sku: 'DY-TEE-L', size: 'L', color: 'Acid Coral', stock: 35 },
      { sku: 'DY-TEE-XL', size: 'XL', color: 'Acid Coral', stock: 25 }
    ],
    specifications: {
      'Material': '100% Combed Compact Cotton',
      'Weight': '260 GSM',
      'Collar': 'Reinforced 1.25" rib-knit collar'
    },
    tags: ['tshirt', 'tee', 'campus', 'oversized', 'graphic'],
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Kinetic Pro Warmup Shooting Shirt',
    slug: 'pulse-kinetic-basketball-crewneck',
    description: 'Designed for pre-game shootarounds and outdoor courts. 4-way stretch flex fabric allows unrestricted shooting motion.',
    department: 'PLAY',
    categorySlug: 'basketball',
    subcategory: 'Tops',
    brand: 'DYPULSE PLAY',
    sport: 'basketball',
    priceInPaise: 219900,
    compareAtPriceInPaise: 289900,
    images: [
      { url: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?auto=format&fit=crop&w=800&q=80', alt: 'Kinetic Pro Warmup Shooting Shirt' },
      { url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80', alt: 'Kinetic Pro Basketball' }
    ],
    variants: [
      { sku: 'DY-SHOOT-M', size: 'M', color: 'Electric Blue', stock: 30 },
      { sku: 'DY-SHOOT-L', size: 'L', color: 'Signal White', stock: 35 },
      { sku: 'DY-SHOOT-XL', size: 'XL', color: 'Signal White', stock: 20 }
    ],
    specifications: {
      'Stretch': '4-Way Mechanical Flex',
      'Ventilation': 'Underarm laser-perforated zones'
    },
    tags: ['basketball', 'shooting shirt', 'warmup', 'play'],
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Apex 40L Modular Sports Duffle',
    slug: 'pulse-apex-all-weather-duffle',
    description: 'Water-resistant ripstop gym duffle with ventilated shoe compartment, padded shoulder strap, and waterproof valuables sleeve.',
    department: 'PLAY',
    categorySlug: 'fitness',
    subcategory: 'Bags',
    brand: 'DYPULSE PLAY',
    priceInPaise: 219900,
    compareAtPriceInPaise: 279900,
    images: [
      { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80', alt: 'Apex 40L Modular Sports Duffle' },
      { url: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80', alt: 'Apex Duffle Gear' }
    ],
    variants: [
      { sku: 'DY-DUFFLE-BLK', size: 'One Size', color: 'Matte Black', stock: 40 },
      { sku: 'DY-DUFFLE-BLU', size: 'One Size', color: 'Electric Blue Accent', stock: 30 }
    ],
    specifications: {
      'Capacity': '40 Litres',
      'Material': '900D Ballistic Cordura TPU coated',
      'Compartments': 'Separate wet/dry vented boot cave'
    },
    tags: ['duffle', 'bag', 'gym', 'sports bag', 'play'],
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Campus Technical Cargo Pants',
    slug: 'campus-utility-cargo-trousers',
    description: 'Engineered for campus commutes. 6 ergonomic utility pockets, adjustable ankle bungee toggles, and reinforced ripstop knee panels.',
    department: 'CAMPUS',
    categorySlug: 'clothing',
    subcategory: 'Pants',
    brand: 'DYPULSE CAMPUS',
    priceInPaise: 229900,
    compareAtPriceInPaise: 299900,
    images: [
      { url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80', alt: 'Campus Technical Cargo Pants' },
      { url: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80', alt: 'Campus Cargo Model' }
    ],
    variants: [
      { sku: 'DY-CARGO-28', size: '28', color: 'Desert Sand', stock: 20 },
      { sku: 'DY-CARGO-30', size: '30', color: 'Tactical Black', stock: 35 },
      { sku: 'DY-CARGO-32', size: '32', color: 'Tactical Black', stock: 40 },
      { sku: 'DY-CARGO-34', size: '34', color: 'Olive Drab', stock: 30 },
      { sku: 'DY-CARGO-36', size: '36', color: 'Olive Drab', stock: 20 }
    ],
    specifications: {
      'Fabric': 'Cotton-Nylon Weather-proof blend',
      'Pockets': '6 multi-utility cargo pockets',
      'Hem': 'Adjustable cord locks at ankles'
    },
    tags: ['cargos', 'pants', 'trousers', 'campus', 'streetwear', 'utility'],
    isFeatured: true,
    isActive: true
  }
];
