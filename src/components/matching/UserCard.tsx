import { motion } from 'framer-motion';
import { MapPin, CheckCircle2, Lock } from 'lucide-react';
import { User } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface UserCardProps {
  user: User;
  matchCount: number;
  matchedRestaurantNames: string[];
  isLocked?: boolean;
  onUnlock?: () => void;
}

export const UserCard = ({
  user,
  matchCount,
  matchedRestaurantNames,
  isLocked = false,
  onUnlock,
}: UserCardProps) => {
  const getMatchBadgeClass = () => {
    switch (matchCount) {
      case 3: return 'match-3';
      case 2: return 'match-2';
      default: return 'match-1';
    }
  };

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden bg-card shadow-elevated">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img
          src={user.avatar}
          alt={user.name}
          className={cn(
            "w-full h-full object-cover",
            isLocked && "blur-lg"
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      {/* Locked overlay */}
      {isLocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-background/60 backdrop-blur-sm">
          <Lock className="w-16 h-16 text-muted-foreground mb-4" />
          <p className="text-lg font-semibold text-foreground mb-2">Profile Locked</p>
          <p className="text-sm text-muted-foreground mb-4 text-center px-8">
            Unlock to see users outside your restaurant preferences
          </p>
          <Button variant="gold" onClick={onUnlock}>
            Unlock to Match
          </Button>
        </div>
      )}

      {/* Content */}
      {!isLocked && (
        <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
          {/* Match badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className={cn("match-badge", getMatchBadgeClass())}>
              {matchCount === 3 && '🔥'} {matchCount} {matchCount === 1 ? 'spot' : 'spots'} in common
            </span>
            {user.verified && (
              <CheckCircle2 className="w-5 h-5 text-drink-cyan" />
            )}
          </div>

          {/* Name and age */}
          <div className="flex items-baseline gap-2 mb-2">
            <h2 className="font-display text-3xl font-bold text-foreground">
              {user.name}
            </h2>
            <span className="text-xl text-muted-foreground">{user.age}</span>
          </div>

          {/* Bio */}
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {user.bio}
          </p>

          {/* Matched restaurants */}
          <div className="flex flex-wrap gap-2 mb-4">
            {matchedRestaurantNames.map((name, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30"
              >
                📍 {name}
              </span>
            ))}
          </div>

          {/* Interests */}
          <div className="flex flex-wrap gap-2">
            {user.interests.slice(0, 4).map((interest, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Swipeable card wrapper
export const SwipeableCard = ({
  children,
  onSwipe,
  index = 0,
}: {
  children: React.ReactNode;
  onSwipe: (direction: 'left' | 'right') => void;
  index?: number;
}) => {
  return (
    <motion.div
      className="absolute inset-4"
      style={{ zIndex: 10 - index }}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1 - index * 0.05, opacity: 1 }}
      exit={{ opacity: 0 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={(_, info) => {
        if (info.offset.x > 100) {
          onSwipe('right');
        } else if (info.offset.x < -100) {
          onSwipe('left');
        }
      }}
      whileDrag={{ cursor: 'grabbing' }}
    >
      {children}
    </motion.div>
  );
};
