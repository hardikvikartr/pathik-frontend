"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Load saved state
  useEffect(() => {
    const saved = localStorage.getItem("pathikSidebarCollapsed");
    if (saved === "true") {
      setCollapsed(true);
    }
  }, []);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
    localStorage.setItem("pathikSidebarCollapsed", String(!collapsed));
  };

  const toggleMobileMenu = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      <Sidebar 
        collapsed={collapsed} 
        toggleSidebar={toggleSidebar} 
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-999 transition-opacity duration-300 lg:hidden ${mobileOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`}
        onClick={() => setMobileOpen(false)}
      ></div>

      <div className={`transition-all duration-300 min-h-screen bg-pathik-bg-light ${collapsed ? "ml-0 lg:ml-[80px]" : "ml-0 lg:ml-[280px]"}`}>
        <Header 
            toggleSidebar={toggleSidebar} 
            toggleMobileMenu={toggleMobileMenu} 
            collapsed={collapsed}
        />
        <main className="p-4 md:p-8 mt-[80px]">
          {children}
        </main>
        <footer className="p-4 text-center text-pathik-text-light text-[0.85rem]">
          {/* Footer content */}
        </footer>
      </div>
    </>
  );
}
