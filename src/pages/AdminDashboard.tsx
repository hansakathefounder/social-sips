import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Check, X, Clock, Building2, MapPin, Wine, Eye, RefreshCw } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { adminService, DbRestaurantWithStatus } from '@/services/supabaseApi';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [restaurants, setRestaurants] = useState<DbRestaurantWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('pending');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: 'approve' | 'reject';
    restaurant: DbRestaurantWithStatus | null;
  }>({ open: false, action: 'approve', restaurant: null });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      checkAdminRole();
    }
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      loadRestaurants();
    }
  }, [isAdmin, selectedTab]);

  const checkAdminRole = async () => {
    if (!user) return;
    try {
      const hasAdmin = await adminService.hasAdminRole(user.id);
      setIsAdmin(hasAdmin);
      if (!hasAdmin) {
        toast({
          title: 'Access Denied',
          description: 'You do not have admin privileges',
          variant: 'destructive',
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Failed to check admin role:', error);
      navigate('/');
    }
  };

  const loadRestaurants = async () => {
    setLoading(true);
    try {
      const data = await adminService.getRestaurantsByStatus(
        selectedTab as 'pending' | 'approved' | 'rejected'
      );
      setRestaurants(data);
    } catch (error) {
      console.error('Failed to load restaurants:', error);
      toast({
        title: 'Failed to load',
        description: 'Could not load restaurants',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!confirmDialog.restaurant || !user) return;

    try {
      if (confirmDialog.action === 'approve') {
        await adminService.approveRestaurant(confirmDialog.restaurant.id, user.id);
        toast({ title: 'Restaurant approved!' });
      } else {
        await adminService.rejectRestaurant(confirmDialog.restaurant.id, user.id);
        toast({ title: 'Restaurant rejected' });
      }
      loadRestaurants();
    } catch (error) {
      console.error('Action failed:', error);
      toast({
        title: 'Action failed',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setConfirmDialog({ open: false, action: 'approve', restaurant: null });
    }
  };

  if (authLoading || isAdmin === null) {
    return (
      <AppLayout>
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppLayout>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20"><Check className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20"><X className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return null;
    }
  };

  const counts = {
    pending: restaurants.filter(r => r.status === 'pending').length,
    approved: restaurants.filter(r => r.status === 'approved').length,
    rejected: restaurants.filter(r => r.status === 'rejected').length,
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground text-sm">Manage restaurant submissions</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={loadRestaurants} className="gap-1.5">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </motion.div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="pending" className="gap-1.5">
              <Clock className="w-4 h-4" />
              Pending
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-1.5">
              <Check className="w-4 h-4" />
              Approved
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-1.5">
              <X className="w-4 h-4" />
              Rejected
            </TabsTrigger>
          </TabsList>

          {['pending', 'approved', 'rejected'].map((status) => (
            <TabsContent key={status} value={status} className="space-y-4 mt-4">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              ) : restaurants.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No {status} restaurants</p>
                  </CardContent>
                </Card>
              ) : (
                restaurants.map((restaurant, index) => (
                  <motion.div
                    key={restaurant.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="flex items-center gap-2">
                              {restaurant.name}
                              {restaurant.is_byob && (
                                <Badge variant="secondary" className="text-xs">
                                  <Wine className="w-3 h-3 mr-1" />
                                  BYOB
                                </Badge>
                              )}
                            </CardTitle>
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <MapPin className="w-3.5 h-3.5" />
                              {restaurant.address}
                            </div>
                          </div>
                          {getStatusBadge(restaurant.status)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {restaurant.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {restaurant.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {restaurant.cuisine && (
                            <span className="px-2 py-1 rounded-full bg-muted">{restaurant.cuisine}</span>
                          )}
                          {restaurant.phone && (
                            <span className="px-2 py-1 rounded-full bg-muted">{restaurant.phone}</span>
                          )}
                          <span className="px-2 py-1 rounded-full bg-muted">
                            Submitted: {new Date(restaurant.submitted_at || restaurant.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                            className="gap-1.5"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </Button>

                          {status === 'pending' && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => setConfirmDialog({ open: true, action: 'approve', restaurant })}
                                className="gap-1.5 bg-green-600 hover:bg-green-700"
                              >
                                <Check className="w-4 h-4" />
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setConfirmDialog({ open: true, action: 'reject', restaurant })}
                                className="gap-1.5"
                              >
                                <X className="w-4 h-4" />
                                Reject
                              </Button>
                            </>
                          )}

                          {status === 'rejected' && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => setConfirmDialog({ open: true, action: 'approve', restaurant })}
                              className="gap-1.5 bg-green-600 hover:bg-green-700"
                            >
                              <Check className="w-4 h-4" />
                              Approve
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>

        <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {confirmDialog.action === 'approve' ? 'Approve Restaurant' : 'Reject Restaurant'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {confirmDialog.action === 'approve'
                  ? `Are you sure you want to approve "${confirmDialog.restaurant?.name}"? It will become publicly visible.`
                  : `Are you sure you want to reject "${confirmDialog.restaurant?.name}"? It will remain hidden from public.`
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleAction}
                className={confirmDialog.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                {confirmDialog.action === 'approve' ? 'Approve' : 'Reject'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
