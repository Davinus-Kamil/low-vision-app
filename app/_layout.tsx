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
      <Menu />
    </React.Fragment>
    // asfasfasfasf
  );
};

export default RootLayout;
