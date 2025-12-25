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
import { restaurantService, reviewService, DbRestaurant } from '@/services/supabaseApi';
import { cn } from '@/lib/utils';

const RestaurantDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<DbRestaurant | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
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
      const data = await restaurantService.getById(id);
      setRestaurant(data);

      if (data) {
        const reviewData = await reviewService.getForRestaurant(id);
        setReviews(reviewData);
      }
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

  const photos = restaurant.photos || ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'];
  const features = restaurant.features || [];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Image Gallery */}
      <div className="relative h-72">
        <motion.img
          key={activeImageIndex}
          src={photos[activeImageIndex]}
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
        {photos.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {photos.map((_, i) => (
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
        )}
      </div>

      {/* Content */}
      <div className="px-4 -mt-8 relative z-10">
        {/* Header Card */}
        <div className="glass rounded-2xl p-5 mb-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className={restaurant.is_byob ? 'byob-badge' : 'no-byob-badge'}>
                {restaurant.is_byob ? '🍾 BYOB Friendly' : '🍸 Full Bar'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 fill-primary text-primary" />
              <span className="font-semibold text-foreground">{restaurant.rating || 0}</span>
              <span className="text-muted-foreground">({restaurant.review_count || 0})</span>
            </div>
          </div>

          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            {restaurant.name}
          </h1>

          <p className="text-sm text-muted-foreground mb-4">
            {restaurant.description || 'No description available'}
          </p>

          <div className="flex flex-wrap gap-2">
            {restaurant.cuisine && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                {restaurant.cuisine}
              </span>
            )}
            {restaurant.price_range && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                {'$'.repeat(restaurant.price_range)}
              </span>
            )}
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
              Open Now
            </p>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Phone className="w-4 h-4" />
              <span className="text-xs">Phone</span>
            </div>
            <p className="text-sm font-medium text-foreground">
              {restaurant.phone || 'N/A'}
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
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${restaurant.latitude},${restaurant.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary font-medium"
              >
                Get Directions →
              </a>
            </div>
          </div>
        </div>

        {/* Features */}
        {features.length > 0 && (
          <div className="mb-6">
            <h2 className="font-display font-semibold text-lg text-foreground mb-3">
              Features
            </h2>
            <div className="flex flex-wrap gap-2">
              {features.map((feature, i) => (
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
        )}

        {/* Reviews */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-lg text-foreground">
              Reviews
            </h2>
            <button className="text-sm text-primary font-medium flex items-center gap-1">
              See all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          {reviews.length > 0 ? (
            <div className="space-y-3">
              {reviews.slice(0, 3).map((review) => (
                <div key={review.id} className="glass rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-drink-gold to-drink-amber flex items-center justify-center">
                      <span className="text-sm font-bold text-drink-dark">
                        {review.profiles?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {review.profiles?.name || 'Anonymous'}
                      </p>
                      <div className="flex items-center gap-1">
                        {[1,2,3,4,5].map((i) => (
                          <Star 
                            key={i} 
                            className={cn(
                              "w-3 h-3",
                              i <= review.rating ? "fill-primary text-primary" : "text-muted-foreground"
                            )} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="glass rounded-xl p-4">
              <p className="text-sm text-muted-foreground text-center">
                No reviews yet. Be the first to review!
              </p>
            </div>
          )}
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
