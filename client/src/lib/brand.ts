export const brand = {
  name: "Áveraẹ",
  tagline: "Crafted for modern expression.",
  announcement: "Complimentary delivery on orders over ₦150,000",
  currency: "₦",
  country: "Nigeria",
  colors: {
    primaryBackground: "#F6F0E6",
    primaryText: "#382820",
    accent: "#B7654A",
    secondary: "#D7C2A7",
    surface: "#FFFDF8",
    dark: "#382820",
  },
  contact: { email: "hello@averae.com", phone: "+234 800 000 0000" },
  social: { instagram: "#", pinterest: "#" },
  intro: {
    replayOnHomeNavigation: true,
    showShortenedForReturningVisitors: true,
    fullDurationMs: 7200,
    returningDurationMs: 4200,
    exitDurationMs: 700,
  },
} as const;

export type SizeMarket = 'NG' | 'UK' | 'US' | 'EU';
export type SizeChartRow = {
  size: string;
  measurements: Record<string, string>;
  conversions?: Partial<Record<SizeMarket, string>>;
};
export type ProductSizeChart = {
  title: string;
  unit: 'cm' | 'EU/UK/US';
  columns: string[];
  rows: SizeChartRow[];
  note: string;
};

export type Product = {
  id: number;
  name: string;
  brand: string;
  category: string;
  collection: string;
  price: number;
  compareAt?: number;
  color: string;
  colors: string[];
  sizes: string[];
  /** Inventory is tracked by size so unavailable variants can be blocked before bag submission. */
  inventoryBySize: Record<string, number>;
  badge?: 'New' | 'Best Seller' | 'Limited' | 'Sale' | 'Currently unavailable';
  audiences: ("Women" | "Men" | "Kids" | "Unisex")[];
  description: string;
  image: string;
  secondaryImage: string;
  stock: number;
  /** Customer rating data is intentionally null until it comes from verified reviews. */
  rating: number | null;
  ratingCount: number;
  /** Product-specific fit data shown in the product detail and quick-view sizing surfaces. */
  sizeChart?: ProductSizeChart;
  /** Optional category facets used only when a product has verified catalog attributes. */
  length?: string;
  texture?: string;
  style?: string;
  condition?: string;
};

const apparelChart = (title: string, rows: SizeChartRow[], note = 'Measurements are a guide. Compare with your own measurements and consider the fit note.') => ({ title, unit: 'cm' as const, columns: ['Size', 'Chest / bust', 'Waist', 'Hips'], rows, note });
const footwearChart = (title: string, rows: SizeChartRow[], note = 'Measure both feet at the end of the day and use the longer foot.') => ({ title, unit: 'EU/UK/US' as const, columns: ['EU', 'UK', 'US', 'Foot length'], rows, note });
const oneSizeChart = (title: string, note: string) => ({ title, unit: 'cm' as const, columns: ['Size', 'Fit'], rows: [{ size: 'One size', measurements: { Fit: 'Adjustable / considered fit' }, conversions: { NG: 'One size', UK: 'One size', US: 'One size', EU: 'One size' } }], note });

