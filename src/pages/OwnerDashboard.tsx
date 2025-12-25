import { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Camera,
  Edit3,
  Star,
  Calendar,
  Users,
  TrendingUp,
  Plus,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ownerService, DbRestaurant } from '@/services/supabaseApi';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Reservation {
  id: string;
  date: string;
  time: string;
  party_size: number;
  status: string;
  notes: string | null;
  user_id: string;
}

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [restaurant, setRestaurant] = useState<DbRestaurant | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'reservations' | 'create'>('overview');
  
  // Create restaurant form
  const [newRestaurant, setNewRestaurant] = useState({
    name: '',
    address: '',
    latitude: 6.9271,
    longitude: 79.8612,
    is_byob: false,
    description: '',
    cuisine: '',
    phone: ''
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    if (user) {
      loadData();
    }
  }, [user, authLoading, navigate]);

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const restaurantData = await ownerService.getMyRestaurant(user.id);
      setRestaurant(restaurantData);
      
      if (restaurantData) {
        const reservationsData = await ownerService.getReservations(restaurantData.id);
        setReservations(reservationsData as Reservation[]);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: "Error",
        description: "Failed to load restaurant data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!newRestaurant.name.trim() || !newRestaurant.address.trim()) {
      toast({
        title: "Missing fields",
        description: "Name and address are required",
        variant: "destructive"
      });
      return;
    }
    
    setCreating(true);
    try {
      // Assign owner role first
      await ownerService.assignOwnerRole(user.id);
      
      // Create the restaurant
      const created = await ownerService.createRestaurant(user.id, newRestaurant);
      setRestaurant(created);
      setActiveTab('overview');
      toast({
        title: "Restaurant created! 🎉",
        description: "Your restaurant is now live on DrinkWithMe"
      });
    } catch (error: any) {
      console.error('Failed to create restaurant:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create restaurant",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  // No restaurant - show create form
  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background pb-8">
        <header className="glass-strong border-b border-border/50">
          <div className="flex items-center justify-between h-14 px-4">
            <Link to="/">
              <Button variant="ghost" size="icon-sm">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="font-display font-semibold">Create Your Restaurant</h1>
            <div className="w-9" />
          </div>
        </header>

        <div className="px-4 py-6 max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground">
                List Your Restaurant
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Get discovered by people looking for great drinking spots
              </p>
            </div>

            <form onSubmit={handleCreateRestaurant} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Restaurant Name *</Label>
                <Input
                  id="name"
                  value={newRestaurant.name}
                  onChange={(e) => setNewRestaurant(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Your restaurant name"
                  className="bg-secondary"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={newRestaurant.address}
                  onChange={(e) => setNewRestaurant(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="123 Main St, Colombo"
                  className="bg-secondary"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cuisine">Cuisine Type</Label>
                <Input
                  id="cuisine"
                  value={newRestaurant.cuisine}
                  onChange={(e) => setNewRestaurant(prev => ({ ...prev, cuisine: e.target.value }))}
                  placeholder="Sri Lankan, Italian, etc."
                  className="bg-secondary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={newRestaurant.phone}
                  onChange={(e) => setNewRestaurant(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+94 77 123 4567"
                  className="bg-secondary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newRestaurant.description}
                  onChange={(e) => setNewRestaurant(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Tell people about your place..."
                  className="bg-secondary"
                />
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                <input
                  type="checkbox"
                  id="byob"
                  checked={newRestaurant.is_byob}
                  onChange={(e) => setNewRestaurant(prev => ({ ...prev, is_byob: e.target.checked }))}
                  className="w-4 h-4 rounded border-border"
                />
                <label htmlFor="byob" className="text-sm font-medium">
                  🍾 BYOB Allowed
                </label>
              </div>

              <Button
                type="submit"
                variant="gold"
                className="w-full mt-6"
                disabled={creating}
              >
                {creating ? (
                  <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Create Restaurant'
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    );
  }

  const stats = [
    { icon: Star, label: 'Rating', value: restaurant.rating?.toString() || '0', change: '+0.2' },
    { icon: Users, label: 'Views', value: '1.2K', change: '+12%' },
    { icon: Calendar, label: 'Bookings', value: reservations.length.toString(), change: '+8' },
    { icon: TrendingUp, label: 'Revenue', value: 'Rs. 85K', change: '+15%' },
  ];

  const defaultPhoto = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800';

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="glass-strong border-b border-border/50">
        <div className="flex items-center justify-between h-14 px-4">
          <Link to="/">
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="font-display font-semibold">Restaurant Dashboard</h1>
          <Button variant="ghost" size="icon-sm">
            <Edit3 className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Restaurant Header */}
      <div className="relative h-40">
        <img
          src={restaurant.photos?.[0] || defaultPhoto}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <button className="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg glass flex items-center gap-2 text-sm">
          <Camera className="w-4 h-4" />
          Edit Cover
        </button>
      </div>

      <div className="px-4 -mt-8 relative z-10">
        {/* Restaurant Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-4 mb-4"
        >
          <div className="flex items-start justify-between mb-2">
            <span className={restaurant.is_byob ? 'byob-badge' : 'no-byob-badge'}>
              {restaurant.is_byob ? '🍾 BYOB' : '🍸 Bar'}
            </span>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-primary text-primary" />
              <span className="font-semibold">{restaurant.rating || 0}</span>
              <span className="text-muted-foreground text-sm">({restaurant.review_count || 0})</span>
            </div>
          </div>
          <h2 className="font-display text-xl font-bold text-foreground mb-1">
            {restaurant.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            {restaurant.address}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-3 mb-6"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-xl font-bold text-foreground">
                  {stat.value}
                </span>
                <span className="text-xs text-drink-green font-medium">
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-secondary mb-4 overflow-x-auto">
          {(['overview', 'reservations'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize whitespace-nowrap",
                activeTab === tab
                  ? "bg-card text-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Quick Actions */}
            <div className="glass rounded-xl p-4">
              <h3 className="font-semibold text-foreground mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="justify-start gap-2">
                  <Plus className="w-4 h-4" />
                  Add Menu Item
                </Button>
                <Button variant="outline" className="justify-start gap-2">
                  <Camera className="w-4 h-4" />
                  Add Photos
                </Button>
                <Button variant="outline" className="justify-start gap-2">
                  <Clock className="w-4 h-4" />
                  Update Hours
                </Button>
                <Button variant="outline" className="justify-start gap-2">
                  <Edit3 className="w-4 h-4" />
                  Edit Details
                </Button>
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="glass rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">Recent Reviews</h3>
                <button className="text-sm text-primary">View All</button>
              </div>
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="p-3 rounded-lg bg-card/50 border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-secondary" />
                      <div>
                        <p className="text-sm font-medium">Guest {i}</p>
                        <div className="flex">
                          {[1,2,3,4,5].map((s) => (
                            <Star key={s} className="w-3 h-3 fill-primary text-primary" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      "Great ambiance and excellent service. Will definitely come back!"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'reservations' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {reservations.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display font-semibold text-foreground mb-2">
                  No reservations yet
                </h3>
                <p className="text-sm text-muted-foreground">
                  Reservations will appear here when customers book
                </p>
              </div>
            ) : (
              reservations.map((res) => (
                <div
                  key={res.id}
                  className="glass rounded-xl p-4 flex items-center gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-foreground">
                        Guest
                      </p>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        res.status === 'confirmed' 
                          ? "bg-drink-green/20 text-drink-green"
                          : "bg-drink-amber/20 text-drink-amber"
                      )}>
                        {res.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {res.date} at {res.time} • {res.party_size} guests
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon-sm" className="text-drink-green">
                      <CheckCircle2 className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="text-destructive">
                      <XCircle className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;