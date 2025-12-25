import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Edit3, 
  MapPin, 
  Star, 
  Wine, 
  Camera,
  ChevronRight,
  LogOut,
  Shield,
  Bell,
  HelpCircle,
  Crown,
  LogIn
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { userRestaurantService, restaurantService, matchingService } from '@/services/supabaseApi';

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, loading } = useAuth();
  const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>([]);
  const [restaurantNames, setRestaurantNames] = useState<string[]>([]);
  const [matchCount, setMatchCount] = useState(0);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    setLoadingData(true);
    try {
      // Load selected restaurants
      const selections = await userRestaurantService.getSelected(user.id);
      setSelectedRestaurants(selections);

      // Get restaurant names
      if (selections.length > 0) {
        const restaurants = await restaurantService.getAll();
        const names = selections
          .map(id => restaurants.find(r => r.id === id)?.name)
          .filter(Boolean) as string[];
        setRestaurantNames(names);
      }

      // Get match count
      const matches = await matchingService.getMatches(user.id);
      setMatchCount(matches.length);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
    navigate('/');
  };

  if (loading || !user || !profile) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[calc(100vh-56px-80px)]">
          <div className="animate-pulse">
            <Wine className="w-12 h-12 text-drink-gold" />
          </div>
        </div>
      </AppLayout>
    );
  }

  const menuItems = [
    { icon: Edit3, label: 'Edit Profile', action: () => toast({ title: "Coming soon", description: "Profile editing will be available soon." }) },
    { icon: Bell, label: 'Notifications', action: () => toast({ title: "Coming soon", description: "Notification settings will be available soon." }) },
    { icon: Shield, label: 'Privacy & Safety', action: () => toast({ title: "Coming soon", description: "Privacy settings will be available soon." }) },
    { icon: HelpCircle, label: 'Help & Support', action: () => toast({ title: "Coming soon", description: "Help & Support will be available soon." }) },
    { icon: LogOut, label: 'Sign Out', action: handleSignOut, danger: true },
  ];

  return (
    <AppLayout>
      <div className="p-4 pb-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative glass rounded-2xl p-6 mb-6 overflow-hidden"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-drink-pink/10" />
          
          <div className="relative flex items-start gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-drink-gold to-drink-amber flex items-center justify-center border-2 border-primary/50">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.name}
                    className="w-full h-full rounded-2xl object-cover"
                  />
                ) : (
                  <span className="text-4xl font-display font-bold text-drink-dark">
                    {profile.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
                <Camera className="w-4 h-4 text-primary-foreground" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-display text-2xl font-bold text-foreground">
                  {profile.name}
                </h1>
                {profile.age && (
                  <span className="text-xl text-muted-foreground">{profile.age}</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {profile.bio || 'No bio yet'}
              </p>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Edit3 className="w-3.5 h-3.5" />
                Edit Profile
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          {[
            { icon: Wine, value: matchCount.toString(), label: 'Matches' },
            { icon: MapPin, value: selectedRestaurants.length.toString(), label: 'Spots' },
            { icon: Star, value: '0', label: 'Reviews' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass rounded-xl p-4 text-center"
            >
              <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="font-display text-xl font-bold text-foreground">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Selected Restaurants */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass rounded-xl p-4 mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-foreground">
              My Drinking Spots
            </h2>
            <Button variant="ghost" size="sm" className="text-primary" onClick={() => navigate('/match')}>
              Edit
            </Button>
          </div>
          
          {restaurantNames.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {restaurantNames.map((name, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                >
                  📍 {name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Select restaurants to start matching
            </p>
          )}
        </motion.div>

        {/* Interests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-4 mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-foreground">
              Interests
            </h2>
            <Button variant="ghost" size="sm" className="text-primary">
              Edit
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.interests && profile.interests.length > 0 ? (
              profile.interests.map((interest, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
                >
                  {interest}
                </span>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No interests added yet</p>
            )}
          </div>
        </motion.div>

        {/* Premium Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="relative rounded-xl p-4 mb-6 overflow-hidden"
          style={{ background: 'var(--gradient-match)' }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-bold text-white">
                Go Premium
              </h3>
              <p className="text-sm text-white/80">
                Unlock unlimited matches & more
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-white" />
          </div>
        </motion.div>

        {/* Menu */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-xl overflow-hidden"
        >
          {menuItems.map((item, i) => (
            <button
              key={item.label}
              onClick={item.action}
              className={cn(
                "flex items-center gap-3 w-full px-4 py-3.5 transition-colors",
                "hover:bg-card/80",
                i !== menuItems.length - 1 && "border-b border-border/50"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5",
                item.danger ? "text-destructive" : "text-muted-foreground"
              )} />
              <span className={cn(
                "flex-1 text-left text-sm font-medium",
                item.danger ? "text-destructive" : "text-foreground"
              )}>
                {item.label}
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Profile;
