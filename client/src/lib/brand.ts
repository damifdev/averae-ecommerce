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
  badge?: "New" | "Best Seller" | "Limited" | "Sale";
  audiences: ("Women" | "Men" | "Kids" | "Unisex")[];
  description: string;
  image: string;
  secondaryImage: string;
  stock: number;
  /** Customer rating data is intentionally null until it comes from verified reviews. */
  rating: number | null;
  ratingCount: number;
};

const unrated = { rating: null, ratingCount: 0 } as const;

export const products: Product[] = [
  { id: 1, name: "Signature Linen Shirt", brand: "Áveraẹ", category: "Ready to Wear", collection: "The Essentials", price: 68000, color: "Ivory", colors: ["Ivory", "Obsidian"], sizes: ["XS", "S", "M", "L", "XL"], inventoryBySize: { XS: 2, S: 4, M: 5, L: 4, XL: 3 }, badge: "Best Seller", audiences: ["Women", "Men", "Unisex"], description: "A softly structured linen shirt with an effortless drape and considered proportions.", image: "/manus-storage/averae-product-linen_48e45a38.jpg", secondaryImage: "/manus-storage/averae-editorial_41cdaa8e.jpg", stock: 18, ...unrated },
  { id: 2, name: "Sculpted Shoulder Bag", brand: "Nuru House", category: "Accessories", collection: "Objects of Ease", price: 124000, color: "Obsidian", colors: ["Obsidian", "Cognac"], sizes: ["One size"], inventoryBySize: { "One size": 7 }, badge: "Limited", audiences: ["Women", "Men", "Unisex"], description: "A clean-lined leather shoulder bag designed to move from day to evening.", image: "/manus-storage/averae-product-bag_c6fe5185.jpg", secondaryImage: "/manus-storage/averae-product-linen_48e45a38.jpg", stock: 7, ...unrated },
  { id: 3, name: "Column Dress", brand: "Ona Atelier", category: "Ready to Wear", collection: "Quiet Form", price: 148000, color: "Sand", colors: ["Sand", "Black"], sizes: ["XS", "S", "M", "L"], inventoryBySize: { XS: 3, S: 5, M: 0, L: 4 }, badge: "New", audiences: ["Women", "Unisex"], description: "A fluid column silhouette cut from a tactile crepe with a low-key luminosity.", image: "/manus-storage/averae-editorial_41cdaa8e.jpg", secondaryImage: "/manus-storage/averae-product-linen_48e45a38.jpg", stock: 12, ...unrated },
  { id: 4, name: "Everyday Tailored Trouser", brand: "Áveraẹ", category: "Ready to Wear", collection: "The Essentials", price: 92000, compareAt: 110000, color: "Taupe", colors: ["Taupe", "Obsidian"], sizes: ["XS", "S", "M", "L", "XL"], inventoryBySize: { XS: 0, S: 1, M: 1, L: 2, XL: 0 }, badge: "Sale", audiences: ["Women", "Men", "Unisex"], description: "An elevated everyday trouser with a relaxed waist and full-length line.", image: "/manus-storage/averae-editorial_41cdaa8e.jpg", secondaryImage: "/manus-storage/averae-product-linen_48e45a38.jpg", stock: 4, ...unrated },
  { id: 5, name: "Soft Frame Sunglasses", brand: "Kijani Objects", category: "Accessories", collection: "Objects of Ease", price: 54000, color: "Tortoise", colors: ["Tortoise", "Black"], sizes: ["One size"], inventoryBySize: { "One size": 23 }, badge: "New", audiences: ["Women", "Men", "Unisex"], description: "A softly squared frame with a warm acetate finish and hand-balanced proportions.", image: "/manus-storage/averae-product-bag_c6fe5185.jpg", secondaryImage: "/manus-storage/averae-editorial_41cdaa8e.jpg", stock: 23, ...unrated },
  { id: 6, name: "Daylight Knit", brand: "Ona Atelier", category: "Ready to Wear", collection: "Quiet Form", price: 76000, color: "Oat", colors: ["Oat", "Ivory"], sizes: ["XS", "S", "M", "L"], inventoryBySize: { XS: 2, S: 0, M: 4, L: 3 }, audiences: ["Women", "Men", "Unisex"], description: "A featherweight knit for the in-between hours.", image: "/manus-storage/averae-product-linen_48e45a38.jpg", secondaryImage: "/manus-storage/averae-product-bag_c6fe5185.jpg", stock: 9, ...unrated },
  { id: 7, name: "Grounded Leather Sandal", brand: "Maji Form", category: "Shoes", collection: "Grounded Forms", price: 62000, color: "Cocoa", colors: ["Cocoa", "Obsidian"], sizes: ["36", "37", "38", "39", "40", "41", "42"], inventoryBySize: { "36": 0, "37": 2, "38": 4, "39": 5, "40": 3, "41": 2, "42": 0 }, badge: "New", audiences: ["Women", "Men", "Unisex"], description: "A considered leather sandal with a sculpted footbed and an easy everyday line.", image: "/manus-storage/averae-product-bag_c6fe5185.jpg", secondaryImage: "/manus-storage/averae-product-linen_48e45a38.jpg", stock: 16, ...unrated },
  { id: 8, name: "Sculptural Beaded Collar", brand: "Kijani Objects", category: "Jewelry", collection: "Objects of Ease", price: 88000, color: "Amber", colors: ["Amber", "Obsidian"], sizes: ["One size"], inventoryBySize: { "One size": 5 }, badge: "Limited", audiences: ["Women", "Men", "Unisex"], description: "A hand-finished collar that brings graphic rhythm and warmth to a simple silhouette.", image: "/manus-storage/averae-product-bag_c6fe5185.jpg", secondaryImage: "/manus-storage/averae-editorial_41cdaa8e.jpg", stock: 5, ...unrated },
  { id: 9, name: "Soft Carryall Tote", brand: "Nuru House", category: "Bags", collection: "Objects of Ease", price: 136000, color: "Cognac", colors: ["Cognac", "Obsidian"], sizes: ["One size"], inventoryBySize: { "One size": 11 }, badge: "Best Seller", audiences: ["Women", "Men", "Unisex"], description: "A generous carryall with softened structure for long days and light travel.", image: "/manus-storage/averae-product-bag_c6fe5185.jpg", secondaryImage: "/manus-storage/averae-marketplace-hero_ccb2d39f.jpg", stock: 11, ...unrated },
  { id: 10, name: "Quiet Hours Watch", brand: "Sabi Time", category: "Watches", collection: "The Essentials", price: 156000, color: "Obsidian", colors: ["Obsidian", "Cognac"], sizes: ["One size"], inventoryBySize: { "One size": 6 }, badge: "Limited", audiences: ["Women", "Men", "Unisex"], description: "A minimal timepiece with a tactile strap and a calm, architectural face.", image: "/manus-storage/averae-product-bag_c6fe5185.jpg", secondaryImage: "/manus-storage/averae-product-linen_48e45a38.jpg", stock: 6, ...unrated },
  { id: 11, name: "Kora Body Ritual Set", brand: "Kora Rituals", category: "Beauty & Lifestyle", collection: "Daily Rituals", price: 48000, color: "Oat", colors: ["Oat", "Amber"], sizes: ["One size"], inventoryBySize: { "One size": 20 }, badge: "New", audiences: ["Women", "Men", "Unisex"], description: "A considered body-care ritual for slower mornings and softer evenings.", image: "/manus-storage/averae-editorial_41cdaa8e.jpg", secondaryImage: "/manus-storage/averae-product-linen_48e45a38.jpg", stock: 20, ...unrated },
  { id: 12, name: "Daybreak Cotton Set", brand: "Áveraẹ", category: "Ready to Wear", collection: "Little Essentials", price: 55000, color: "Ivory", colors: ["Ivory", "Oat"], sizes: ["2Y", "4Y", "6Y", "8Y", "10Y"], inventoryBySize: { "2Y": 0, "4Y": 3, "6Y": 4, "8Y": 4, "10Y": 3 }, badge: "New", audiences: ["Kids"], description: "A soft cotton set designed for movement, comfort and everyday expression.", image: "/manus-storage/averae-marketplace-hero_ccb2d39f.jpg", secondaryImage: "/manus-storage/averae-product-linen_48e45a38.jpg", stock: 14, ...unrated },
];

