import './header.css';
import { useState } from 'react';
import SideBarWrapper from '../SideBar/SideBarWrapper';

export default function Header() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <header className="header">
      {/* Hamburger Menu */}
      <div className="hamburger" role="button" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
      </div>

      {/* Website Name */}
      <div className="website-name">
        <h1>ArabFoodMarket</h1>
      </div>

       {/* Logo Image */}
      <img src="/images/dallah.png" alt="dallah" className="logo-image" />



      {/* Sidebar (wrapped to conditionally show logged in / out) */}
      <SideBarWrapper sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Dark overlay */}
      {sidebarOpen && <div className="overlay open" onClick={() => setSidebarOpen(false)}></div>}
    </header>
  );
}
