import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RestaurantCard } from '@/components/restaurant/RestaurantCard';
import { restaurantApi, userApi } from '@/services/api';
import { Restaurant } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';

const MAX_SELECTIONS = 3;

const Match = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    setLoading(true);
    try {
      const data = await restaurantApi.getAll();
      setRestaurants(data);
    } catch (error) {
      console.error('Failed to load restaurants:', error);
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

    await userApi.updateSelectedRestaurants(selectedIds);
    navigate('/match/swipe');
  };

  const byobRestaurants = restaurants.filter(r => r.isByob);
  const barRestaurants = restaurants.filter(r => !r.isByob);

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
                    restaurant={restaurant}
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
                    restaurant={restaurant}
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
