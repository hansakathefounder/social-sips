import { Bell, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  title?: string;
  showLogo?: boolean;
  rightAction?: React.ReactNode;
}

export const Header = ({ title, showLogo = true, rightAction }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-40 glass-strong border-b border-border/50">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        {showLogo ? (
          <Link to="/" className="flex items-center gap-2">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center">
                <span className="text-lg">🍷</span>
              </div>
              <div className="absolute -inset-1 rounded-xl bg-primary/20 blur-md -z-10" />
            </div>
            <span className="font-display font-bold text-lg text-gradient-gold">
              DrinkWithMe
            </span>
          </Link>
        ) : (
          <h1 className="font-display font-semibold text-lg text-foreground">
            {title}
          </h1>
        )}

        <div className="flex items-center gap-2">
          {rightAction || (
            <>
              <Button variant="ghost" size="icon-sm" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-drink-red" />
              </Button>
              <Link to="/settings">
                <Button variant="ghost" size="icon-sm">
                  <Settings className="w-5 h-5" />
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