const shirtChart = apparelChart('Signature shirt fit', [
  { size: 'XS', measurements: { 'Chest / bust': '82–86', Waist: '64–68', Hips: '88–92' }, conversions: { NG: 'XS', UK: '6', US: '2', EU: '34' } },
  { size: 'S', measurements: { 'Chest / bust': '86–90', Waist: '68–72', Hips: '92–96' }, conversions: { NG: 'S', UK: '8', US: '4', EU: '36' } },
  { size: 'M', measurements: { 'Chest / bust': '90–96', Waist: '72–78', Hips: '96–102' }, conversions: { NG: 'M', UK: '10–12', US: '6–8', EU: '38–40' } },
  { size: 'L', measurements: { 'Chest / bust': '96–102', Waist: '78–84', Hips: '102–108' }, conversions: { NG: 'L', UK: '14–16', US: '10–12', EU: '42–44' } },
  { size: 'XL', measurements: { 'Chest / bust': '102–108', Waist: '84–90', Hips: '108–114' }, conversions: { NG: 'XL', UK: '18', US: '14', EU: '46' } },
], 'A relaxed silhouette. If you prefer a closer fit, choose the smaller of two sizes.');
const dressChart = apparelChart('Column dress fit', [
  { size: 'XS', measurements: { 'Chest / bust': '82–86', Waist: '64–68', Hips: '88–92' }, conversions: { NG: 'XS', UK: '6', US: '2', EU: '34' } },
  { size: 'S', measurements: { 'Chest / bust': '86–90', Waist: '68–72', Hips: '92–96' }, conversions: { NG: 'S', UK: '8', US: '4', EU: '36' } },
  { size: 'M', measurements: { 'Chest / bust': '90–96', Waist: '72–78', Hips: '96–102' }, conversions: { NG: 'M', UK: '10–12', US: '6–8', EU: '38–40' } },
  { size: 'L', measurements: { 'Chest / bust': '96–102', Waist: '78–84', Hips: '102–108' }, conversions: { NG: 'L', UK: '14–16', US: '10–12', EU: '42–44' } },
], 'A fluid column shape with room through the body. Use your hip measurement as the deciding point.');
const trouserChart = apparelChart('Everyday trouser fit', [
  { size: 'XS', measurements: { 'Chest / bust': '82–86', Waist: '64–68', Hips: '88–92' }, conversions: { NG: 'XS', UK: '6', US: '2', EU: '34' } },
  { size: 'S', measurements: { 'Chest / bust': '86–90', Waist: '68–72', Hips: '92–96' }, conversions: { NG: 'S', UK: '8', US: '4', EU: '36' } },
  { size: 'M', measurements: { 'Chest / bust': '90–96', Waist: '72–78', Hips: '96–102' }, conversions: { NG: 'M', UK: '10–12', US: '6–8', EU: '38–40' } },
  { size: 'L', measurements: { 'Chest / bust': '96–102', Waist: '78–84', Hips: '102–108' }, conversions: { NG: 'L', UK: '14–16', US: '10–12', EU: '42–44' } },
  { size: 'XL', measurements: { 'Chest / bust': '102–108', Waist: '84–90', Hips: '108–114' }, conversions: { NG: 'XL', UK: '18', US: '14', EU: '46' } },
], 'A relaxed waist and full-length line. When between sizes, choose the larger size.');
const shoeChart = footwearChart('Grounded sandal conversion', [
  { size: '36', measurements: { UK: '3', US: '5', 'Foot length': '23.0' }, conversions: { NG: '36', UK: '3', US: '5', EU: '36' } },
  { size: '37', measurements: { UK: '4', US: '6', 'Foot length': '23.7' }, conversions: { NG: '37', UK: '4', US: '6', EU: '37' } },
  { size: '38', measurements: { UK: '5', US: '7', 'Foot length': '24.3' }, conversions: { NG: '38', UK: '5', US: '7', EU: '38' } },
  { size: '39', measurements: { UK: '6', US: '8', 'Foot length': '25.0' }, conversions: { NG: '39', UK: '6', US: '8', EU: '39' } },
  { size: '40', measurements: { UK: '7', US: '9', 'Foot length': '25.7' }, conversions: { NG: '40', UK: '7', US: '9', EU: '40' } },
  { size: '41', measurements: { UK: '8', US: '10', 'Foot length': '26.3' }, conversions: { NG: '41', UK: '8', US: '10', EU: '41' } },
  { size: '42', measurements: { UK: '9', US: '11', 'Foot length': '27.0' }, conversions: { NG: '42', UK: '9', US: '11', EU: '42' } },
]);
const kidsChart = { title: 'Daybreak kids fit', unit: 'cm' as const, columns: ['Size', 'Height', 'Waist'], rows: [
  { size: '2Y', measurements: { Height: '92–98', Waist: '52–54' }, conversions: { NG: '2Y', UK: '2Y', US: '2T', EU: '92–98' } },
  { size: '4Y', measurements: { Height: '104–110', Waist: '54–56' }, conversions: { NG: '4Y', UK: '4Y', US: '4T', EU: '104–110' } },
  { size: '6Y', measurements: { Height: '116–122', Waist: '56–58' }, conversions: { NG: '6Y', UK: '6Y', US: '6', EU: '116–122' } },
  { size: '8Y', measurements: { Height: '128–134', Waist: '58–61' }, conversions: { NG: '8Y', UK: '8Y', US: '8', EU: '128–134' } },
  { size: '10Y', measurements: { Height: '140–146', Waist: '61–64' }, conversions: { NG: '10Y', UK: '10Y', US: '10', EU: '140–146' } },
], note: 'Use height and waist as a guide. When between sizes, choose the larger size.' } satisfies ProductSizeChart;

export const localizedSizeConversions: Record<SizeMarket, { label: string; apparel: Record<string, string>; footwear: Record<string, string> }> = {
  NG: { label: 'Nigeria', apparel: { XS: 'XS', S: 'S', M: 'M', L: 'L', XL: 'XL', XXL: 'XXL' }, footwear: { '36': '36', '37': '37', '38': '38', '39': '39', '40': '40', '41': '41', '42': '42' } },
  UK: { label: 'United Kingdom', apparel: { XS: '6', S: '8', M: '10–12', L: '14–16', XL: '18', XXL: '20' }, footwear: { '36': '3', '37': '4', '38': '5', '39': '6', '40': '7', '41': '8', '42': '9' } },
  US: { label: 'United States', apparel: { XS: '2', S: '4', M: '6–8', L: '10–12', XL: '14', XXL: '16' }, footwear: { '36': '5', '37': '6', '38': '7', '39': '8', '40': '9', '41': '10', '42': '11' } },
  EU: { label: 'European Union', apparel: { XS: '34', S: '36', M: '38–40', L: '42–44', XL: '46', XXL: '48' }, footwear: { '36': '36', '37': '37', '38': '38', '39': '39', '40': '40', '41': '41', '42': '42' } },
};

const unrated = { rating: null, ratingCount: 0 } as const;

