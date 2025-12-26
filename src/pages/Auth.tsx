import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Wine, Mail, Lock, User, ArrowLeft, Eye, EyeOff, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type AuthMode = 'signin' | 'signup';
type UserType = 'user' | 'restaurant_owner';

const Auth = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp, loading } = useAuth();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [userType, setUserType] = useState<UserType>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      // Check if user is restaurant owner and redirect accordingly
      checkUserRole();
    }
  }, [user, loading]);

  const checkUserRole = async () => {
    if (!user) return;
    
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);
    
    const isOwner = roles?.some(r => r.role === 'restaurant_owner');
    
    if (isOwner) {
      navigate('/owner');
    } else {
      navigate('/');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === 'signup') {
        if (!name.trim()) {
          toast({
            title: "Name required",
            description: "Please enter your name to sign up.",
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }
        
        const { error } = await signUp(email, password, name);
        if (error) {
          toast({
            title: "Sign up failed",
            description: error.message,
            variant: "destructive"
          });
        } else {
          // If restaurant owner, add role
          if (userType === 'restaurant_owner') {
            const { data: { user: newUser } } = await supabase.auth.getUser();
            if (newUser) {
              await supabase.from('user_roles').insert({
                user_id: newUser.id,
                role: 'restaurant_owner'
              });
            }
          }
          
          toast({
            title: userType === 'restaurant_owner' 
              ? "Restaurant account created! 🍽️" 
              : "Welcome to DrinkWithMe! 🍷",
            description: userType === 'restaurant_owner'
              ? "You can now set up your restaurant."
              : "Your account has been created successfully."
          });
          
          if (userType === 'restaurant_owner') {
            navigate('/owner');
          } else {
            navigate('/');
          }
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Sign in failed",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Welcome back! 🥂",
            description: "You've successfully signed in."
          });
          // Role check happens in useEffect
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">
          <Wine className="w-12 h-12 text-drink-gold" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
          className="text-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-drink-gold to-drink-amber flex items-center justify-center mb-4">
            <Wine className="w-8 h-8 text-drink-dark" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">DrinkWithMe</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {mode === 'signin' ? 'Welcome back!' : 'Create your account'}
          </p>
        </motion.div>

        {/* User Type Selection (Signup only) */}
        {mode === 'signup' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-sm mb-6"
          >
            <div className="flex gap-2 p-1 rounded-xl bg-secondary">
              <button
                type="button"
                onClick={() => setUserType('user')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
                  userType === 'user'
                    ? 'bg-card text-foreground shadow'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <User className="w-4 h-4" />
                Regular User
              </button>
              <button
                type="button"
                onClick={() => setUserType('restaurant_owner')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
                  userType === 'restaurant_owner'
                    ? 'bg-card text-foreground shadow'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Store className="w-4 h-4" />
                Restaurant Owner
              </button>
            </div>
          </motion.div>
        )}

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm space-y-4"
          onSubmit={handleSubmit}
        >
          <AnimatePresence mode="wait">
            {mode === 'signup' && (
              <motion.div
                key="name"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <Label htmlFor="name" className="text-foreground">
                  {userType === 'restaurant_owner' ? 'Owner Name' : 'Name'}
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder={userType === 'restaurant_owner' ? 'Restaurant owner name' : 'Your name'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 bg-secondary border-border"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-secondary border-border"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 bg-secondary border-border"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="match"
            className="w-full mt-6"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-drink-dark border-t-transparent rounded-full animate-spin" />
            ) : (
              mode === 'signin' ? 'Sign In' : 
              userType === 'restaurant_owner' ? 'Create Restaurant Account' : 'Create Account'
            )}
          </Button>
        </motion.form>

        {/* Toggle Mode */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-center"
        >
          <p className="text-muted-foreground text-sm">
            {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
            <button
              type="button"
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              className="ml-2 text-drink-gold hover:text-drink-amber transition-colors font-medium"
            >
              {mode === 'signin' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default Auth;
