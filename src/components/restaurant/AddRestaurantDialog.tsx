import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, MapPin, Wine, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { restaurantSubmissionService } from '@/services/supabaseApi';
import { SRI_LANKA_CITIES } from '@/data/sriLankaCities';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  description: z.string().optional(),
  cuisine: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  is_byob: z.boolean().default(false),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
});

type FormValues = z.infer<typeof formSchema>;

interface AddRestaurantDialogProps {
  onSuccess?: () => void;
}

export function AddRestaurantDialog({ onSuccess }: AddRestaurantDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      address: '',
      city: '',
      description: '',
      cuisine: '',
      phone: '',
      website: '',
      is_byob: false,
      latitude: 6.9271,
      longitude: 79.8612,
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to submit a restaurant',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await restaurantSubmissionService.submit(user.id, {
        name: values.name,
        address: `${values.address}, ${values.city}`,
        latitude: values.latitude,
        longitude: values.longitude,
        is_byob: values.is_byob,
        description: values.description,
        cuisine: values.cuisine,
        phone: values.phone,
        website: values.website,
      });

      toast({
        title: 'Restaurant submitted!',
        description: 'Your restaurant is pending admin approval.',
      });

      form.reset();
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to submit restaurant:', error);
      toast({
        title: 'Submission failed',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get coordinates for selected city
  const handleCityChange = (cityValue: string) => {
    const city = SRI_LANKA_CITIES.find(c => c.value === cityValue);
    if (city) {
      form.setValue('city', city.name);
      form.setValue('latitude', city.lat);
      form.setValue('longitude', city.lng);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" />
          Add Restaurant
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Submit a Restaurant
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
            <p>Your submission will be reviewed by our team. Once approved, it will appear on the map.</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Restaurant Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="The Tipsy Elephant" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={() => (
                  <FormItem>
                    <FormLabel>City *</FormLabel>
                    <Select onValueChange={handleCityChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SRI_LANKA_CITIES.filter(c => c.value).map((city) => (
                          <SelectItem key={city.value} value={city.value}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      Street Address *
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="123 Galle Road" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about this place..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cuisine"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cuisine</FormLabel>
                      <FormControl>
                        <Input placeholder="Sri Lankan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+94 77 123 4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_byob"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Wine className="w-4 h-4 text-primary" />
                      <FormLabel className="!mt-0">BYOB Friendly</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit for Review'}
              </Button>
            </form>
          </Form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
