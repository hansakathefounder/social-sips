import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, List, X, LogIn, MapPin, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { RestaurantMap } from '@/components/restaurant/RestaurantMap';
import { RestaurantCard } from '@/components/restaurant/RestaurantCard';
import { AddRestaurantDialog } from '@/components/restaurant/AddRestaurantDialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { restaurantService, DbRestaurant } from '@/services/supabaseApi';
import { useAuth } from '@/contexts/AuthContext';
import { SRI_LANKA_CITIES } from '@/data/sriLankaCities';

type ViewMode = 'map' | 'list';
type FilterType = 'all' | 'byob' | 'bar';

// Adapter to convert DB restaurant to component format
const adaptRestaurant = (r: DbRestaurant) => ({
  id: r.id,
  name: r.name,
  description: r.description || '',
  isByob: r.is_byob,
  address: r.address,
  latitude: r.latitude,
  longitude: r.longitude,
  rating: r.rating || 0,
  reviewCount: r.review_count || 0,
  priceRange: (r.price_range || 2) as 1 | 2 | 3 | 4,
  cuisine: r.cuisine ? [r.cuisine] : [],
  photos: r.photos || [],
  menu: [],
  openingHours: '',
  phone: r.phone || '',
  features: r.features || [],
});

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [restaurants, setRestaurants] = useState<DbRestaurant[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState<ReturnType<typeof adaptRestaurant> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRestaurants();
  }, [filter, selectedCity]);

  const loadRestaurants = async () => {
    setLoading(true);
    try {
      const isByob = filter === 'byob' ? true : filter === 'bar' ? false : undefined;
      const data = await restaurantService.getByFilters({ 
        isByob, 
        city: selectedCity || undefined 
      });
      setRestaurants(data);
    } catch (error) {
      console.error('Failed to load restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const adaptedRestaurants = restaurants.map(adaptRestaurant);
  const selectedCityLabel = SRI_LANKA_CITIES.find(c => c.value === selectedCity)?.name || 'All Cities';

  return (
    <AppLayout>
      <div className="relative h-[calc(100vh-56px-80px)]">
        {/* Auth Button & Add Restaurant - Top Right */}
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
          {user && <AddRestaurantDialog onSuccess={loadRestaurants} />}
          {!authLoading && !user && (
            <Button
              variant="gold"
              size="sm"
              onClick={() => navigate('/auth')}
              className="gap-1.5"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Button>
          )}
        </div>

        {/* View Toggle & Filters */}
        <div className="absolute top-4 left-4 z-40 flex flex-wrap items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-xl glass">
            <Button
              variant={viewMode === 'map' ? 'gold' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('map')}
              className="gap-1.5"
            >
              <Map className="w-4 h-4" />
              Map
            </Button>
            <Button
              variant={viewMode === 'list' ? 'gold' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="gap-1.5"
            >
              <List className="w-4 h-4" />
              List
            </Button>
          </div>

          {/* BYOB/Bar Filters */}
          <div className="flex items-center gap-1 p-1 rounded-xl glass">
            {(['all', 'byob', 'bar'] as FilterType[]).map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'gold' : 'ghost'}
                size="sm"
                onClick={() => setFilter(f)}
                className="capitalize"
              >
                {f === 'byob' ? '🍾 BYOB' : f === 'bar' ? '🍸 Bar' : 'All'}
              </Button>
            ))}
          </div>

          {/* City Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="glass" size="sm" className="gap-1.5">
                <MapPin className="w-4 h-4" />
                {selectedCityLabel}
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-64 overflow-y-auto">
              {SRI_LANKA_CITIES.map((city) => (
                <DropdownMenuItem
                  key={city.value}
                  onClick={() => setSelectedCity(city.value)}
                  className={selectedCity === city.value ? 'bg-primary/10 text-primary' : ''}
                >
                  {city.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Map View */}
        <AnimatePresence mode="wait">
          {viewMode === 'map' && (
            <motion.div
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10"
            >
              <RestaurantMap
                restaurants={adaptedRestaurants}
                onRestaurantSelect={(r) => setSelectedRestaurant(r)}
                selectedId={selectedRestaurant?.id}
              />

              {/* Selected Restaurant Card */}
              <AnimatePresence>
                {selectedRestaurant && (
                  <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    className="absolute bottom-36 left-4 right-4 z-30"
                  >
                    <div className="relative">
                      <button
                        onClick={() => setSelectedRestaurant(null)}
                        className="absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <RestaurantCard
                        restaurant={selectedRestaurant}
                        variant="featured"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 overflow-y-auto pt-24 pb-4 px-4"
            >
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-64 rounded-2xl bg-card animate-pulse" />
                  ))}
                </div>
              ) : adaptedRestaurants.length === 0 ? (
                <div className="text-center py-12">
                  <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No restaurants found in {selectedCityLabel}</p>
                  <Button variant="outline" className="mt-4" onClick={() => setSelectedCity('')}>
                    Show All Cities
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {adaptedRestaurants.map((restaurant, i) => (
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA Banner - positioned above bottom nav */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              variant="match"
              size="lg"
              className="rounded-full shadow-elevated px-6"
              onClick={() => user ? navigate('/match') : navigate('/auth')}
            >
              <span className="text-lg mr-1">🍷</span>
              Find Someone to Drink With
            </Button>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
