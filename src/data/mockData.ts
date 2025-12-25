// Mock data for DrinkWithMe.lk

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  isByob: boolean;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  reviewCount: number;
  priceRange: 1 | 2 | 3 | 4;
  cuisine: string[];
  photos: string[];
  menu: MenuItem[];
  openingHours: string;
  phone: string;
  features: string[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

export interface User {
  id: string;
  name: string;
  age: number;
  bio: string;
  avatar: string;
  selectedRestaurants: string[];
  interests: string[];
  verified: boolean;
}

export interface Match {
  id: string;
  user: User;
  matchedRestaurants: string[];
  matchedAt: string;
  lastMessage?: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  seen: boolean;
}

export const mockRestaurants: Restaurant[] = [
  {
    id: "r1",
    name: "The Golden Barrel",
    description: "An upscale BYOB experience with craft cocktails and gourmet fusion cuisine in a trendy industrial setting.",
    isByob: true,
    address: "42 Galle Face Court, Colombo 03",
    latitude: 6.9271,
    longitude: 79.8612,
    rating: 4.8,
    reviewCount: 324,
    priceRange: 3,
    cuisine: ["Fusion", "Asian", "Contemporary"],
    photos: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800"
    ],
    menu: [
      { id: "m1", name: "Truffle Risotto", description: "Arborio rice with black truffle and parmesan", price: 2800, category: "Mains" },
      { id: "m2", name: "Seared Tuna Tataki", description: "Fresh tuna with ponzu and sesame", price: 1800, category: "Starters" },
      { id: "m3", name: "Lamb Shanks", description: "Slow-cooked lamb with rosemary jus", price: 3200, category: "Mains" }
    ],
    openingHours: "6:00 PM - 12:00 AM",
    phone: "+94 11 234 5678",
    features: ["Outdoor Seating", "Live Music", "Private Rooms", "Valet Parking"]
  },
  {
    id: "r2",
    name: "Moonlight Terrace",
    description: "Rooftop bar and restaurant with panoramic city views, signature cocktails, and Mediterranean-inspired dishes.",
    isByob: false,
    address: "Level 25, WTC Tower, Colombo 01",
    latitude: 6.9344,
    longitude: 79.8428,
    rating: 4.6,
    reviewCount: 512,
    priceRange: 4,
    cuisine: ["Mediterranean", "Seafood", "International"],
    photos: [
      "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800",
      "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=800",
      "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800"
    ],
    menu: [
      { id: "m4", name: "Lobster Thermidor", description: "Fresh lobster in creamy mustard sauce", price: 5500, category: "Mains" },
      { id: "m5", name: "Mezze Platter", description: "Hummus, baba ganoush, falafel, pita", price: 1600, category: "Starters" },
      { id: "m6", name: "Sunset Sangria", description: "House special red wine sangria", price: 1200, category: "Drinks" }
    ],
    openingHours: "5:00 PM - 2:00 AM",
    phone: "+94 11 345 6789",
    features: ["Rooftop View", "DJ Nights", "Happy Hour", "Dress Code"]
  },
  {
    id: "r3",
    name: "Spice Route Kitchen",
    description: "Authentic Sri Lankan cuisine with a modern twist. BYOB friendly with expert food pairing suggestions.",
    isByob: true,
    address: "78 Duplication Road, Colombo 04",
    latitude: 6.8947,
    longitude: 79.8567,
    rating: 4.7,
    reviewCount: 289,
    priceRange: 2,
    cuisine: ["Sri Lankan", "Asian", "Vegetarian Friendly"],
    photos: [
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
      "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800"
    ],
    menu: [
      { id: "m7", name: "Hoppers Platter", description: "Egg hoppers, string hoppers with sambols", price: 950, category: "Mains" },
      { id: "m8", name: "Devilled Prawns", description: "Spicy stir-fried prawns with peppers", price: 1800, category: "Mains" },
      { id: "m9", name: "Kottu Roti", description: "Chopped roti with vegetables and egg", price: 850, category: "Mains" }
    ],
    openingHours: "11:00 AM - 11:00 PM",
    phone: "+94 11 456 7890",
    features: ["Family Friendly", "Takeaway", "Delivery", "Wheelchair Accessible"]
  },
  {
    id: "r4",
    name: "Neon Nights Club & Lounge",
    description: "Premier nightlife destination with world-class DJs, premium spirits, and VIP bottle service.",
    isByob: false,
    address: "12 Marine Drive, Colombo 03",
    latitude: 6.9189,
    longitude: 79.8478,
    rating: 4.4,
    reviewCount: 678,
    priceRange: 4,
    cuisine: ["Bar Food", "International", "Tapas"],
    photos: [
      "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800",
      "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800",
      "https://images.unsplash.com/photo-1516997121675-4c2d1684aa3e?w=800"
    ],
    menu: [
      { id: "m10", name: "Signature Mojito", description: "Fresh mint, lime, premium white rum", price: 1400, category: "Cocktails" },
      { id: "m11", name: "Loaded Nachos", description: "Cheese, jalapeños, guac, sour cream", price: 1200, category: "Snacks" },
      { id: "m12", name: "Premium Whisky Flight", description: "4 single malts tasting", price: 3500, category: "Spirits" }
    ],
    openingHours: "8:00 PM - 4:00 AM",
    phone: "+94 11 567 8901",
    features: ["VIP Section", "Dance Floor", "Bottle Service", "Dress Code"]
  },
  {
    id: "r5",
    name: "The Craft House",
    description: "Artisanal brewery and gastropub serving house-made craft beers and gourmet pub grub.",
    isByob: false,
    address: "34 Park Street, Colombo 02",
    latitude: 6.9167,
    longitude: 79.8636,
    rating: 4.5,
    reviewCount: 445,
    priceRange: 2,
    cuisine: ["Pub Food", "American", "European"],
    photos: [
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800",
      "https://images.unsplash.com/photo-1485686531765-ba63b07845a7?w=800",
      "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800"
    ],
    menu: [
      { id: "m13", name: "Craft IPA", description: "House-brewed India Pale Ale", price: 800, category: "Beer" },
      { id: "m14", name: "Smash Burger", description: "Double patty, cheese, special sauce", price: 1500, category: "Mains" },
      { id: "m15", name: "Beer-Battered Fish & Chips", description: "Crispy fish with tartar sauce", price: 1600, category: "Mains" }
    ],
    openingHours: "12:00 PM - 12:00 AM",
    phone: "+94 11 678 9012",
    features: ["Brewery Tours", "Sports Screens", "Pet Friendly Patio", "Quiz Nights"]
  },
  {
    id: "r6",
    name: "Zen Garden BYOB",
    description: "Tranquil Japanese dining experience. Premium sushi and sake in an elegant zen-inspired setting.",
    isByob: true,
    address: "56 Alexandra Place, Colombo 07",
    latitude: 6.9120,
    longitude: 79.8680,
    rating: 4.9,
    reviewCount: 198,
    priceRange: 4,
    cuisine: ["Japanese", "Sushi", "Asian"],
    photos: [
      "https://images.unsplash.com/photo-1553621042-f6e147245754?w=800",
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800",
      "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=800"
    ],
    menu: [
      { id: "m16", name: "Omakase Experience", description: "Chef's selection, 12 pieces", price: 4500, category: "Sushi" },
      { id: "m17", name: "Wagyu Tataki", description: "Seared A5 wagyu with citrus ponzu", price: 3800, category: "Mains" },
      { id: "m18", name: "Miso Black Cod", description: "Marinated cod in sweet miso", price: 2800, category: "Mains" }
    ],
    openingHours: "6:00 PM - 11:00 PM",
    phone: "+94 11 789 0123",
    features: ["Private Tatami Rooms", "Teppanyaki", "Sake Pairing", "Reservations Required"]
  }
];

