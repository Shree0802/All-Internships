import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Product from '../models/Product.js';

// High-resolution, direct Unsplash photography mapped by category and product keywords
const IMAGE_LIBRARY = {
  cricket: {
    bat: 'https://images.unsplash.com/photo-1531415074868-036b1c575351?auto=format&fit=crop&w=800&q=80',
    ball: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
    pads: 'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?auto=format&fit=crop&w=800&q=80',
    gloves: 'https://images.unsplash.com/photo-1593766788306-28561086694e?auto=format&fit=crop&w=800&q=80',
    helmet: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80',
    bag: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    shoes: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=800&q=80',
    default: 'https://images.unsplash.com/photo-1531415074868-036b1c575351?auto=format&fit=crop&w=800&q=80'
  },
  football: {
    ball: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
    boots: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=800&q=80',
    gloves: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
    guards: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80',
    bibs: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=800&q=80',
    socks: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=800&q=80',
    default: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80'
  },
  basketball: {
    ball: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=800&q=80',
    jersey: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
    shoes: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=800&q=80',
    shorts: 'https://images.unsplash.com/photo-1580087433295-ab2600c1030e?auto=format&fit=crop&w=800&q=80',
    sleeve: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    default: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=800&q=80'
  },
  badminton: {
    racquet: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80',
    shuttle: 'https://images.unsplash.com/photo-1613918108466-292b78a8ef95?auto=format&fit=crop&w=800&q=80',
    shoes: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80',
    bag: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    grip: 'https://images.unsplash.com/photo-1521537634581-0dced2fedc42?auto=format&fit=crop&w=800&q=80',
    default: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80'
  },
  running: {
    shoes: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    trail: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
    bra: 'https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=800&q=80',
    shorts: 'https://images.unsplash.com/photo-1483721074577-94d306b3a373?auto=format&fit=crop&w=800&q=80',
    pack: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    default: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'
  },
  'fitness-gym': {
    bands: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80',
    shaker: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
    straps: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    roller: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
    bag: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    default: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80'
  },
  'sports-footwear': {
    studs: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=800&q=80',
    court: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80',
    running: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    default: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=800&q=80'
  },
  'sports-jerseys': {
    matchday: 'https://images.unsplash.com/photo-1580087433295-ab2600c1030e?auto=format&fit=crop&w=800&q=80',
    whites: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    compression: 'https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=800&q=80',
    default: 'https://images.unsplash.com/photo-1580087433295-ab2600c1030e?auto=format&fit=crop&w=800&q=80'
  },
  clothing: {
    tee: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    graphic: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
    joggers: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=800&q=80',
    acid: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80',
    bomber: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
    default: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'
  },
  'hoodies-sweatshirts': {
    hoodie: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    quarter: 'https://images.unsplash.com/photo-1578768079052-aa76e520028b?auto=format&fit=crop&w=800&q=80',
    zip: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80',
    crew: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80',
    default: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'
  },
  sneakers: {
    high: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80',
    low: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=800&q=80',
    trainer: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
    skater: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
    default: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80'
  },
  backpacks: {
    daypack: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    duffel: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80',
    canvas: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    sling: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
    default: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80'
  },
  stationery: {
    notebook: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    pens: 'https://images.unsplash.com/photo-1585336261026-418044723dd5?auto=format&fit=crop&w=800&q=80',
    calculator: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&w=800&q=80',
    desk: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80',
    default: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
  },
  'tech-accessories': {
    power: 'https://images.unsplash.com/photo-1609592424368-23fcab10e964?auto=format&fit=crop&w=800&q=80',
    earbuds: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
    speaker: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80',
    watch: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    cable: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80',
    default: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
  },
  'everyday-essentials': {
    socks: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=800&q=80',
    towel: 'https://images.unsplash.com/photo-1616627547584-bf28cee262db?auto=format&fit=crop&w=800&q=80',
    bottle: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    cap: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
    keychain: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    default: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=800&q=80'
  }
};

