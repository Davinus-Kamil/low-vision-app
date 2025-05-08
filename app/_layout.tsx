// app/layout.tsx
import React from 'react';
import { Slot } from 'expo-router';
// import Menu from '../components/Menu';
import Header from '../components/header'; 
import Footer from '../components/footer';

const RootLayout: React.FC = () => {
  return (
    <React.Fragment>
      <Header />
      <Slot />
      {/* <Menu /> */}
      <Footer/>
    </React.Fragment>
    // asfasfasfasf
  );
};

export default RootLayout;
