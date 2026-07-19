import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';

const StorefrontLayout = () => {
  return (
    <div className="App flex flex-col min-h-screen relative">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default StorefrontLayout;