export function resolveProductImage(categorySlug, name) {
  const cat = IMAGE_LIBRARY[categorySlug] || IMAGE_LIBRARY['clothing'];
  const n = (name || '').toLowerCase();

  for (const [key, url] of Object.entries(cat)) {
    if (key !== 'default' && n.includes(key)) {
      return url;
    }
  }

  // Cross-category fallbacks based on name
  if (n.includes('bat')) return IMAGE_LIBRARY.cricket.bat;
  if (n.includes('ball') && n.includes('cricket')) return IMAGE_LIBRARY.cricket.ball;
  if (n.includes('football') || n.includes('soccer')) return IMAGE_LIBRARY.football.ball;
  if (n.includes('basketball')) return IMAGE_LIBRARY.basketball.ball;
  if (n.includes('racquet') || n.includes('badminton')) return IMAGE_LIBRARY.badminton.racquet;
  if (n.includes('shuttle')) return IMAGE_LIBRARY.badminton.shuttle;
  if (n.includes('hoodie')) return IMAGE_LIBRARY['hoodies-sweatshirts'].hoodie;
  if (n.includes('sweatshirt')) return IMAGE_LIBRARY['hoodies-sweatshirts'].quarter;
  if (n.includes('sneaker') || n.includes('shoe')) return IMAGE_LIBRARY.sneakers.low;
  if (n.includes('backpack') || n.includes('bag')) return IMAGE_LIBRARY.backpacks.daypack;
  if (n.includes('tee') || n.includes('t-shirt')) return IMAGE_LIBRARY.clothing.tee;
  if (n.includes('jogger') || n.includes('pant') || n.includes('shorts')) return IMAGE_LIBRARY.clothing.joggers;
  if (n.includes('watch')) return IMAGE_LIBRARY['tech-accessories'].watch;
  if (n.includes('earbuds') || n.includes('earphone')) return IMAGE_LIBRARY['tech-accessories'].earbuds;
  if (n.includes('pen')) return IMAGE_LIBRARY.stationery.pens;
  if (n.includes('notebook') || n.includes('book')) return IMAGE_LIBRARY.stationery.notebook;
  if (n.includes('shaker') || n.includes('bottle')) return IMAGE_LIBRARY['fitness-gym'].shaker;
  if (n.includes('power') || n.includes('bank') || n.includes('charger')) return IMAGE_LIBRARY['tech-accessories'].power;
  if (n.includes('speaker')) return IMAGE_LIBRARY['tech-accessories'].speaker;
  if (n.includes('towel')) return IMAGE_LIBRARY['everyday-essentials'].towel;
  if (n.includes('bottle') || n.includes('flask') || n.includes('tumbler')) return IMAGE_LIBRARY['everyday-essentials'].bottle;
  if (n.includes('cap')) return IMAGE_LIBRARY['everyday-essentials'].cap;
  if (n.includes('padlock') || n.includes('lock') || n.includes('keychain')) return IMAGE_LIBRARY['everyday-essentials'].keychain;

  return cat.default || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80';
}

async function run() {
  await mongoose.connect('mongodb://localhost:27017/dypulse');
  console.log('[UPDATE] Connected to MongoDB');

  const products = await Product.find({}).populate('category');
  let count = 0;

  for (const prod of products) {
    const catSlug = prod.category?.slug || 'clothing';
    const mainImgUrl = resolveProductImage(catSlug, prod.name);
    
    // Ensure healthy stock across variants
    let totalStock = 0;
    if (prod.variants && prod.variants.length > 0) {
      for (const v of prod.variants) {
        if (!v.stock || v.stock <= 0) {
          v.stock = Math.floor(Math.random() * 25) + 15; // 15 to 40 units
        }
        totalStock += v.stock;
      }
    } else {
      totalStock = 45;
    }

    // Populate sizes and colors
    const sizeMap = new Map();
    const colorMap = new Map();
    for (const v of prod.variants || []) {
      if (v.size) sizeMap.set(v.size, (sizeMap.get(v.size) || 0) + (v.stock || 0));
      if (v.color) colorMap.set(v.color, (colorMap.get(v.color) || 0) + (v.stock || 0));
    }
    const sizes = Array.from(sizeMap.entries()).map(([size, s]) => ({ size, stock: s }));
    const colors = Array.from(colorMap.entries()).map(([name, s]) => ({ name, hex: '', stock: s }));

    prod.images = [
      { url: mainImgUrl, alt: prod.name, isPrimary: true }
    ];
    prod.stock = totalStock;
    prod.sizes = sizes.length > 0 ? sizes : [{ size: 'Standard', stock: totalStock }];
    prod.colors = colors.length > 0 ? colors : [{ name: 'Standard', hex: '', stock: totalStock }];
    prod.isActive = true;

    await prod.save();
    count++;
  }

  console.log(`[UPDATE] Successfully updated ${count} products with real Unsplash images and healthy in-stock inventory!`);
  await mongoose.disconnect();
}

if (process.argv[1]?.endsWith('seedImagesAndStock.js')) {
  run().catch(err => {
    console.error('Update error:', err);
    process.exit(1);
  });
}
