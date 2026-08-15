export const brand = {
  name: "AVERAE",
  tagline: "Designed for the moments that matter.",
  announcement: "Complimentary delivery on orders over ₦150,000",
  currency: "₦",
  country: "Nigeria",
  colors: {
    obsidian: "#171513",
    ivory: "#F7F4EE",
    gold: "#C7A46A",
    taupe: "#A69B8E",
    sand: "#E8E0D5",
    white: "#FFFFFF",
  },
  contact: { email: "hello@averae.com", phone: "+234 800 000 0000" },
  social: { instagram: "#", pinterest: "#" },
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

export const formatPrice = (value: number) => `${brand.currency}${value.toLocaleString("en-NG")}`;