export const audienceCategories = [
  { slug: 'women', label: 'Women', description: 'Fashion, shoes, bags, accessories and more.', image: '/manus-storage/averae-editorial_41cdaa8e.jpg' },
  { slug: 'men', label: 'Men', description: 'Clothing, footwear, watches, accessories and more.', image: '/manus-storage/averae-product-linen_48e45a38.jpg' },
  { slug: 'kids', label: 'Kids', description: 'Clothing, footwear and accessories.', image: '/manus-storage/averae-product-bag_c6fe5185.jpg' },
  { slug: 'unisex', label: 'Unisex', description: 'Considered pieces made for every expression.', image: '/manus-storage/averae-marketplace-hero_ccb2d39f.jpg' },
] as const;

export const productCategories = [
  { slug: 'clothing', label: 'Clothing', description: 'Fluid layers, tailoring and everyday essentials.', image: '/manus-storage/averae-department-clothing_b3b7c47b.jpg' },
  { slug: 'shoes', label: 'Shoes', description: 'Sneakers, heels, sandals, boots and more.', image: '/manus-storage/averae-department-shoes-v2_a6a9e572.jpg' },
  { slug: 'bags', label: 'Bags', description: 'Handbags, backpacks, crossbody bags and more.', image: '/manus-storage/averae-department-bags-v2_199bf048.jpg' },
  { slug: 'jewelry', label: 'Jewelry', description: 'Necklaces, bracelets, rings, earrings and more.', image: '/manus-storage/averae-department-jewelry-v2_8be58182.jpg' },
  { slug: 'accessories', label: 'Accessories', description: 'Sunglasses, belts, hats and finishing touches.', image: '/manus-storage/averae-department-accessories-v2_af4f197a.jpg' },
  { slug: 'watches', label: 'Watches', description: 'Timepieces with a quiet point of view.', image: '/manus-storage/averae-department-watches-v2_77fa47cf.jpg' },
  { slug: 'beauty-lifestyle', label: 'Beauty & Lifestyle', description: 'Objects and rituals for everyday expression.', image: '/manus-storage/averae-department-beauty-lifestyle-v2_4ea1504e.jpg' },
] as const;

