// Supabase API service for DrinkWithMe.lk
import { supabase } from '@/integrations/supabase/client';

export interface DbRestaurant {
  id: string;
  owner_id: string | null;
  name: string;
  description: string | null;
  address: string;
  latitude: number;
  longitude: number;
  is_byob: boolean;
  cuisine: string | null;
  price_range: number | null;
  rating: number | null;
  review_count: number | null;
  phone: string | null;
  website: string | null;
  opening_hours: unknown;
  photos: string[] | null;
  features: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface DbProfile {
  id: string;
  user_id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  age: number | null;
  location: string | null;
  favorite_drink: string | null;
  interests: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface DbMatch {
  id: string;
  user1_id: string;
  user2_id: string;
  shared_restaurant_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DbMessage {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  seen: boolean;
  created_at: string;
}

// Restaurant APIs
export const restaurantService = {
  getAll: async (): Promise<DbRestaurant[]> => {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('rating', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  getById: async (id: string): Promise<DbRestaurant | null> => {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  search: async (query: string): Promise<DbRestaurant[]> => {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .or(`name.ilike.%${query}%,cuisine.ilike.%${query}%`);
    
    if (error) throw error;
    return data || [];
  },

  getByFilters: async (filters: {
    isByob?: boolean;
    minRating?: number;
    city?: string;
  }): Promise<DbRestaurant[]> => {
    let query = supabase.from('restaurants').select('*');
    
    if (filters.isByob !== undefined) {
      query = query.eq('is_byob', filters.isByob);
    }
    
    if (filters.minRating) {
      query = query.gte('rating', filters.minRating);
    }
    
    if (filters.city) {
      query = query.ilike('address', `%${filters.city}%`);
    }
    
    const { data, error } = await query.order('rating', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
};

// User Selected Restaurants APIs
export const userRestaurantService = {
  getSelected: async (userId: string): Promise<string[]> => {
    const { data, error } = await supabase
      .from('user_selected_restaurants')
      .select('restaurant_id')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data?.map(r => r.restaurant_id) || [];
  },

  addSelection: async (userId: string, restaurantId: string): Promise<void> => {
    const { error } = await supabase
      .from('user_selected_restaurants')
      .insert({ user_id: userId, restaurant_id: restaurantId });
    
    if (error) throw error;
  },

  removeSelection: async (userId: string, restaurantId: string): Promise<void> => {
    const { error } = await supabase
      .from('user_selected_restaurants')
      .delete()
      .eq('user_id', userId)
      .eq('restaurant_id', restaurantId);
    
    if (error) throw error;
  },

  updateSelections: async (userId: string, restaurantIds: string[]): Promise<void> => {
    // Remove all existing selections
    await supabase
      .from('user_selected_restaurants')
      .delete()
      .eq('user_id', userId);
    
    // Add new selections
    if (restaurantIds.length > 0) {
      const { error } = await supabase
        .from('user_selected_restaurants')
        .insert(restaurantIds.map(id => ({ user_id: userId, restaurant_id: id })));
      
      if (error) throw error;
    }
  }
};

// Matching APIs
export const matchingService = {
  getPotentialMatches: async (userId: string): Promise<(DbProfile & { selectedRestaurants: string[] })[]> => {
    // Get current user's selected restaurants
    const userSelections = await userRestaurantService.getSelected(userId);
    
    if (userSelections.length === 0) {
      return [];
    }

    // Get all users who have selected at least one of the same restaurants
    const { data: matchingSelections, error: selError } = await supabase
      .from('user_selected_restaurants')
      .select('user_id, restaurant_id')
      .in('restaurant_id', userSelections)
      .neq('user_id', userId);
    
    if (selError) throw selError;
    
    // Get unique user IDs
    const matchingUserIds = [...new Set(matchingSelections?.map(s => s.user_id) || [])];
    
    if (matchingUserIds.length === 0) {
      return [];
    }

    // Get already swiped users
    const { data: swipes } = await supabase
      .from('swipes')
      .select('swiped_id')
      .eq('swiper_id', userId);
    
    const swipedIds = swipes?.map(s => s.swiped_id) || [];
    const unswipedUserIds = matchingUserIds.filter(id => !swipedIds.includes(id));

    if (unswipedUserIds.length === 0) {
      return [];
    }

    // Get profiles
    const { data: profiles, error: profError } = await supabase
      .from('profiles')
      .select('*')
      .in('user_id', unswipedUserIds);
    
    if (profError) throw profError;
    
    // Add selected restaurants to each profile
    const profilesWithSelections = (profiles || []).map(profile => {
      const selections = matchingSelections
        ?.filter(s => s.user_id === profile.user_id)
        .map(s => s.restaurant_id) || [];
      
      return { ...profile, selectedRestaurants: selections };
    });
    
    return profilesWithSelections;
  },

  swipe: async (swiperId: string, swipedId: string, direction: 'left' | 'right'): Promise<{ matched: boolean; matchId?: string }> => {
    // Check if swipe already exists to prevent duplicates
    const { data: existingSwipe } = await supabase
      .from('swipes')
      .select('id, direction')
      .eq('swiper_id', swiperId)
      .eq('swiped_id', swipedId)
      .maybeSingle();

    if (existingSwipe) {
      console.log('Swipe already exists, skipping insert');
      return { matched: false };
    }

    // Record the swipe
    const { error: swipeError } = await supabase
      .from('swipes')
      .insert({ swiper_id: swiperId, swiped_id: swipedId, direction });

    if (swipeError) {
      console.error('Swipe insert error:', swipeError);
      throw swipeError;
    }

    console.log('Swipe recorded successfully');

    if (direction === 'right') {
      // Check if the other user also swiped right
      const { data: mutualSwipe } = await supabase
        .from('swipes')
        .select('*')
        .eq('swiper_id', swipedId)
        .eq('swiped_id', swiperId)
        .eq('direction', 'right')
        .maybeSingle();

      console.log('Mutual swipe check:', mutualSwipe);

      if (mutualSwipe) {
        // Only create a match if users share at least 1 selected restaurant.
        const [mySelections, theirSelections] = await Promise.all([
          userRestaurantService.getSelected(swiperId),
          userRestaurantService.getSelected(swipedId),
        ]);

        const shared = mySelections.filter((id) => theirSelections.includes(id));
        if (shared.length === 0) {
          return { matched: false };
        }

        const sharedRestaurantId = shared[0];

        // Check if match already exists
        const { data: existingMatch } = await supabase
          .from('matches')
          .select('id')
          .or(
            `and(user1_id.eq.${swiperId},user2_id.eq.${swipedId}),and(user1_id.eq.${swipedId},user2_id.eq.${swiperId})`
          )
          .maybeSingle();

        if (existingMatch) {
          console.log('Match already exists:', existingMatch.id);
          return { matched: true, matchId: existingMatch.id };
        }

        // Create a match (store the shared restaurant when there's only 1 overlap too)
        const { data: match, error: matchError } = await supabase
          .from('matches')
          .insert({
            user1_id: swiperId,
            user2_id: swipedId,
            shared_restaurant_id: sharedRestaurantId,
            status: 'accepted',
          })
          .select()
          .single();

        if (matchError) {
          console.error('Match creation error:', matchError);
          throw matchError;
        }

        console.log('Match created:', match);
        return { matched: true, matchId: match.id };
      }
    }

    return { matched: false };
  },

  getMatches: async (userId: string): Promise<DbMatch[]> => {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .eq('status', 'accepted')
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  resetLeftSwipes: async (userId: string): Promise<void> => {
    const { error } = await supabase
      .from('swipes')
      .delete()
      .eq('swiper_id', userId)
      .eq('direction', 'left');
    
    if (error) throw error;
  }
};

// Chat APIs
export const chatService = {
  getMessages: async (matchId: string): Promise<DbMessage[]> => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  sendMessage: async (matchId: string, senderId: string, content: string): Promise<DbMessage> => {
    const { data, error } = await supabase
      .from('messages')
      .insert({ match_id: matchId, sender_id: senderId, content })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  markAsSeen: async (matchId: string, userId: string): Promise<void> => {
    const { error } = await supabase
      .from('messages')
      .update({ seen: true })
      .eq('match_id', matchId)
      .neq('sender_id', userId);
    
    if (error) throw error;
  },

  subscribeToMessages: (matchId: string, callback: (message: DbMessage) => void) => {
    return supabase
      .channel(`messages-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`
        },
        (payload) => callback(payload.new as DbMessage)
      )
      .subscribe();
  }
};

// Reviews APIs
export const reviewService = {
  getForRestaurant: async (restaurantId: string) => {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        profiles:user_id (name, avatar_url)
      `)
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  create: async (restaurantId: string, userId: string, rating: number, comment?: string) => {
    const { data, error } = await supabase
      .from('reviews')
      .insert({ restaurant_id: restaurantId, user_id: userId, rating, comment })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Profile APIs
export const profileService = {
  getById: async (userId: string): Promise<DbProfile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  update: async (userId: string, data: Partial<DbProfile>): Promise<DbProfile> => {
    const { data: updated, error } = await supabase
      .from('profiles')
      .update(data)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return updated;
  }
};

// Owner/Restaurant Management APIs
export const ownerService = {
  getMyRestaurant: async (ownerId: string): Promise<DbRestaurant | null> => {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('owner_id', ownerId)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  createRestaurant: async (ownerId: string, restaurant: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    is_byob?: boolean;
    description?: string;
    cuisine?: string;
    phone?: string;
  }): Promise<DbRestaurant> => {
    const { data, error } = await supabase
      .from('restaurants')
      .insert({
        ...restaurant,
        owner_id: ownerId,
        is_byob: restaurant.is_byob ?? false
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  updateRestaurant: async (restaurantId: string, updateData: {
    name?: string;
    address?: string;
    description?: string;
    cuisine?: string;
    phone?: string;
    website?: string;
    is_byob?: boolean;
    latitude?: number;
    longitude?: number;
    photos?: string[];
    features?: string[];
  }): Promise<DbRestaurant> => {
    const { data: updated, error } = await supabase
      .from('restaurants')
      .update(updateData)
      .eq('id', restaurantId)
      .select()
      .single();
    
    if (error) throw error;
    return updated;
  },

  getReservations: async (restaurantId: string) => {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  assignOwnerRole: async (userId: string): Promise<void> => {
    // Check if user already has owner role
    const { data: existing } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .eq('role', 'restaurant_owner')
      .maybeSingle();
    
    if (!existing) {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: 'restaurant_owner' });
      
      if (error) throw error;
    }
  },

  hasOwnerRole: async (userId: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .eq('role', 'restaurant_owner')
      .maybeSingle();
    
    if (error) throw error;
    return !!data;
  }
};
