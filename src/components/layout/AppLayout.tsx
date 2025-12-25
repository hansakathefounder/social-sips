import { ReactNode } from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

interface AppLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showNav?: boolean;
  headerTitle?: string;
  headerRightAction?: ReactNode;
  showLogo?: boolean;
}

export const AppLayout = ({
  children,
  showHeader = true,
  showNav = true,
  headerTitle,
  headerRightAction,
  showLogo = true,
}: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {showHeader && (
        <Header 
          title={headerTitle} 
          showLogo={showLogo}
          rightAction={headerRightAction}
        />
      )}
      <main className={`${showNav ? 'pb-20' : ''}`}>
        {children}
      </main>
      {showNav && <BottomNav />}
    </div>
  );
};
