import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RestaurantCard } from '@/components/restaurant/RestaurantCard';
import { restaurantService, userRestaurantService, DbRestaurant } from '@/services/supabaseApi';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Restaurant } from '@/data/mockData';

const MAX_SELECTIONS = 3;

// Transform DB restaurant to the format expected by RestaurantCard
const transformRestaurant = (r: DbRestaurant): Restaurant => ({
  id: r.id,
  name: r.name,
  description: r.description || '',
  address: r.address,
  cuisine: r.cuisine ? [r.cuisine] : [],
  priceRange: (r.price_range || 2) as 1 | 2 | 3 | 4,
  rating: r.rating || 0,
  reviewCount: r.review_count || 0,
  photos: r.photos || [],
  isByob: r.is_byob,
  features: r.features || [],
  latitude: r.latitude,
  longitude: r.longitude,
  phone: r.phone || '',
  openingHours: typeof r.opening_hours === 'string' ? r.opening_hours : '',
  menu: [],
});

const Match = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState<DbRestaurant[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadRestaurants();
    }
  }, [user]);

  const loadRestaurants = async () => {
    setLoading(true);
    try {
      const data = await restaurantService.getAll();
      setRestaurants(data);
      
      // Load existing selections
      if (user) {
        const existingSelections = await userRestaurantService.getSelected(user.id);
        setSelectedIds(existingSelections);
      }
    } catch (error) {
      console.error('Failed to load restaurants:', error);
      toast({
        title: "Error",
        description: "Failed to load restaurants",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      if (prev.length >= MAX_SELECTIONS) {
        toast({
          title: "Maximum reached",
          description: `You can only select ${MAX_SELECTIONS} restaurants`,
        });
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleContinue = async () => {
    if (selectedIds.length !== MAX_SELECTIONS) {
      toast({
        title: "Select 3 restaurants",
        description: "Please select exactly 3 restaurants to continue",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to continue",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    try {
      await userRestaurantService.updateSelections(user.id, selectedIds);
      navigate('/match/swipe');
    } catch (error) {
      console.error('Failed to save selections:', error);
      toast({
        title: "Error",
        description: "Failed to save your selections",
        variant: "destructive"
      });
    }
  };

  const byobRestaurants = restaurants.filter(r => r.is_byob);
  const barRestaurants = restaurants.filter(r => !r.is_byob);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground">Loading restaurants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-strong border-b border-border/50">
        <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
          <Link to="/">
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="font-display font-semibold text-lg">
            Choose Your Spots
          </h1>
          <div className="w-8" />
        </div>
      </header>

      {/* Progress */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Select your favorite drinking spots
          </span>
          <span className="text-sm font-semibold text-primary">
            {selectedIds.length}/{MAX_SELECTIONS}
          </span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full gradient-gold"
            initial={{ width: 0 }}
            animate={{ width: `${(selectedIds.length / MAX_SELECTIONS) * 100}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          You'll be matched with users who share at least one of these spots
        </p>
      </div>

      {/* Restaurant Lists */}
      <div className="px-4 space-y-6">
        {/* BYOB Section */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🍾</span>
            <h2 className="font-display font-semibold text-foreground">
              BYOB Spots
            </h2>
            <span className="text-xs text-muted-foreground">
              ({byobRestaurants.length})
            </span>
          </div>
          <div className="space-y-2">
            <AnimatePresence>
              {byobRestaurants.map((restaurant, i) => (
                <motion.div
                  key={restaurant.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <RestaurantCard
                    restaurant={transformRestaurant(restaurant)}
                    variant="compact"
                    selectable
                    selected={selectedIds.includes(restaurant.id)}
                    onSelect={() => toggleSelection(restaurant.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>

        {/* Bar Section */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🍸</span>
            <h2 className="font-display font-semibold text-foreground">
              Bars & Lounges
            </h2>
            <span className="text-xs text-muted-foreground">
              ({barRestaurants.length})
            </span>
          </div>
          <div className="space-y-2">
            <AnimatePresence>
              {barRestaurants.map((restaurant, i) => (
                <motion.div
                  key={restaurant.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <RestaurantCard
                    restaurant={transformRestaurant(restaurant)}
                    variant="compact"
                    selectable
                    selected={selectedIds.includes(restaurant.id)}
                    onSelect={() => toggleSelection(restaurant.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 glass-strong border-t border-border/50 safe-area-pb">
        <Button
          variant={selectedIds.length === MAX_SELECTIONS ? "gold" : "secondary"}
          size="lg"
          className="w-full max-w-lg mx-auto flex"
          disabled={selectedIds.length !== MAX_SELECTIONS}
          onClick={handleContinue}
        >
          {selectedIds.length === MAX_SELECTIONS ? (
            <>
              Find Matches
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          ) : (
            `Select ${MAX_SELECTIONS - selectedIds.length} more`
          )}
        </Button>
      </div>
    </div>
  );
};

export default Match;