export const mockUsers: User[] = [
  {
    id: "u1",
    name: "Sarah",
    age: 28,
    bio: "Wine enthusiast and foodie. Love discovering new BYOB spots around Colombo! 🍷",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    selectedRestaurants: ["r1", "r3", "r6"],
    interests: ["Wine", "Fine Dining", "Travel", "Photography"],
    verified: true
  },
  {
    id: "u2",
    name: "Ashan",
    age: 32,
    bio: "Craft beer lover and weekend chef. Always up for good food and better company.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    selectedRestaurants: ["r1", "r5", "r3"],
    interests: ["Craft Beer", "Cooking", "Music", "Sports"],
    verified: true
  },
  {
    id: "u3",
    name: "Priya",
    age: 26,
    bio: "Marketing exec by day, cocktail connoisseur by night. Looking for drinking buddies! 🍸",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
    selectedRestaurants: ["r2", "r4", "r6"],
    interests: ["Cocktails", "Rooftop Bars", "Dancing", "Art"],
    verified: false
  },
  {
    id: "u4",
    name: "Kavinda",
    age: 30,
    bio: "Software dev who believes the best debugging happens over beers. Let's grab a drink!",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
    selectedRestaurants: ["r5", "r1", "r4"],
    interests: ["Tech", "Beer", "Gaming", "Hiking"],
    verified: true
  },
  {
    id: "u5",
    name: "Natalie",
    age: 29,
    bio: "Expat living my best life in Colombo. Sake sommelier in training. Always BYOB! 🍶",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
    selectedRestaurants: ["r6", "r3", "r1"],
    interests: ["Sake", "Japanese Food", "Yoga", "Beach"],
    verified: true
  },
  {
    id: "u6",
    name: "Dinesh",
    age: 34,
    bio: "Entrepreneur with a passion for whisky. Best conversations happen at the bar.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
    selectedRestaurants: ["r4", "r2", "r5"],
    interests: ["Whisky", "Business", "Golf", "Travel"],
    verified: true
  }
];