export const products: Product[] = [
  { id: 1, name: "Signature Linen Shirt", brand: "Áveraẹ", category: "Ready to Wear", collection: "The Essentials", price: 68000, color: "Ivory", colors: ["Ivory", "Obsidian"], sizes: ["XS", "S", "M", "L", "XL"], inventoryBySize: { XS: 2, S: 4, M: 5, L: 4, XL: 3 }, badge: "Best Seller", audiences: ["Women", "Men", "Unisex"], description: "A softly structured linen shirt with an effortless drape and considered proportions.", image: "/manus-storage/averae-product-linen_48e45a38.jpg", secondaryImage: "/manus-storage/averae-editorial_41cdaa8e.jpg", stock: 18, ...unrated, sizeChart: shirtChart },
  { id: 2, name: "Sculpted Shoulder Bag", brand: "Nuru House", category: "Accessories", collection: "Objects of Ease", price: 124000, color: "Obsidian", colors: ["Obsidian", "Cognac"], sizes: ["One size"], inventoryBySize: { "One size": 7 }, badge: "Limited", audiences: ["Women", "Men", "Unisex"], description: "A clean-lined leather shoulder bag designed to move from day to evening.", image: "/manus-storage/averae-product-bag_c6fe5185.jpg", secondaryImage: "/manus-storage/averae-product-linen_48e45a38.jpg", stock: 7, ...unrated, sizeChart: oneSizeChart('Sculpted shoulder bag fit', 'One size with an adjustable strap. Use the product dimensions as your reference.') },
  { id: 3, name: "Column Dress", brand: "Ona Atelier", category: "Ready to Wear", collection: "Quiet Form", price: 148000, color: "Sand", colors: ["Sand", "Black"], sizes: ["XS", "S", "M", "L"], inventoryBySize: { XS: 3, S: 5, M: 0, L: 4 }, badge: "New", audiences: ["Women", "Unisex"], description: "A fluid column silhouette cut from a tactile crepe with a low-key luminosity.", image: "/manus-storage/averae-editorial_41cdaa8e.jpg", secondaryImage: "/manus-storage/averae-product-linen_48e45a38.jpg", stock: 12, ...unrated, sizeChart: dressChart },
  { id: 4, name: "Everyday Tailored Trouser", brand: "Áveraẹ", category: "Ready to Wear", collection: "The Essentials", price: 92000, compareAt: 110000, color: "Taupe", colors: ["Taupe", "Obsidian"], sizes: ["XS", "S", "M", "L", "XL"], inventoryBySize: { XS: 0, S: 1, M: 1, L: 2, XL: 0 }, badge: "Sale", audiences: ["Women", "Men", "Unisex"], description: "An elevated everyday trouser with a relaxed waist and full-length line.", image: "/manus-storage/averae-editorial_41cdaa8e.jpg", secondaryImage: "/manus-storage/averae-product-linen_48e45a38.jpg", stock: 4, ...unrated, sizeChart: trouserChart },
  { id: 5, name: "Soft Frame Sunglasses", brand: "Kijani Objects", category: "Accessories", collection: "Objects of Ease", price: 54000, color: "Tortoise", colors: ["Tortoise", "Black"], sizes: ["One size"], inventoryBySize: { "One size": 23 }, badge: "New", audiences: ["Women", "Men", "Unisex"], description: "A softly squared frame with a warm acetate finish and hand-balanced proportions.", image: "/manus-storage/averae-product-bag_c6fe5185.jpg", secondaryImage: "/manus-storage/averae-editorial_41cdaa8e.jpg", stock: 23, ...unrated, sizeChart: oneSizeChart('Soft frame fit', 'One size with a considered frame proportion.') },
  { id: 6, name: "Daylight Knit", brand: "Ona Atelier", category: "Ready to Wear", collection: "Quiet Form", price: 76000, color: "Oat", colors: ["Oat", "Ivory"], sizes: ["XS", "S", "M", "L"], inventoryBySize: { XS: 2, S: 0, M: 4, L: 3 }, audiences: ["Women", "Men", "Unisex"], description: "A featherweight knit for the in-between hours.", image: "/manus-storage/averae-product-linen_48e45a38.jpg", secondaryImage: "/manus-storage/averae-product-bag_c6fe5185.jpg", stock: 9, ...unrated, sizeChart: shirtChart },
  { id: 7, name: "Grounded Leather Sandal", brand: "Maji Form", category: "Shoes", collection: "Grounded Forms", price: 62000, color: "Cocoa", colors: ["Cocoa", "Obsidian"], sizes: ["36", "37", "38", "39", "40", "41", "42"], inventoryBySize: { "36": 0, "37": 2, "38": 4, "39": 5, "40": 3, "41": 2, "42": 0 }, badge: "New", audiences: ["Women", "Men", "Unisex"], description: "A considered leather sandal with a sculpted footbed and an easy everyday line.", image: "/manus-storage/averae-product-bag_c6fe5185.jpg", secondaryImage: "/manus-storage/averae-product-linen_48e45a38.jpg", stock: 16, ...unrated, sizeChart: shoeChart },
  { id: 8, name: "Sculptural Beaded Collar", brand: "Kijani Objects", category: "Jewelry", collection: "Objects of Ease", price: 88000, color: "Amber", colors: ["Amber", "Obsidian"], sizes: ["One size"], inventoryBySize: { "One size": 0 }, badge: "Currently unavailable", audiences: ["Women", "Men", "Unisex"], description: "A hand-finished collar that brings graphic rhythm and warmth to a simple silhouette.", image: "/manus-storage/averae-product-bag_c6fe5185.jpg", secondaryImage: "/manus-storage/averae-editorial_41cdaa8e.jpg", stock: 0, ...unrated, sizeChart: oneSizeChart('Beaded collar fit', 'One size. Contact us if you would like help comparing the piece with your measurements.') },
  { id: 9, name: "Soft Carryall Tote", brand: "Nuru House", category: "Bags", collection: "Objects of Ease", price: 136000, color: "Cognac", colors: ["Cognac", "Obsidian"], sizes: ["One size"], inventoryBySize: { "One size": 11 }, badge: "Best Seller", audiences: ["Women", "Men", "Unisex"], description: "A generous carryall with softened structure for long days and light travel.", image: "/manus-storage/averae-product-bag_c6fe5185.jpg", secondaryImage: "/manus-storage/averae-marketplace-hero_ccb2d39f.jpg", stock: 11, ...unrated, sizeChart: oneSizeChart('Carryall proportion', 'One size with generous capacity and softened structure.') },
  { id: 10, name: "Quiet Hours Watch", brand: "Sabi Time", category: "Watches", collection: "The Essentials", price: 156000, color: "Obsidian", colors: ["Obsidian", "Cognac"], sizes: ["One size"], inventoryBySize: { "One size": 6 }, badge: "Limited", audiences: ["Women", "Men", "Unisex"], description: "A minimal timepiece with a tactile strap and a calm, architectural face.", image: "/manus-storage/averae-product-bag_c6fe5185.jpg", secondaryImage: "/manus-storage/averae-product-linen_48e45a38.jpg", stock: 6, ...unrated, sizeChart: oneSizeChart('Watch strap fit', 'One size with an adjustable strap.') },
  { id: 11, name: "Kora Body Ritual Set", brand: "Kora Rituals", category: "Beauty & Lifestyle", collection: "Daily Rituals", price: 48000, color: "Oat", colors: ["Oat", "Amber"], sizes: ["One size"], inventoryBySize: { "One size": 20 }, badge: "New", audiences: ["Women", "Men", "Unisex"], description: "A considered body-care ritual for slower mornings and softer evenings.", image: "/manus-storage/averae-editorial_41cdaa8e.jpg", secondaryImage: "/manus-storage/averae-product-linen_48e45a38.jpg", stock: 20, ...unrated, sizeChart: oneSizeChart('Ritual set fit', 'One size. Each item is designed for an easy everyday ritual.') },
  { id: 13, name: "Kumasi Human Hair Body Wave Bundle", brand: "Nuru Hair Studio", category: "Hair", collection: "The Hair Edit", price: 185000, color: "Natural Black", colors: ["Natural Black", "Dark Brown"], sizes: ["One size"], inventoryBySize: { "One size": 8 }, badge: "New", audiences: ["Women", "Men", "Unisex"], description: "A full-bodied human hair bundle with a soft body wave and an easy, natural movement.", image: "/manus-storage/averae-product-linen_48e45a38.jpg", secondaryImage: "/manus-storage/averae-hair-editorial_70f4dd20.jpg", stock: 8, ...unrated, length: "Long", texture: "Body wave", style: "Bundles" },
  { id: 14, name: "Lagos Blend Straight Set", brand: "Kora Hair Co.", category: "Hair", collection: "The Hair Edit", price: 78000, color: "Off Black", colors: ["Off Black", "Warm Brown"], sizes: ["One size"], inventoryBySize: { "One size": 4 }, audiences: ["Women", "Men", "Unisex"], description: "A polished blend-hair set with a smooth finish for everyday styling and protective looks.", image: "/manus-storage/averae-product-bag_c6fe5185.jpg", secondaryImage: "/manus-storage/averae-hair-editorial_70f4dd20.jpg", stock: 4, ...unrated, length: "Medium", texture: "Straight", style: "Bundles" },
  { id: 15, name: "Oshogbo Coily Packet Hair", brand: "Maji Beauty Supply", category: "Hair", collection: "Daily Rituals", price: 18500, color: "1B Natural", colors: ["1B Natural", "4 Warm Brown"], sizes: ["One size"], inventoryBySize: { "One size": 18 }, badge: "Best Seller", audiences: ["Women", "Men", "Unisex"], description: "A versatile packet-hair texture with a defined coil for braids, twists and expressive protective styling.", image: "/manus-storage/averae-editorial_41cdaa8e.jpg", secondaryImage: "/manus-storage/averae-hair-editorial_70f4dd20.jpg", stock: 18, ...unrated, length: "Long", texture: "Coily", style: "Braiding hair" },
  { id: 16, name: "Indigo Workwear Jacket", brand: "Áveraẹ Archive", category: "Thrift Wear", collection: "Archive Finds", price: 92000, color: "Faded Indigo", colors: ["Faded Indigo"], sizes: ["M"], inventoryBySize: { M: 1 }, badge: "Limited", audiences: ["Women", "Men", "Unisex"], description: "A one-of-one indigo workwear jacket with softened structure and an honest lived-in patina.", image: "/manus-storage/averae-thrift-editorial_276a1c9a.jpg", secondaryImage: "/manus-storage/averae-product-linen_48e45a38.jpg", stock: 1, ...unrated, condition: "Excellent" },
  { id: 17, name: "Vintage Silk Column Dress", brand: "Áveraẹ Archive", category: "Thrift Wear", collection: "Archive Finds", price: 68000, color: "Burnt Sienna", colors: ["Burnt Sienna"], sizes: ["S"], inventoryBySize: { S: 0 }, badge: "Currently unavailable", audiences: ["Women"], description: "A vintage silk column dress with a warm, luminous hand and the singular character of a carefully kept archive piece.", image: "/manus-storage/averae-thrift-editorial_276a1c9a.jpg", secondaryImage: "/manus-storage/averae-editorial_41cdaa8e.jpg", stock: 0, ...unrated, condition: "Good" },
  { id: 18, name: "Leather Penny Loafers", brand: "Áveraẹ Archive", category: "Thrift Wear", collection: "Archive Finds", price: 54000, color: "Cocoa", colors: ["Cocoa"], sizes: ["39"], inventoryBySize: { "39": 1 }, audiences: ["Women", "Men", "Unisex"], description: "A gently worn pair of cocoa leather loafers with a classic profile and plenty of life left in them.", image: "/manus-storage/averae-thrift-editorial_276a1c9a.jpg", secondaryImage: "/manus-storage/averae-product-bag_c6fe5185.jpg", stock: 1, ...unrated, condition: "Excellent" },
  { id: 12, name: "Daybreak Cotton Set", brand: "Áveraẹ", category: "Ready to Wear", collection: "Little Essentials", price: 55000, color: "Ivory", colors: ["Ivory", "Oat"], sizes: ["2Y", "4Y", "6Y", "8Y", "10Y"], inventoryBySize: { "2Y": 0, "4Y": 3, "6Y": 4, "8Y": 4, "10Y": 3 }, badge: "New", audiences: ["Kids"], description: "A soft cotton set designed for movement, comfort and everyday expression.", image: "/manus-storage/averae-marketplace-hero_ccb2d39f.jpg", secondaryImage: "/manus-storage/averae-product-linen_48e45a38.jpg", stock: 14, ...unrated, sizeChart: kidsChart },
];

