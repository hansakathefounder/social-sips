import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { RestaurantCard } from '@/components/restaurant/RestaurantCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { restaurantApi } from '@/services/api';
import { Restaurant } from '@/data/mockData';
import { cn } from '@/lib/utils';

const Explore = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    byob: null as boolean | null,
    minRating: 0,
    priceRange: [] as number[],
  });

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

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadRestaurants();
      return;
    }
    setLoading(true);
    try {
      const data = await restaurantApi.search(searchQuery);
      setRestaurants(data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    setLoading(true);
    try {
      const data = await restaurantApi.getByFilters({
        isByob: filters.byob ?? undefined,
        minRating: filters.minRating || undefined,
        priceRange: filters.priceRange.length ? filters.priceRange : undefined,
      });
      setRestaurants(data);
      setShowFilters(false);
    } catch (error) {
      console.error('Filter failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({ byob: null, minRating: 0, priceRange: [] });
    loadRestaurants();
    setShowFilters(false);
  };

  const cuisines = [...new Set(restaurants.flatMap(r => r.cuisine))];

  return (
    <AppLayout>
      <div className="p-4">
        {/* Search Bar */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search restaurants, cuisines..."
              className="pl-10 bg-secondary border-0"
            />
          </div>
          <Button
            variant="glass"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </Button>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="glass rounded-xl p-4 mb-4 space-y-4">
                {/* Type Filter */}
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Type</p>
                  <div className="flex gap-2">
                    {[
                      { value: null, label: 'All' },
                      { value: true, label: '🍾 BYOB' },
                      { value: false, label: '🍸 Bar' },
                    ].map((option) => (
                      <Button
                        key={String(option.value)}
                        variant={filters.byob === option.value ? 'gold' : 'secondary'}
                        size="sm"
                        onClick={() => setFilters(f => ({ ...f, byob: option.value }))}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Minimum Rating</p>
                  <div className="flex gap-2">
                    {[0, 3, 4, 4.5].map((rating) => (
                      <Button
                        key={rating}
                        variant={filters.minRating === rating ? 'gold' : 'secondary'}
                        size="sm"
                        onClick={() => setFilters(f => ({ ...f, minRating: rating }))}
                      >
                        {rating === 0 ? 'Any' : `${rating}+`}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Price Filter */}
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Price Range</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((price) => (
                      <Button
                        key={price}
                        variant={filters.priceRange.includes(price) ? 'gold' : 'secondary'}
                        size="sm"
                        onClick={() => setFilters(f => ({
                          ...f,
                          priceRange: f.priceRange.includes(price)
                            ? f.priceRange.filter(p => p !== price)
                            : [...f.priceRange, price]
                        }))}
                      >
                        {'$'.repeat(price)}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" onClick={clearFilters}>
                    Clear All
                  </Button>
                  <Button variant="gold" className="flex-1" onClick={applyFilters}>
                    Apply Filters
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Cuisine Tags */}
        <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 mb-4 scrollbar-hide">
          {cuisines.slice(0, 8).map((cuisine) => (
            <button
              key={cuisine}
              onClick={() => {
                setSearchQuery(cuisine);
                handleSearch();
              }}
              className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {cuisine}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-card animate-pulse" />
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No restaurants found</p>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {restaurants.map((restaurant, i) => (
              <motion.div
                key={restaurant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <RestaurantCard restaurant={restaurant} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Explore;