export const mockCurrentUser: User = {
  id: "current",
  name: "Alex",
  age: 27,
  bio: "Looking for great company to enjoy Colombo's best drinking spots!",
  avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400",
  selectedRestaurants: [],
  interests: ["Wine", "Cocktails", "Food", "Music"],
  verified: true
};

export const mockMatches: Match[] = [
  {
    id: "match1",
    user: mockUsers[0],
    matchedRestaurants: ["r1", "r3"],
    matchedAt: "2024-01-15T20:30:00Z",
    lastMessage: "Hey! Wanna check out The Golden Barrel this weekend?",
    unreadCount: 2
  },
  {
    id: "match2",
    user: mockUsers[1],
    matchedRestaurants: ["r1"],
    matchedAt: "2024-01-14T18:15:00Z",
    lastMessage: "That craft beer selection was amazing!",
    unreadCount: 0
  }
];

export const mockMessages: Record<string, Message[]> = {
  match1: [
    { id: "msg1", senderId: "u1", text: "Hey! I saw we both love The Golden Barrel!", timestamp: "2024-01-15T20:30:00Z", seen: true },
    { id: "msg2", senderId: "current", text: "Yes! Their truffle risotto is incredible 😍", timestamp: "2024-01-15T20:32:00Z", seen: true },
    { id: "msg3", senderId: "u1", text: "Right?! Have you tried bringing your own wine there?", timestamp: "2024-01-15T20:35:00Z", seen: true },
    { id: "msg4", senderId: "current", text: "Not yet! Any recommendations?", timestamp: "2024-01-15T20:38:00Z", seen: true },
    { id: "msg5", senderId: "u1", text: "Hey! Wanna check out The Golden Barrel this weekend?", timestamp: "2024-01-16T10:15:00Z", seen: false }
  ],
  match2: [
    { id: "msg6", senderId: "u2", text: "Yo! Fellow craft beer lover here 🍺", timestamp: "2024-01-14T18:15:00Z", seen: true },
    { id: "msg7", senderId: "current", text: "Hey! Always good to meet another beer enthusiast!", timestamp: "2024-01-14T18:20:00Z", seen: true },
    { id: "msg8", senderId: "u2", text: "That craft beer selection was amazing!", timestamp: "2024-01-14T19:00:00Z", seen: true }
  ]
};
