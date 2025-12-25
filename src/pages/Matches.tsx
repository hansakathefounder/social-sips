import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { matchingService, profileService, restaurantService, DbMatch, DbProfile, DbRestaurant } from '@/services/supabaseApi';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface MatchWithUser extends DbMatch {
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  matchedRestaurantName: string | null;
  unreadCount: number;
  lastMessage: string | null;
}

const Matches = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadMatches();
    }
  }, [user]);

  const loadMatches = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const matchData = await matchingService.getMatches(user.id);
      console.log('Loaded matches:', matchData);
      
      // Load restaurants for name lookup
      const allRestaurants = await restaurantService.getAll();
      
      // Load profiles for each match
      const matchesWithUsers: MatchWithUser[] = await Promise.all(
        matchData.map(async (match) => {
          const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
          const profile = await profileService.getById(otherUserId);
          const restaurant = match.shared_restaurant_id 
            ? allRestaurants.find(r => r.id === match.shared_restaurant_id) 
            : null;
          
          return {
            ...match,
            user: {
              id: otherUserId,
              name: profile?.name || 'Unknown',
              avatar: profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
            },
            matchedRestaurantName: restaurant?.name || null,
            unreadCount: 0, // TODO: implement unread count
            lastMessage: null, // TODO: implement last message
          };
        })
      );
      
      setMatches(matchesWithUsers);
    } catch (error) {
      console.error('Failed to load matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  return (
    <AppLayout headerTitle="Matches" showLogo={false}>
      <div className="p-4">
        {/* New Matches */}
        <section className="mb-6">
          <h2 className="font-display font-semibold text-foreground mb-3">
            New Matches
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
            {matches.slice(0, 4).map((match, i) => (
              <Link key={match.id} to={`/chat/${match.id}`}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center gap-2 min-w-[72px]"
                >
                  <div className="relative">
                    <img
                      src={match.user.avatar}
                      alt={match.user.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                    />
                    {match.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-drink-red text-white text-xs flex items-center justify-center font-bold">
                        {match.unreadCount}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-medium text-foreground truncate max-w-[72px]">
                    {match.user.name}
                  </span>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>

        {/* Messages */}
        <section>
          <h2 className="font-display font-semibold text-foreground mb-3">
            Messages
          </h2>
          
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl bg-card animate-pulse">
                  <div className="w-14 h-14 rounded-full bg-secondary" />
                  <div className="flex-1">
                    <div className="h-4 bg-secondary rounded w-24 mb-2" />
                    <div className="h-3 bg-secondary rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display font-semibold text-foreground mb-2">
                No matches yet
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start swiping to find someone to drink with!
              </p>
              <Link to="/match">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 rounded-xl gradient-gold text-primary-foreground font-semibold"
                >
                  Find Matches
                </motion.button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {matches.map((match, i) => (
                <Link key={match.id} to={`/chat/${match.id}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl transition-all",
                      "glass hover:bg-card/80",
                      match.unreadCount > 0 && "bg-primary/5"
                    )}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={match.user.avatar}
                        alt={match.user.name}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                      <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-drink-green border-2 border-card" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={cn(
                          "font-semibold text-foreground truncate",
                          match.unreadCount > 0 && "text-primary"
                        )}>
                          {match.user.name}
                        </h3>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {formatTime(match.created_at)}
                        </span>
                      </div>
                      
                      <p className={cn(
                        "text-sm truncate",
                        match.unreadCount > 0 
                          ? "text-foreground font-medium" 
                          : "text-muted-foreground"
                      )}>
                        {match.lastMessage || 'Start a conversation!'}
                      </p>

                      {match.matchedRestaurantName && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-primary">
                            📍 {match.matchedRestaurantName}
                          </span>
                        </div>
                      )}
                    </div>

                    {match.unreadCount > 0 && (
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                        {match.unreadCount}
                      </span>
                    )}
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
};

export default Matches;
