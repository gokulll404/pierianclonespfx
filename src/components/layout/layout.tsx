import * as React from 'react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import TopNav from './components/topbar/topbar';
import MenuBar from './components/menubar/menubar';
import BottomNav from './components/bottommenu/bottommenu';
import './laout.css'

type LayoutProps = {
  children: React.ReactNode;  // ✔ Correct for SPFx
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isHome, setIsHome] = useState(false);

  useEffect(() => {
    setIsHome(location.pathname === '/');
  }, [location]);

  return (
    <div>
      <TopNav />
      {isHome && <MenuBar />}
      <div className="layout-container">
        <main>{children}</main>
      </div>
      <BottomNav />
    </div>
  );
};

export default Layout;
