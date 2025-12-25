import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Heart, RotateCcw, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { UserCard } from '@/components/matching/UserCard';
import { matchingService, userRestaurantService, restaurantService, DbProfile, DbRestaurant, profileService } from '@/services/supabaseApi';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface ProfileWithRestaurants extends DbProfile {
  selectedRestaurants: string[];
}

const MatchSwipe = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<ProfileWithRestaurants[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedUser, setMatchedUser] = useState<ProfileWithRestaurants | null>(null);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [mySelectedRestaurants, setMySelectedRestaurants] = useState<string[]>([]);
  const [restaurants, setRestaurants] = useState<DbRestaurant[]>([]);
  const [swipeHistory, setSwipeHistory] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    if (user) {
      loadPotentialMatches();
    }
  }, [user, authLoading, navigate]);

  const loadPotentialMatches = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load restaurants for name lookup
      const allRestaurants = await restaurantService.getAll();
      setRestaurants(allRestaurants);

      // Load my selected restaurants
      const mySelections = await userRestaurantService.getSelected(user.id);
      setMySelectedRestaurants(mySelections);

      if (mySelections.length === 0) {
        toast({
          title: "No restaurants selected",
          description: "Please select some restaurants first",
          variant: "destructive"
        });
        navigate('/match');
        return;
      }

      // Get potential matches
      const matches = await matchingService.getPotentialMatches(user.id);
      setUsers(matches);
    } catch (error) {
      console.error('Failed to load matches:', error);
      toast({
        title: "Error",
        description: "Failed to load potential matches",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const currentUser = users[currentIndex];

  const getMatchCount = (userProfile: ProfileWithRestaurants): number => {
    return userProfile.selectedRestaurants.filter(id => mySelectedRestaurants.includes(id)).length;
  };

  const getMatchedRestaurantNames = (userProfile: ProfileWithRestaurants): string[] => {
    return userProfile.selectedRestaurants
      .filter(id => mySelectedRestaurants.includes(id))
      .map(id => restaurants.find(r => r.id === id)?.name || '');
  };

  const handleSwipe = async (swipeDirection: 'left' | 'right') => {
    if (!currentUser || !user) return;

    setDirection(swipeDirection);
    
    try {
      console.log('Swiping:', { swiperId: user.id, swipedId: currentUser.user_id, direction: swipeDirection });
      const result = await matchingService.swipe(user.id, currentUser.user_id, swipeDirection);
      console.log('Swipe result:', result);
      
      if (result.matched) {
        setMatchedUser(currentUser);
        setShowMatch(true);
        toast({
          title: "It's a Match! 🎉",
          description: `You and ${currentUser.name} both want to drink together!`,
        });
      }

      setSwipeHistory(prev => [...prev, currentUser.user_id]);
      
      // Move to next user after animation
      setTimeout(() => {
        setDirection(null);
        setCurrentIndex(prev => prev + 1);
      }, 300);
    } catch (error) {
      console.error('Failed to record swipe:', error);
      toast({
        title: "Error",
        description: "Failed to record your choice. Please try again.",
        variant: "destructive"
      });
      setDirection(null);
    }
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      // Note: undo doesn't remove the swipe from database in this implementation
    }
  };

  // Transform DbProfile to User format for UserCard
  const transformToUser = (profileData: ProfileWithRestaurants) => ({
    id: profileData.user_id,
    name: profileData.name,
    age: profileData.age || 0,
    bio: profileData.bio || '',
    avatar: profileData.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
    interests: profileData.interests || [],
    location: profileData.location || '',
    favoriteDrink: profileData.favorite_drink || '',
    selectedRestaurants: profileData.selectedRestaurants,
    verified: true
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground">Finding people to drink with...</p>
        </div>
      </div>
    );
  }

  if (currentIndex >= users.length) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="text-6xl mb-4">🍷</div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-2 text-center">
          No more matches
        </h2>
        <p className="text-muted-foreground text-center mb-6">
          {users.length === 0 
            ? "No one has selected the same restaurants yet. Check back later!" 
            : "Check back later or try different restaurants"}
        </p>
        <div className="flex gap-3">
          <Link to="/match">
            <Button variant="outline">Change Spots</Button>
          </Link>
          <Link to="/matches">
            <Button variant="gold">View Matches</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between h-14 px-4">
        <Link to="/match">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} of {users.length}
          </span>
        </div>
        <Link to="/matches">
          <Button variant="ghost" size="icon-sm">
            <Heart className="w-5 h-5 text-drink-pink" />
          </Button>
        </Link>
      </header>

      {/* Card Stack */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence>
          {currentUser && (
            <motion.div
              key={currentUser.user_id}
              className="absolute inset-4"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                x: direction === 'left' ? -500 : direction === 'right' ? 500 : 0,
                rotate: direction === 'left' ? -20 : direction === 'right' ? 20 : 0,
              }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.7}
              onDragEnd={(_, info) => {
                if (info.offset.x > 100) {
                  handleSwipe('right');
                } else if (info.offset.x < -100) {
                  handleSwipe('left');
                }
              }}
            >
              <UserCard
                user={transformToUser(currentUser)}
                matchCount={getMatchCount(currentUser)}
                matchedRestaurantNames={getMatchedRestaurantNames(currentUser)}
              />
              
              {/* Swipe indicators - shown based on direction */}
              {direction === 'left' && (
                <div className="absolute top-8 left-8 px-4 py-2 rounded-lg bg-drink-red/90 text-white font-bold text-xl rotate-[-15deg]">
                  NOPE
                </div>
              )}
              {direction === 'right' && (
                <div className="absolute top-8 right-8 px-4 py-2 rounded-lg bg-drink-green/90 text-white font-bold text-xl rotate-[15deg]">
                  LIKE
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Background cards */}
        {users.slice(currentIndex + 1, currentIndex + 3).map((user, i) => (
          <div
            key={user.user_id}
            className="absolute inset-4 rounded-3xl bg-card opacity-50"
            style={{
              transform: `scale(${0.95 - i * 0.05}) translateY(${(i + 1) * 10}px)`,
              zIndex: -i - 1,
            }}
          />
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4 p-6">
        <Button
          variant="glass"
          size="icon-lg"
          onClick={handleUndo}
          disabled={currentIndex === 0}
          className="border-drink-amber/30"
        >
          <RotateCcw className="w-6 h-6 text-drink-amber" />
        </Button>

        <Button
          variant="glass"
          size="icon-lg"
          onClick={() => handleSwipe('left')}
          className="w-16 h-16 rounded-full border-drink-red/30"
        >
          <X className="w-8 h-8 text-drink-red" />
        </Button>

        <Button
          variant="glass"
          size="icon-lg"
          onClick={() => handleSwipe('right')}
          className="w-16 h-16 rounded-full border-drink-green/30"
        >
          <Heart className="w-8 h-8 text-drink-green" />
        </Button>

        <Button
          variant="glass"
          size="icon-lg"
          className="border-drink-cyan/30"
        >
          <Star className="w-6 h-6 text-drink-cyan" />
        </Button>
      </div>

      {/* Match Modal */}
      <AnimatePresence>
        {showMatch && matchedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md p-6"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="text-center"
            >
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="font-display text-3xl font-bold text-gradient-gold mb-2">
                It's a Match!
              </h2>
              <p className="text-muted-foreground mb-6">
                You and {matchedUser.name} both want to drink together
              </p>
              
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <img
                    src={profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400'}
                    alt="You"
                    className="w-24 h-24 rounded-full border-4 border-primary object-cover"
                  />
                </div>
                <div className="relative -ml-4">
                  <img
                    src={matchedUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400'}
                    alt={matchedUser.name}
                    className="w-24 h-24 rounded-full border-4 border-drink-pink object-cover"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowMatch(false)}
                >
                  Keep Swiping
                </Button>
                <Button
                  variant="match"
                  onClick={() => navigate('/matches')}
                >
                  Send Message
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MatchSwipe;