export const audienceCategories = [
  { slug: 'women', label: 'Women', description: 'Fashion, shoes, bags, accessories and more.', image: '/manus-storage/averae-editorial_41cdaa8e.jpg' },
  { slug: 'men', label: 'Men', description: 'Clothing, footwear, watches, accessories and more.', image: '/manus-storage/averae-product-linen_48e45a38.jpg' },
  { slug: 'kids', label: 'Kids', description: 'Clothing, footwear and accessories.', image: '/manus-storage/averae-product-bag_c6fe5185.jpg' },
  { slug: 'unisex', label: 'Unisex', description: 'Considered pieces made for every expression.', image: '/manus-storage/averae-marketplace-hero_ccb2d39f.jpg' },
] as const;

export type CategoryFilterKey = 'length' | 'texture' | 'colour' | 'style' | 'size' | 'condition' | 'price' | 'availability';
export type ProductCategory = {
  slug: string;
  label: string;
  description: string;
  image: string;
  keywords: string;
  subcategories?: readonly string[];
  filters?: readonly CategoryFilterKey[];
};

export const productCategories: ProductCategory[] = [
  { slug: 'clothing', label: 'Clothing', description: 'Fluid layers, tailoring and everyday essentials.', image: '/manus-storage/averae-department-clothing_b3b7c47b.jpg', keywords: 'clothing ready to wear fashion apparel', subcategories: ['Dresses', 'Tops', 'Trousers', 'Outerwear'], filters: ['size', 'colour', 'price', 'availability'] },
  { slug: 'shoes', label: 'Shoes', description: 'Sneakers, heels, sandals, boots and more.', image: '/manus-storage/averae-department-shoes-v2_a6a9e572.jpg', keywords: 'shoes footwear sneakers heels sandals boots', filters: ['size', 'colour', 'price', 'availability'] },
  { slug: 'bags', label: 'Bags', description: 'Handbags, backpacks, crossbody bags and more.', image: '/manus-storage/averae-department-bags-v2_199bf048.jpg', keywords: 'bags handbags backpacks crossbody', filters: ['colour', 'price', 'availability'] },
  { slug: 'jewelry', label: 'Jewelry', description: 'Necklaces, bracelets, rings, earrings and more.', image: '/manus-storage/averae-department-jewelry-v2_8be58182.jpg', keywords: 'jewelry necklaces bracelets rings earrings', filters: ['colour', 'price', 'availability'] },
  { slug: 'hair', label: 'Hair', description: 'Human hair, blend hair and packet hair for every expression.', image: '/manus-storage/averae-department-beauty-lifestyle-v2_4ea1504e.jpg', keywords: 'hair human hair blend hair packet hair extensions wigs', subcategories: ['Human Hair', 'Blend Hair', 'Packet Hair'], filters: ['length', 'texture', 'colour', 'style', 'price', 'availability'] },
  { slug: 'accessories', label: 'Accessories', description: 'Sunglasses, belts, hats and finishing touches.', image: '/manus-storage/averae-department-accessories-v2_af4f197a.jpg', keywords: 'accessories sunglasses belts hats finishing touches', filters: ['colour', 'price', 'availability'] },
  { slug: 'watches', label: 'Watches', description: 'Timepieces with a quiet point of view.', image: '/manus-storage/averae-department-watches-v2_77fa47cf.jpg', keywords: 'watches timepieces', filters: ['colour', 'price', 'availability'] },
  { slug: 'beauty-lifestyle', label: 'Beauty & Lifestyle', description: 'Objects and rituals for everyday expression.', image: '/manus-storage/averae-department-beauty-lifestyle-v2_4ea1504e.jpg', keywords: 'beauty lifestyle rituals objects', filters: ['colour', 'price', 'availability'] },
  { slug: 'thrift-wear', label: 'Thrift Wear', description: 'One-of-a-kind and limited pieces with a story to tell.', image: '/manus-storage/averae-marketplace-hero_ccb2d39f.jpg', keywords: 'thrift thrift wear vintage statement pre-loved secondhand', subcategories: ['Thrift Women', 'Thrift Men', 'Thrift Kids', 'Vintage / Statement Pieces'], filters: ['size', 'colour', 'condition', 'price', 'availability'] },
];

