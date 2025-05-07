import React from "react";
import { Slot } from "expo-router";
import Header from "../components/header";
import Footer from "../components/footer";

const RootLayout: React.FC = () => {
  return (
    <>
      <Header />
      <Slot />
      <Footer />
    </>
  );
};

export default RootLayout;
