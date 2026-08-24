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
  badge?: 'New' | 'Best Seller' | 'Limited' | 'Sale' | 'Currently unavailable';
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
  { id: 8, name: "Sculptural Beaded Collar", brand: "Kijani Objects", category: "Jewelry", collection: "Objects of Ease", price: 88000, color: "Amber", colors: ["Amber", "Obsidian"], sizes: ["One size"], inventoryBySize: { "One size": 0 }, badge: "Currently unavailable", audiences: ["Women", "Men", "Unisex"], description: "A hand-finished collar that brings graphic rhythm and warmth to a simple silhouette.", image: "/manus-storage/averae-product-bag_c6fe5185.jpg", secondaryImage: "/manus-storage/averae-editorial_41cdaa8e.jpg", stock: 0, ...unrated },
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

export const trendCollections = [
  { slug: 'soft-structure', label: 'Trending styles', title: 'Soft structure', description: 'Relaxed tailoring, linen and tactile layers for a considered everyday silhouette.', keywords: 'soft structure linen tailoring', productIds: [1, 3, 4, 6], shopHref: '/shop?category=clothing' },
  { slug: 'quiet-neutrals', label: 'Trending colours', title: 'Quiet neutrals', description: 'Ivory, oat, sand and cocoa bring warmth to the season’s easiest combinations.', keywords: 'quiet neutrals ivory oat sand cocoa', productIds: [1, 3, 6, 7], shopHref: '/shop?search=oat' },
  { slug: 'objects-of-ease', label: 'Trending accessories', title: 'Objects of ease', description: 'Bags, jewelry and finishing pieces that bring intention to the everyday.', keywords: 'objects ease accessories bags jewelry', productIds: [2, 5, 8, 9], shopHref: '/shop?category=accessories' },
  { slug: 'african-contemporary', label: 'Trending now', title: 'African contemporary', description: 'Rooted references, modern proportions and a point of view that travels.', keywords: 'african contemporary rooted culture', productIds: [2, 7, 8, 11], shopHref: '/shop?category=accessories' },
  { slug: 'everyday-essentials', label: 'Trending categories', title: 'Everyday essentials', description: 'The pieces that build a wardrobe with room for every expression.', keywords: 'everyday essentials wardrobe basics', productIds: [1, 4, 6, 10], shopHref: '/shop?search=essentials' },
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
};

