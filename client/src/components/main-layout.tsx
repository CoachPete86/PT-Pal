import React from "react";
import { Layout } from "./layout";
import Navbar from "./navbar";
import Footer from "./footer";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </Layout>
  );
}