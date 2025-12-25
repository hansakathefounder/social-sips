import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Clock, 
  Phone, 
  Share2,
  Heart,
  ChevronRight,
  Check
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { restaurantApi } from '@/services/api';
import { Restaurant } from '@/data/mockData';
import { cn } from '@/lib/utils';

const RestaurantDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadRestaurant();
  }, [id]);

  const loadRestaurant = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await restaurantApi.getById(id);
      setRestaurant(data || null);
    } catch (error) {
      console.error('Failed to load restaurant:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <p className="text-muted-foreground mb-4">Restaurant not found</p>
        <Link to="/">
          <Button variant="gold">Back to Home</Button>
        </Link>
      </div>
    );
  }

  const menuCategories = [...new Set(restaurant.menu.map(item => item.category))];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Image Gallery */}
      <div className="relative h-72">
        <motion.img
          key={activeImageIndex}
          src={restaurant.photos[activeImageIndex]}
          alt={restaurant.name}
          className="w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />

        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <Link to="/">
            <Button variant="glass" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="glass" size="icon">
              <Share2 className="w-5 h-5" />
            </Button>
            <Button 
              variant="glass" 
              size="icon"
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <Heart className={cn("w-5 h-5", isFavorite && "fill-drink-red text-drink-red")} />
            </Button>
          </div>
        </div>

        {/* Image Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {restaurant.photos.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveImageIndex(i)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                i === activeImageIndex 
                  ? "bg-primary w-6" 
                  : "bg-foreground/30 hover:bg-foreground/50"
              )}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-8 relative z-10">
        {/* Header Card */}
        <div className="glass rounded-2xl p-5 mb-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className={restaurant.isByob ? 'byob-badge' : 'no-byob-badge'}>
                {restaurant.isByob ? '🍾 BYOB Friendly' : '🍸 Full Bar'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 fill-primary text-primary" />
              <span className="font-semibold text-foreground">{restaurant.rating}</span>
              <span className="text-muted-foreground">({restaurant.reviewCount})</span>
            </div>
          </div>

          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            {restaurant.name}
          </h1>

          <p className="text-sm text-muted-foreground mb-4">
            {restaurant.description}
          </p>

          <div className="flex flex-wrap gap-2">
            {restaurant.cuisine.map((c, i) => (
              <span 
                key={i}
                className="px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
              >
                {c}
              </span>
            ))}
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
              {'$'.repeat(restaurant.priceRange)}
            </span>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">Hours</span>
            </div>
            <p className="text-sm font-medium text-foreground">
              {restaurant.openingHours}
            </p>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Phone className="w-4 h-4" />
              <span className="text-xs">Phone</span>
            </div>
            <p className="text-sm font-medium text-foreground">
              {restaurant.phone}
            </p>
          </div>
        </div>

        {/* Location */}
        <div className="glass rounded-xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground mb-1">
                {restaurant.address}
              </p>
              <a href="#" className="text-xs text-primary font-medium">
                Get Directions →
              </a>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-6">
          <h2 className="font-display font-semibold text-lg text-foreground mb-3">
            Features
          </h2>
          <div className="flex flex-wrap gap-2">
            {restaurant.features.map((feature, i) => (
              <span 
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-drink-cyan/10 text-drink-cyan border border-drink-cyan/20"
              >
                <Check className="w-3 h-3" />
                {feature}
              </span>
            ))}
          </div>
        </div>

        {/* Menu */}
        <div className="mb-6">
          <h2 className="font-display font-semibold text-lg text-foreground mb-3">
            Menu Highlights
          </h2>
          {menuCategories.map((category) => (
            <div key={category} className="mb-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                {category}
              </h3>
              <div className="space-y-2">
                {restaurant.menu
                  .filter(item => item.category === category)
                  .map((item) => (
                    <div 
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-card/50 border border-border/50"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-primary">
                        Rs. {item.price.toLocaleString()}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Reviews Preview */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-lg text-foreground">
              Reviews
            </h2>
            <button className="text-sm text-primary font-medium flex items-center gap-1">
              See all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-secondary" />
              <div>
                <p className="text-sm font-medium text-foreground">Happy Diner</p>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="w-3 h-3 fill-primary text-primary" />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              "Amazing atmosphere and the BYOB policy is perfect! Brought our own wine and had a fantastic evening."
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 glass-strong border-t border-border/50 safe-area-pb">
        <div className="flex gap-3 max-w-lg mx-auto">
          <Button variant="outline" className="flex-1">
            <Phone className="w-4 h-4 mr-2" />
            Call
          </Button>
          <Button variant="gold" className="flex-1">
            Reserve a Table
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetails;