export const marketplaceCategories = [...audienceCategories, ...productCategories] as const;

export const trendItems = [
  { label: 'Trending', title: 'The new uniform', description: 'Relaxed tailoring, tactile layers and considered ease.', productId: 1 },
  { label: 'New', title: 'Soft structure', description: 'Pieces that move between work, weekend and everywhere after.', productId: 3 },
  { label: "Editor's Pick", title: 'Objects of ease', description: 'Accessories that finish the look without overstatement.', productId: 2 },
  { label: 'Popular', title: 'The finishing touch', description: 'Small details that make the everyday feel intentional.', productId: 5 },
] as const;

export const editorialEntries = [
  { slug: 'styles-defining-this-season', label: 'The Áveraẹ Edit', title: '5 styles defining this season', description: 'A visual guide to the pieces and proportions shaping what comes next.', image: '/manus-storage/averae-editorial_41cdaa8e.jpg' },
  { slug: 'rooted-here-worn-everywhere', label: 'Cultural spotlight', title: 'Rooted here. Worn everywhere.', description: 'Contemporary African fashion, creators and a global point of view.', image: '/manus-storage/averae-marketplace-hero_ccb2d39f.jpg' },
  { slug: 'how-to-style-linen', label: 'Style guide', title: 'How to style linen this season', description: 'Five pieces, endless combinations and a softer way to dress.', image: '/manus-storage/averae-product-linen_48e45a38.jpg' },
] as const;

export const featuredLook = {
  title: 'The everyday statement',
  description: 'A versatile edit designed to move from day to night, from one expression to the next.',
  image: '/manus-storage/averae-marketplace-hero_ccb2d39f.jpg',
  productIds: [1, 2, 4],
} as const;

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
