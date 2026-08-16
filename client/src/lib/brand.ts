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
    fullDurationMs: 3200,
    returningDurationMs: 1000,
    exitDurationMs: 450,
  },
} as const;

export type Product = {
  id: number;
  name: string;
  category: string;
  collection: string;
  price: number;
  compareAt?: number;
  color: string;
  colors: string[];
  sizes: string[];
  badge?: "New" | "Best Seller" | "Limited" | "Sale";
  description: string;
  image: string;
  secondaryImage: string;
  stock: number;
};

export const products: Product[] = [
  { id: 1, name: "Signature Linen Shirt", category: "Ready to Wear", collection: "The Essentials", price: 68000, color: "Ivory", colors: ["Ivory", "Obsidian"], sizes: ["XS", "S", "M", "L", "XL"], badge: "Best Seller", description: "A softly structured linen shirt with an effortless drape and considered proportions.", image: "/manus-storage/averae-product-linen_48e45a38.jpg", secondaryImage: "/manus-storage/averae-editorial_41cdaa8e.jpg", stock: 18 },
  { id: 2, name: "Sculpted Shoulder Bag", category: "Accessories", collection: "Objects of Ease", price: 124000, color: "Obsidian", colors: ["Obsidian", "Cognac"], sizes: ["One size"], badge: "Limited", description: "A clean-lined leather shoulder bag designed to move from day to evening.", image: "/manus-storage/averae-product-bag_c6fe5185.jpg", secondaryImage: "/manus-storage/averae-product-linen_48e45a38.jpg", stock: 7 },
  { id: 3, name: "Column Dress", category: "Ready to Wear", collection: "Quiet Form", price: 148000, color: "Sand", colors: ["Sand", "Black"], sizes: ["XS", "S", "M", "L"], badge: "New", description: "A fluid column silhouette cut from a tactile crepe with a low-key luminosity.", image: "/manus-storage/averae-editorial_41cdaa8e.jpg", secondaryImage: "/manus-storage/averae-product-linen_48e45a38.jpg", stock: 12 },
  { id: 4, name: "Everyday Tailored Trouser", category: "Ready to Wear", collection: "The Essentials", price: 92000, compareAt: 110000, color: "Taupe", colors: ["Taupe", "Obsidian"], sizes: ["XS", "S", "M", "L", "XL"], badge: "Sale", description: "An elevated everyday trouser with a relaxed waist and full-length line.", image: "/manus-storage/averae-editorial_41cdaa8e.jpg", secondaryImage: "/manus-storage/averae-product-linen_48e45a38.jpg", stock: 4 },
  { id: 5, name: "Soft Frame Sunglasses", category: "Accessories", collection: "Objects of Ease", price: 54000, color: "Tortoise", colors: ["Tortoise", "Black"], sizes: ["One size"], badge: "New", description: "A softly squared frame with a warm acetate finish and hand-balanced proportions.", image: "/manus-storage/averae-product-bag_c6fe5185.jpg", secondaryImage: "/manus-storage/averae-editorial_41cdaa8e.jpg", stock: 23 },
  { id: 6, name: "Daylight Knit", category: "Ready to Wear", collection: "Quiet Form", price: 76000, color: "Oat", colors: ["Oat", "Ivory"], sizes: ["XS", "S", "M", "L"], description: "A featherweight knit for the in-between hours.", image: "/manus-storage/averae-product-linen_48e45a38.jpg", secondaryImage: "/manus-storage/averae-product-bag_c6fe5185.jpg", stock: 9 },
];

export const marketplaceCategories = [
  { slug: 'women', label: 'Women', description: 'Fashion, shoes, bags, accessories and more.', image: '/manus-storage/averae-editorial_41cdaa8e.jpg' },
  { slug: 'men', label: 'Men', description: 'Clothing, footwear, watches, accessories and more.', image: '/manus-storage/averae-product-linen_48e45a38.jpg' },
  { slug: 'kids', label: 'Kids', description: 'Clothing, footwear and accessories.', image: '/manus-storage/averae-product-bag_c6fe5185.jpg' },
  { slug: 'jewelry', label: 'Jewelry', description: 'Necklaces, bracelets, rings, earrings and more.', image: '/manus-storage/averae-product-bag_c6fe5185.jpg' },
  { slug: 'shoes', label: 'Shoes', description: 'Sneakers, heels, sandals, boots and more.', image: '/manus-storage/averae-product-linen_48e45a38.jpg' },
  { slug: 'bags', label: 'Bags', description: 'Handbags, backpacks, crossbody bags and more.', image: '/manus-storage/averae-product-bag_c6fe5185.jpg' },
  { slug: 'accessories', label: 'Accessories', description: 'Watches, sunglasses, belts, hats and more.', image: '/manus-storage/averae-editorial_41cdaa8e.jpg' },
  { slug: 'beauty-lifestyle', label: 'Beauty & Lifestyle', description: 'Objects and rituals for everyday expression.', image: '/manus-storage/averae-product-linen_48e45a38.jpg' },
] as const;

export const trendItems = [
  { label: 'Trending', title: 'The new uniform', description: 'Relaxed tailoring, tactile layers and considered ease.', productId: 1 },
  { label: "Editor's Pick", title: 'Soft structure', description: 'Pieces that move between work, weekend and everywhere after.', productId: 3 },
  { label: 'Just In', title: 'Objects of ease', description: 'Accessories that finish the look without overstatement.', productId: 2 },
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
  primaryCta: 'Shop the latest',
  secondaryCta: 'Explore trends',
} as const;

export const formatPrice = (value: number) => `${brand.currency}${value.toLocaleString("en-NG")}`;
