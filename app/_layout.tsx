// app/layout.tsx
import React from 'react';
import { Slot } from 'expo-router';
import Menu from '../components/menu';
import Header from '../components/header'; 

const RootLayout: React.FC = () => {
  return (
    <React.Fragment>
      <Header />
      <Slot />
      {/* Render the Menu at the bottom of the screen */}
      <Menu />
    </React.Fragment>
  );
};

export default RootLayout;