export const editorialEntries: EditorialEntry[] = [
  { slug: 'styles-defining-this-season', label: 'The Áveraẹ Edit', category: 'Trends', title: '5 styles defining this season', description: 'A visual guide to the pieces and proportions shaping what comes next.', image: '/manus-storage/averae-editorial_41cdaa8e.jpg', date: '22 August 2026', readingTime: '6 min read', author: 'The Áveraẹ Editors', content: ['Style is a conversation between where we are and where we are going. This edit brings together pieces, proportions and perspectives that feel relevant now, while leaving room for personal expression.', 'Look for softened tailoring, tactile neutrals and accessories that add rhythm without asking for attention. The result is a wardrobe with movement, clarity and room to make each piece your own.'], relatedProductIds: [1, 3, 4], relatedArticleSlugs: ['how-to-style-linen', 'the-accessories-that-finish-a-look'], lookProductIds: [1, 4, 7], audience: 'Unisex' },
  { slug: 'rooted-here-worn-everywhere', label: 'Cultural spotlight', category: 'African Fashion', title: 'Rooted here. Worn everywhere.', description: 'Contemporary African fashion, creators and a global point of view.', image: '/manus-storage/averae-marketplace-hero_ccb2d39f.jpg', date: '15 August 2026', readingTime: '8 min read', author: 'The Áveraẹ Editors', content: ['African fashion has always carried a conversation between place, memory and possibility. Today, designers are translating those references into silhouettes that travel without losing their sense of origin.', 'The pieces in this story value material, proportion and process. They invite a slower kind of looking, then offer an easy way into everyday dressing.'], relatedProductIds: [2, 7, 8], relatedArticleSlugs: ['styles-defining-this-season', 'a-guide-to-considered-gifting'], lookProductIds: [2, 7, 8], audience: 'Unisex' },
  { slug: 'how-to-style-linen', label: 'Style guide', category: 'Style Guides', title: 'How to style linen this season', description: 'Five pieces, endless combinations and a softer way to dress.', image: '/manus-storage/averae-product-linen_48e45a38.jpg', date: '08 August 2026', readingTime: '5 min read', author: 'Nia Okafor', content: ['Linen works best when it is allowed to breathe. Pair a softly structured shirt with a full-length trouser, then let texture do the work of creating contrast.', 'For a more considered finish, introduce one sculptural accessory and keep the palette close to ivory, oat, cocoa and obsidian. The look is relaxed, but never accidental.'], relatedProductIds: [1, 4, 6], relatedArticleSlugs: ['styles-defining-this-season', 'the-accessories-that-finish-a-look'], lookProductIds: [1, 4, 2], audience: 'Women' },
  { slug: 'the-accessories-that-finish-a-look', label: 'Objects of ease', category: 'Accessories', title: 'The accessories that finish a look', description: 'Quietly graphic pieces that bring intention to everyday dressing.', image: '/manus-storage/averae-product-bag_c6fe5185.jpg', date: '31 July 2026', readingTime: '4 min read', author: 'The Áveraẹ Editors', content: ['The right accessory does not compete with a look; it gives the eye somewhere to land. Think softened leather, warm metal and frames with a little architectural tension.', 'Build from one anchor piece, then add only what helps the silhouette feel complete. Ease is the point.'], relatedProductIds: [2, 5, 9], relatedArticleSlugs: ['styles-defining-this-season', 'rooted-here-worn-everywhere'], lookProductIds: [2, 5, 9], audience: 'Unisex' },
  { slug: 'dressing-for-the-in-between', label: 'Everyday dressing', category: 'Fashion', title: 'Dressing for the in-between', description: 'A practical edit for days that refuse to stay in one category.', image: '/manus-storage/averae-editorial_41cdaa8e.jpg', date: '24 July 2026', readingTime: '7 min read', author: 'Nia Okafor', content: ['Some of the best looks begin with an uncertain plan. A breathable base, a tailored layer and one useful object can move comfortably between work, weekends and everywhere after.', 'Choose pieces that layer without bulk and colours that carry across the day. The most versatile wardrobe is not the largest one; it is the one that keeps offering new combinations.'], relatedProductIds: [1, 4, 6], relatedArticleSlugs: ['how-to-style-linen', 'a-guide-to-considered-gifting'], lookProductIds: [1, 6, 10], audience: 'Men' },
  { slug: 'a-guide-to-considered-gifting', label: 'The considered edit', category: 'Shopping Guides', title: 'A guide to considered gifting', description: 'Useful objects and small rituals chosen with another person in mind.', image: '/manus-storage/averae-marketplace-hero_ccb2d39f.jpg', date: '18 July 2026', readingTime: '5 min read', author: 'The Áveraẹ Editors', content: ['A thoughtful gift begins with attention. Look for objects that meet a real ritual, then choose the detail that makes it feel personal: a warm colour, an easy shape or a material with presence.', 'This selection is designed to be useful, beautiful and easy to live with long after the wrapping is gone.'], relatedProductIds: [2, 10, 11], relatedArticleSlugs: ['the-accessories-that-finish-a-look', 'rooted-here-worn-everywhere'], lookProductIds: [2, 10, 11], audience: 'Unisex' },
  { slug: 'small-rituals-big-inspiration', label: 'The daily edit', category: 'Inspiration', title: 'Small rituals, big inspiration', description: 'The everyday details that make personal style feel like your own.', image: '/manus-storage/averae-product-linen_48e45a38.jpg', date: '10 July 2026', readingTime: '3 min read', author: 'Nia Okafor', content: ['Personal style is often built in small decisions: the texture you reach for, the object you carry, the colour that changes your posture. These details make a look feel lived in.', 'Start with one familiar piece, then introduce one new point of view. Inspiration is more useful when it can become part of the day.'], relatedProductIds: [5, 6, 11], relatedArticleSlugs: ['dressing-for-the-in-between', 'the-accessories-that-finish-a-look'], lookProductIds: [5, 6, 11], audience: 'Kids' },
  { slug: 'the-new-everyday', label: 'The wardrobe note', category: 'Culture', title: 'The new everyday', description: 'Why ease, utility and expression are finding a new balance.', image: '/manus-storage/averae-editorial_41cdaa8e.jpg', date: '02 July 2026', readingTime: '6 min read', author: 'The Áveraẹ Editors', content: ['The new everyday is not a uniform. It is a way of choosing: fewer compromises, more useful beauty and silhouettes that make space for real movement.', 'Across fashion and culture, the most compelling ideas connect utility with feeling. That is where a wardrobe starts to sound like its wearer.'], relatedProductIds: [1, 2, 10], relatedArticleSlugs: ['styles-defining-this-season', 'small-rituals-big-inspiration'], lookProductIds: [1, 2, 10], audience: 'Unisex' },
];

export const featuredLook = {
  title: 'The everyday statement',
  description: 'A versatile edit designed to move from day to night, from one expression to the next.',
  image: '/manus-storage/averae-marketplace-hero_ccb2d39f.jpg',
  productIds: [1, 2, 4],
} as const;

export const lookCollections = [
  { slug: 'womens-look', audience: 'Women' as const, title: 'A softer point of view', description: 'Fluid layers and warm accessories for an easy, expressive day.', image: '/manus-storage/averae-editorial_41cdaa8e.jpg', productIds: [1, 3, 2] },
  { slug: 'mens-look', audience: 'Men' as const, title: 'The relaxed uniform', description: 'Tactile essentials with enough structure for every direction.', image: '/manus-storage/averae-product-linen_48e45a38.jpg', productIds: [1, 4, 10] },
  { slug: 'kids-look', audience: 'Kids' as const, title: 'Made for movement', description: 'Soft cotton and everyday pieces designed to keep up.', image: '/manus-storage/averae-marketplace-hero_ccb2d39f.jpg', productIds: [12, 11, 5] },
  { slug: 'unisex-look', audience: 'Unisex' as const, title: 'Open expression', description: 'A considered mix of texture, proportion and useful objects.', image: '/manus-storage/averae-product-bag_c6fe5185.jpg', productIds: [1, 2, 7] },
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