export const categoryLandingPages = {
  hair: {
    slug: 'hair',
    eyebrow: 'The Hair Edit',
    title: 'Hair for every expression',
    description: 'Explore human hair, blend hair and packet hair selected for texture, movement and the way you want to show up.',
    image: '/manus-storage/averae-hair-editorial_70f4dd20.jpg',
    subcategories: ['Human Hair', 'Blend Hair', 'Packet Hair'],
    cta: 'SHOP HAIR',
  },
  'thrift-wear': {
    slug: 'thrift-wear',
    eyebrow: 'The Áveraẹ Archive',
    title: 'Pieces with a past, a point of view',
    description: 'Discover one-of-a-kind and limited pre-loved pieces. Every item is inspected, clearly described and available only while it lasts.',
    image: '/manus-storage/averae-thrift-editorial_276a1c9a.jpg',
    subcategories: ['Thrift Women', 'Thrift Men', 'Thrift Kids', 'Vintage / Statement Pieces'],
    cta: 'SHOP THRIFT WEAR',
  },
} as const;

export const marketplaceCategories = [...audienceCategories, ...productCategories] as const;

export const categorySubcategories: Record<string, readonly string[]> = Object.fromEntries(productCategories.filter(category => category.subcategories).map(category => [category.slug, category.subcategories!])) as Record<string, readonly string[]>;

