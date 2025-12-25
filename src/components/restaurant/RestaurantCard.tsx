import { Star, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Restaurant } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface RestaurantCardProps {
  restaurant: Restaurant;
  variant?: 'default' | 'compact' | 'featured';
  selected?: boolean;
  onSelect?: () => void;
  selectable?: boolean;
}

export const RestaurantCard = ({
  restaurant,
  variant = 'default',
  selected = false,
  onSelect,
  selectable = false,
}: RestaurantCardProps) => {
  const CardWrapper = selectable ? 'div' : Link;
  const wrapperProps = selectable 
    ? { onClick: onSelect, className: 'cursor-pointer' }
    : { to: `/restaurant/${restaurant.id}` };

  if (variant === 'compact') {
    return (
      <CardWrapper {...(wrapperProps as any)}>
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-xl transition-all duration-200 glass",
          selected && "ring-2 ring-primary bg-primary/10",
          !selected && "hover:bg-card/80"
        )}>
          <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
            <img 
              src={restaurant.photos[0]} 
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-foreground truncate">
              {restaurant.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={restaurant.isByob ? 'byob-badge' : 'no-byob-badge'}>
                {restaurant.isByob ? 'BYOB' : 'Bar'}
              </span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="w-3 h-3 fill-primary text-primary" />
                {restaurant.rating}
              </div>
            </div>
          </div>
          {selectable && (
            <div className={cn(
              "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
              selected 
                ? "border-primary bg-primary" 
                : "border-muted-foreground/30"
            )}>
              {selected && <span className="text-primary-foreground text-xs">✓</span>}
            </div>
          )}
        </div>
      </CardWrapper>
    );
  }

  if (variant === 'featured') {
    return (
      <Link to={`/restaurant/${restaurant.id}`}>
        <div className="relative h-48 rounded-2xl overflow-hidden group">
          <img 
            src={restaurant.photos[0]} 
            alt={restaurant.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          
          <div className="absolute top-3 left-3">
            <span className={restaurant.isByob ? 'byob-badge' : 'no-byob-badge'}>
              {restaurant.isByob ? '🍾 BYOB' : '🍸 Bar'}
            </span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-display font-bold text-lg text-foreground mb-1">
              {restaurant.name}
            </h3>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-primary text-primary" />
                <span className="text-foreground font-medium">{restaurant.rating}</span>
                <span>({restaurant.reviewCount})</span>
              </div>
              <span>•</span>
              <span>{'$'.repeat(restaurant.priceRange)}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/restaurant/${restaurant.id}`}>
      <div className={cn(
        "group rounded-2xl overflow-hidden glass transition-all duration-300",
        "hover:shadow-elevated hover:-translate-y-1"
      )}>
        <div className="relative h-40 overflow-hidden">
          <img 
            src={restaurant.photos[0]} 
            alt={restaurant.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
          
          <div className="absolute top-3 left-3">
            <span className={restaurant.isByob ? 'byob-badge' : 'no-byob-badge'}>
              {restaurant.isByob ? '🍾 BYOB' : '🍸 Bar'}
            </span>
          </div>

          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full glass text-xs font-medium">
            <Star className="w-3 h-3 fill-primary text-primary" />
            <span>{restaurant.rating}</span>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-display font-bold text-base text-foreground mb-1 group-hover:text-primary transition-colors">
            {restaurant.name}
          </h3>
          
          <p className="text-sm text-muted-foreground line-clamp-1 mb-3">
            {restaurant.cuisine.join(' • ')}
          </p>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate max-w-[120px]">{restaurant.address.split(',')[0]}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{restaurant.openingHours.split(' - ')[0]}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
