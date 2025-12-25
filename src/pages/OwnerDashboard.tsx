import { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Camera,
  Edit3,
  Star,
  Calendar,
  Users,
  TrendingUp,
  DollarSign,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ownerApi } from '@/services/api';
import { Restaurant } from '@/data/mockData';
import { cn } from '@/lib/utils';

const OwnerDashboard = () => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'reservations' | 'menu' | 'photos'>('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [restaurantData, reservationsData] = await Promise.all([
        ownerApi.getMyRestaurant(),
        ownerApi.getReservations('r1')
      ]);
      setRestaurant(restaurantData);
      setReservations(reservationsData);
    } catch (error) {
      console.error('Failed to load data:', error);
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <p className="text-muted-foreground mb-4">No restaurant found</p>
        <Link to="/">
          <Button variant="gold">Back to Home</Button>
        </Link>
      </div>
    );
  }

  const stats = [
    { icon: Star, label: 'Rating', value: restaurant.rating.toString(), change: '+0.2' },
    { icon: Users, label: 'Views', value: '1.2K', change: '+12%' },
    { icon: Calendar, label: 'Bookings', value: '24', change: '+8' },
    { icon: TrendingUp, label: 'Revenue', value: 'Rs. 85K', change: '+15%' },
  ];

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
          src={restaurant.photos[0]}
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
            <span className={restaurant.isByob ? 'byob-badge' : 'no-byob-badge'}>
              {restaurant.isByob ? '🍾 BYOB' : '🍸 Bar'}
            </span>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-primary text-primary" />
              <span className="font-semibold">{restaurant.rating}</span>
              <span className="text-muted-foreground text-sm">({restaurant.reviewCount})</span>
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
          {stats.map((stat, i) => (
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
          {(['overview', 'reservations', 'menu', 'photos'] as const).map((tab) => (
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
            {reservations.map((res, i) => (
              <div
                key={res.id}
                className="glass rounded-xl p-4 flex items-center gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-foreground">{res.name}</p>
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
                    {res.date} at {res.time} • {res.guests} guests
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
            ))}
          </motion.div>
        )}

        {activeTab === 'menu' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <Button variant="gold" className="w-full gap-2">
              <Plus className="w-4 h-4" />
              Add Menu Item
            </Button>
            {restaurant.menu.map((item) => (
              <div
                key={item.id}
                className="glass rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary">Rs. {item.price}</p>
                  <p className="text-xs text-muted-foreground">{item.category}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'photos' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <Button variant="gold" className="w-full gap-2">
              <Camera className="w-4 h-4" />
              Upload Photos
            </Button>
            <div className="grid grid-cols-2 gap-2">
              {restaurant.photos.map((photo, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                  <img
                    src={photo}
                    alt={`Photo ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center">
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;