export const categoryFilterOptions = {
  length: ['Short', 'Medium', 'Long'],
  texture: ['Straight', 'Body wave', 'Deep wave', 'Curly', 'Coily'],
  style: ['Bundles', 'Wig', 'Closure', 'Frontal', 'Braiding hair'],
  condition: ['New with tags', 'Excellent', 'Good', 'Visible wear'],
} as const;

export const trendItems = [
  { label: 'Trending', title: 'The new uniform', description: 'Relaxed tailoring, tactile layers and considered ease.', productId: 1 },
  { label: 'New', title: 'Soft structure', description: 'Pieces that move between work, weekend and everywhere after.', productId: 3 },
  { label: "Editor's Pick", title: 'Objects of ease', description: 'Accessories that finish the look without overstatement.', productId: 2 },
  { label: 'Popular', title: 'The finishing touch', description: 'Small details that make the everyday feel intentional.', productId: 5 },
] as const;

export const trendCollections = [
  { slug: 'soft-structure', label: 'Trending styles', title: 'Soft structure', description: 'Relaxed tailoring, linen and tactile layers for a considered everyday silhouette.', keywords: 'soft structure linen tailoring', productIds: [1, 3, 4, 6], shopHref: '/shop?category=clothing' },
  { slug: 'quiet-neutrals', label: 'Trending colours', title: 'Quiet neutrals', description: 'Ivory, oat, sand and cocoa bring warmth to the season’s easiest combinations.', keywords: 'quiet neutrals ivory oat sand cocoa', productIds: [1, 3, 6, 7], shopHref: '/shop?search=oat' },
  { slug: 'objects-of-ease', label: 'Trending accessories', title: 'Objects of ease', description: 'Bags, jewelry and finishing pieces that bring intention to the everyday.', keywords: 'objects ease accessories bags jewelry', productIds: [2, 5, 8, 9], shopHref: '/shop?category=accessories' },
  { slug: 'african-contemporary', label: 'Trending now', title: 'African contemporary', description: 'Rooted references, modern proportions and a point of view that travels.', keywords: 'african contemporary rooted culture', productIds: [2, 7, 8, 11], shopHref: '/shop?category=accessories' },
  { slug: 'everyday-essentials', label: 'Trending categories', title: 'Everyday essentials', description: 'The pieces that build a wardrobe with room for every expression.', keywords: 'everyday essentials wardrobe basics', productIds: [1, 4, 6, 10], shopHref: '/shop?search=essentials' },
  { slug: 'hair-edit', label: 'Trending categories', title: 'The Hair edit', description: 'A dedicated destination for human hair, blend hair and packet hair.', keywords: 'hair human hair blend hair packet hair', productIds: [], shopHref: '/shop?category=hair' },
  { slug: 'thrift-wear', label: 'Trending now', title: 'Thrift Wear', description: 'One-of-a-kind and limited pieces, clearly marked by availability and condition.', keywords: 'thrift thrift wear vintage statement pieces', productIds: [], shopHref: '/shop?category=thrift-wear' },
  { slug: 'editors-picks', label: "Editor's Picks", title: 'The considered edit', description: 'A focused selection chosen for texture, proportion and everyday relevance.', keywords: 'editors picks considered edit', productIds: [1, 2, 3, 11], shopHref: '/shop?sort=popular' },
] as const;

export const editorialTaxonomy = [
  'Trends', 'Style Guides', 'Fashion', 'Culture', 'African Fashion', 'Accessories', 'Inspiration', 'Shopping Guides',
] as const;

export type EditorialEntry = {
  slug: string;
  label: string;
  category: typeof editorialTaxonomy[number];
  title: string;
  description: string;
  image: string;
  date: string;
  readingTime: string;
  author: string;
  content: string[];
  relatedProductIds: number[];
  relatedArticleSlugs: string[];
  lookProductIds: number[];
  audience: 'Women' | 'Men' | 'Kids' | 'Unisex';
  hotspots: readonly { productId: number; x: number; y: number; label: string }[];
};

