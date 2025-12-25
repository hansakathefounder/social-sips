// API service abstraction for future backend integration
import axios from 'axios';
import { 
  mockRestaurants, 
  mockUsers, 
  mockCurrentUser, 
  mockMatches, 
  mockMessages,
  Restaurant,
  User,
  Match,
  Message
} from '@/data/mockData';

// Base API configuration - update this when connecting to real backend
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Restaurant APIs
export const restaurantApi = {
  getAll: async (): Promise<Restaurant[]> => {
    await delay(300);
    return mockRestaurants;
  },

  getById: async (id: string): Promise<Restaurant | undefined> => {
    await delay(200);
    return mockRestaurants.find(r => r.id === id);
  },

  search: async (query: string): Promise<Restaurant[]> => {
    await delay(200);
    const lower = query.toLowerCase();
    return mockRestaurants.filter(r => 
      r.name.toLowerCase().includes(lower) ||
      r.cuisine.some(c => c.toLowerCase().includes(lower))
    );
  },

  getByFilters: async (filters: {
    isByob?: boolean;
    cuisine?: string[];
    priceRange?: number[];
    minRating?: number;
  }): Promise<Restaurant[]> => {
    await delay(300);
    return mockRestaurants.filter(r => {
      if (filters.isByob !== undefined && r.isByob !== filters.isByob) return false;
      if (filters.minRating && r.rating < filters.minRating) return false;
      if (filters.priceRange?.length && !filters.priceRange.includes(r.priceRange)) return false;
      if (filters.cuisine?.length && !r.cuisine.some(c => filters.cuisine!.includes(c))) return false;
      return true;
    });
  }
};

// User APIs
export const userApi = {
  getCurrentUser: async (): Promise<User> => {
    await delay(200);
    return mockCurrentUser;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    await delay(300);
    return { ...mockCurrentUser, ...data };
  },

  updateSelectedRestaurants: async (restaurantIds: string[]): Promise<User> => {
    await delay(200);
    mockCurrentUser.selectedRestaurants = restaurantIds;
    return mockCurrentUser;
  },

  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    await delay(500);
    return { user: mockCurrentUser, token: 'mock-jwt-token' };
  },

  signup: async (data: { name: string; email: string; password: string }): Promise<{ user: User; token: string }> => {
    await delay(500);
    return { user: { ...mockCurrentUser, name: data.name }, token: 'mock-jwt-token' };
  },

  logout: async (): Promise<void> => {
    await delay(200);
  }
};

// Matching APIs
export const matchingApi = {
  getPotentialMatches: async (selectedRestaurants: string[]): Promise<User[]> => {
    await delay(300);
    return mockUsers.filter(user => 
      user.selectedRestaurants.some(r => selectedRestaurants.includes(r))
    );
  },

  getMatchCount: (user: User, selectedRestaurants: string[]): number => {
    return user.selectedRestaurants.filter(r => selectedRestaurants.includes(r)).length;
  },

  swipe: async (userId: string, direction: 'left' | 'right'): Promise<{ matched: boolean; match?: Match }> => {
    await delay(300);
    if (direction === 'right' && Math.random() > 0.5) {
      const user = mockUsers.find(u => u.id === userId);
      if (user) {
        return {
          matched: true,
          match: {
            id: `match-${Date.now()}`,
            user,
            matchedRestaurants: user.selectedRestaurants.filter(r => 
              mockCurrentUser.selectedRestaurants.includes(r)
            ),
            matchedAt: new Date().toISOString(),
            unreadCount: 0
          }
        };
      }
    }
    return { matched: false };
  },

  getMatches: async (): Promise<Match[]> => {
    await delay(300);
    return mockMatches;
  }
};

// Chat APIs
export const chatApi = {
  getMessages: async (matchId: string): Promise<Message[]> => {
    await delay(200);
    return mockMessages[matchId] || [];
  },

  sendMessage: async (matchId: string, text: string): Promise<Message> => {
    await delay(200);
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: 'current',
      text,
      timestamp: new Date().toISOString(),
      seen: false
    };
    if (mockMessages[matchId]) {
      mockMessages[matchId].push(newMessage);
    }
    return newMessage;
  },

  markAsSeen: async (matchId: string): Promise<void> => {
    await delay(100);
    if (mockMessages[matchId]) {
      mockMessages[matchId].forEach(msg => {
        if (msg.senderId !== 'current') msg.seen = true;
      });
    }
  }
};

// Restaurant Owner APIs
export const ownerApi = {
  getMyRestaurant: async (): Promise<Restaurant | null> => {
    await delay(300);
    return mockRestaurants[0]; // Mock: first restaurant belongs to owner
  },

  updateRestaurant: async (id: string, data: Partial<Restaurant>): Promise<Restaurant> => {
    await delay(400);
    const restaurant = mockRestaurants.find(r => r.id === id);
    if (!restaurant) throw new Error('Restaurant not found');
    return { ...restaurant, ...data };
  },

  uploadPhoto: async (id: string, file: File): Promise<string> => {
    await delay(500);
    return 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800';
  },

  getReservations: async (restaurantId: string): Promise<any[]> => {
    await delay(300);
    return [
      { id: 1, name: 'John Doe', date: '2024-01-20', time: '19:00', guests: 4, status: 'confirmed' },
      { id: 2, name: 'Jane Smith', date: '2024-01-20', time: '20:30', guests: 2, status: 'pending' },
      { id: 3, name: 'Mike Johnson', date: '2024-01-21', time: '18:00', guests: 6, status: 'confirmed' }
    ];
  }
};

export default api;