export const editorialEntries: EditorialEntry[] = [
  { slug: 'styles-defining-this-season', label: 'The Áveraẹ Edit', category: 'Trends', title: '5 styles defining this season', description: 'A visual guide to the pieces and proportions shaping what comes next.', image: '/manus-storage/averae-editorial_41cdaa8e.jpg', date: '22 August 2026', readingTime: '6 min read', author: 'The Áveraẹ Editors', content: ['Style is a conversation between where we are and where we are going. This edit brings together pieces, proportions and perspectives that feel relevant now, while leaving room for personal expression.', 'Look for softened tailoring, tactile neutrals and accessories that add rhythm without asking for attention. The result is a wardrobe with movement, clarity and room to make each piece your own.'], relatedProductIds: [1, 3, 4], relatedArticleSlugs: ['how-to-style-linen', 'the-accessories-that-finish-a-look'], lookProductIds: [1, 4, 7], audience: 'Unisex', hotspots: [{ productId: 1, x: 34, y: 34, label: 'Linen Shirt' }, { productId: 4, x: 55, y: 57, label: 'Relaxed Trousers' }, { productId: 7, x: 73, y: 72, label: 'Sculptural Earrings' }] },
  { slug: 'rooted-here-worn-everywhere', label: 'Cultural spotlight', category: 'African Fashion', title: 'Rooted here. Worn everywhere.', description: 'Contemporary African fashion, creators and a global point of view.', image: '/manus-storage/averae-marketplace-hero_ccb2d39f.jpg', date: '15 August 2026', readingTime: '8 min read', author: 'The Áveraẹ Editors', content: ['African fashion has always carried a conversation between place, memory and possibility. Today, designers are translating those references into silhouettes that travel without losing their sense of origin.', 'The pieces in this story value material, proportion and process. They invite a slower kind of looking, then offer an easy way into everyday dressing.'], relatedProductIds: [2, 7, 8], relatedArticleSlugs: ['styles-defining-this-season', 'a-guide-to-considered-gifting'], lookProductIds: [2, 7, 8], audience: 'Unisex', hotspots: [{ productId: 2, x: 32, y: 40, label: 'Leather Crossbody Bag' }, { productId: 7, x: 59, y: 54, label: 'Sculptural Earrings' }, { productId: 8, x: 77, y: 68, label: 'Textured Bracelet' }] },
  { slug: 'how-to-style-linen', label: 'Style guide', category: 'Style Guides', title: 'How to style linen this season', description: 'Five pieces, endless combinations and a softer way to dress.', image: '/manus-storage/averae-product-linen_48e45a38.jpg', date: '08 August 2026', readingTime: '5 min read', author: 'Nia Okafor', content: ['Linen works best when it is allowed to breathe. Pair a softly structured shirt with a full-length trouser, then let texture do the work of creating contrast.', 'For a more considered finish, introduce one sculptural accessory and keep the palette close to ivory, oat, cocoa and obsidian. The look is relaxed, but never accidental.'], relatedProductIds: [1, 4, 6], relatedArticleSlugs: ['styles-defining-this-season', 'the-accessories-that-finish-a-look'], lookProductIds: [1, 4, 2], audience: 'Women', hotspots: [{ productId: 1, x: 36, y: 31, label: 'Linen Shirt' }, { productId: 4, x: 56, y: 58, label: 'Relaxed Trousers' }, { productId: 2, x: 76, y: 70, label: 'Leather Crossbody Bag' }] },
  { slug: 'the-accessories-that-finish-a-look', label: 'Objects of ease', category: 'Accessories', title: 'The accessories that finish a look', description: 'Quietly graphic pieces that bring intention to everyday dressing.', image: '/manus-storage/averae-product-bag_c6fe5185.jpg', date: '31 July 2026', readingTime: '4 min read', author: 'The Áveraẹ Editors', content: ['The right accessory does not compete with a look; it gives the eye somewhere to land. Think softened leather, warm metal and frames with a little architectural tension.', 'Build from one anchor piece, then add only what helps the silhouette feel complete. Ease is the point.'], relatedProductIds: [2, 5, 9], relatedArticleSlugs: ['styles-defining-this-season', 'rooted-here-worn-everywhere'], lookProductIds: [2, 5, 9], audience: 'Unisex', hotspots: [{ productId: 2, x: 31, y: 35, label: 'Leather Crossbody Bag' }, { productId: 5, x: 58, y: 53, label: 'Obsidian Watch' }, { productId: 9, x: 76, y: 70, label: 'Textured Headband' }] },
  { slug: 'dressing-for-the-in-between', label: 'Everyday dressing', category: 'Fashion', title: 'Dressing for the in-between', description: 'A practical edit for days that refuse to stay in one category.', image: '/manus-storage/averae-editorial_41cdaa8e.jpg', date: '24 July 2026', readingTime: '7 min read', author: 'Nia Okafor', content: ['Some of the best looks begin with an uncertain plan. A breathable base, a tailored layer and one useful object can move comfortably between work, weekends and everywhere after.', 'Choose pieces that layer without bulk and colours that carry across the day. The most versatile wardrobe is not the largest one; it is the one that keeps offering new combinations.'], relatedProductIds: [1, 4, 6], relatedArticleSlugs: ['how-to-style-linen', 'a-guide-to-considered-gifting'], lookProductIds: [1, 6, 10], audience: 'Men', hotspots: [{ productId: 1, x: 33, y: 32, label: 'Linen Shirt' }, { productId: 6, x: 56, y: 56, label: 'Cotton Overshirt' }, { productId: 10, x: 76, y: 72, label: 'Everyday Sneakers' }] },
  { slug: 'a-guide-to-considered-gifting', label: 'The considered edit', category: 'Shopping Guides', title: 'A guide to considered gifting', description: 'Useful objects and small rituals chosen with another person in mind.', image: '/manus-storage/averae-marketplace-hero_ccb2d39f.jpg', date: '18 July 2026', readingTime: '5 min read', author: 'The Áveraẹ Editors', content: ['A thoughtful gift begins with attention. Look for objects that meet a real ritual, then choose the detail that makes it feel personal: a warm colour, an easy shape or a material with presence.', 'This selection is designed to be useful, beautiful and easy to live with long after the wrapping is gone.'], relatedProductIds: [2, 10, 11], relatedArticleSlugs: ['the-accessories-that-finish-a-look', 'rooted-here-worn-everywhere'], lookProductIds: [2, 10, 11], audience: 'Unisex', hotspots: [{ productId: 2, x: 32, y: 35, label: 'Leather Crossbody Bag' }, { productId: 10, x: 57, y: 57, label: 'Everyday Sneakers' }, { productId: 11, x: 77, y: 72, label: 'Everyday Cap' }] },
  { slug: 'small-rituals-big-inspiration', label: 'The daily edit', category: 'Inspiration', title: 'Small rituals, big inspiration', description: 'The everyday details that make personal style feel like your own.', image: '/manus-storage/averae-product-linen_48e45a38.jpg', date: '10 July 2026', readingTime: '3 min read', author: 'Nia Okafor', content: ['Personal style is often built in small decisions: the texture you reach for, the object you carry, the colour that changes your posture. These details make a look feel lived in.', 'Start with one familiar piece, then introduce one new point of view. Inspiration is more useful when it can become part of the day.'], relatedProductIds: [5, 6, 11], relatedArticleSlugs: ['dressing-for-the-in-between', 'the-accessories-that-finish-a-look'], lookProductIds: [5, 6, 11], audience: 'Kids', hotspots: [{ productId: 5, x: 32, y: 34, label: 'Obsidian Watch' }, { productId: 6, x: 57, y: 57, label: 'Cotton Overshirt' }, { productId: 11, x: 77, y: 72, label: 'Everyday Cap' }] },
  { slug: 'the-new-everyday', label: 'The wardrobe note', category: 'Culture', title: 'The new everyday', description: 'Why ease, utility and expression are finding a new balance.', image: '/manus-storage/averae-editorial_41cdaa8e.jpg', date: '02 July 2026', readingTime: '6 min read', author: 'The Áveraẹ Editors', content: ['The new everyday is not a uniform. It is a way of choosing: fewer compromises, more useful beauty and silhouettes that make space for real movement.', 'Across fashion and culture, the most compelling ideas connect utility with feeling. That is where a wardrobe starts to sound like its wearer.'], relatedProductIds: [1, 2, 10], relatedArticleSlugs: ['styles-defining-this-season', 'small-rituals-big-inspiration'], lookProductIds: [1, 2, 10], audience: 'Unisex', hotspots: [{ productId: 1, x: 34, y: 34, label: 'Linen Shirt' }, { productId: 2, x: 58, y: 56, label: 'Leather Crossbody Bag' }, { productId: 10, x: 77, y: 72, label: 'Everyday Sneakers' }] },
];

export const featuredLook = {
  title: 'The everyday statement',
  description: 'A versatile edit designed to move from day to night, from one expression to the next.',
  image: '/manus-storage/averae-marketplace-hero_ccb2d39f.jpg',
  productIds: [1, 2, 4],
} as const;

export const lookCollections = [
  { slug: 'womens-look', audience: 'Women' as const, title: 'A softer point of view', description: 'Fluid layers and warm accessories for an easy, expressive day.', image: '/manus-storage/averae-editorial_41cdaa8e.jpg', productIds: [1, 3, 2], hotspots: [{ productId: 1, x: 34, y: 34, label: 'Linen Shirt' }, { productId: 3, x: 56, y: 57, label: 'Terracotta Tote' }, { productId: 2, x: 76, y: 72, label: 'Leather Crossbody Bag' }] },
  { slug: 'mens-look', audience: 'Men' as const, title: 'The relaxed uniform', description: 'Tactile essentials with enough structure for every direction.', image: '/manus-storage/averae-product-linen_48e45a38.jpg', productIds: [1, 4, 10], hotspots: [{ productId: 1, x: 34, y: 34, label: 'Linen Shirt' }, { productId: 4, x: 57, y: 57, label: 'Relaxed Trousers' }, { productId: 10, x: 76, y: 72, label: 'Everyday Sneakers' }] },
  { slug: 'kids-look', audience: 'Kids' as const, title: 'Made for movement', description: 'Soft cotton and everyday pieces designed to keep up.', image: '/manus-storage/averae-marketplace-hero_ccb2d39f.jpg', productIds: [12, 11, 5], hotspots: [{ productId: 12, x: 34, y: 34, label: 'Soft Cotton Tee' }, { productId: 11, x: 57, y: 57, label: 'Everyday Cap' }, { productId: 5, x: 76, y: 72, label: 'Obsidian Watch' }] },
  { slug: 'unisex-look', audience: 'Unisex' as const, title: 'Open expression', description: 'A considered mix of texture, proportion and useful objects.', image: '/manus-storage/averae-product-bag_c6fe5185.jpg', productIds: [1, 7, 2], hotspots: [{ productId: 1, x: 34, y: 34, label: 'Linen Shirt' }, { productId: 7, x: 57, y: 57, label: 'Grounded Leather Sandal' }, { productId: 2, x: 76, y: 72, label: 'Leather Crossbody Bag' }] },
] as const;

export const heroContent = {
  eyebrow: 'Discover · Explore · Express · Shop',
  title: 'Discover what’s next.',
  description: 'Fashion, culture and style curated for everyone.',
  primaryCta: 'SHOP NOW',
  secondaryCta: 'EXPLORE TRENDS',
} as const;

export const sizeInventory = (product: Product, size: string) => product.inventoryBySize[size] ?? 0;
export const isSizeAvailable = (product: Product, size: string) => sizeInventory(product, size) > 0;
export const availableSizes = (product: Product) => product.sizes.filter(size => isSizeAvailable(product, size));

export const formatPrice = (value: number) => `${brand.currency}${value.toLocaleString("en-NG")}`;
