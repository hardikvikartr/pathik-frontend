"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, UserRole } from "../context/AuthContext";
import Image from "next/image";

interface SidebarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export default function Sidebar({
  collapsed,
  toggleSidebar,
  mobileOpen,
  setMobileOpen,
}: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  // Default to HOTEL if no user (should not happen due to protection, but safe fallback)
  const role = user?.role || "HOTEL";
  const isActive = (path: string) =>
    pathname === path
      ? "bg-white/20 text-white shadow-md relative after:content-[''] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:w-[3px] after:h-[60%] after:bg-pathik-gold after:rounded-l-[3px]"
      : "text-white/90 hover:bg-white/10 hover:text-white hover:translate-x-[5px]";

  const renderLink = (href: string, icon: string, label: string) => (
    <li className="my-1 mx-3">
      <Link
        href={href}
        onClick={() => setMobileOpen(false)}
        className={`flex items-center gap-4 py-3.5 px-4 no-underline rounded-xl transition-all duration-300 relative overflow-hidden group ${isActive(href)} ${collapsed ? "justify-center p-3.5" : ""}`}
      >
        <i
          className={`fas ${icon} text-[1.25rem] w-[24px] text-center shrink-0`}
        ></i>
        <span
          className={`font-medium whitespace-nowrap  transition-all duration-300 ${collapsed ? "opacity-0 w-0 overflow-hidden" : ""}`}
        >
          {label}
        </span>
        <div className="absolute top-0 -left-full w-full h-full bg-white/10 transition-[left] duration-300 group-hover:left-full"></div>
      </Link>
    </li>
  );

  return (
    <aside
      className={`fixed top-0 h-screen bg-linear-to-b from-pathik-primary to-pathik-secondary text-white z-1000 transition-all duration-300 overflow-y-auto overflow-x-hidden shadow-xl 
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} 
        ${collapsed ? "w-[80px]" : "w-[280px]"}
      `}
      id="pathikSidebar"
    >
      <div
        className={`p-6 border-b border-white/10 flex items-center min-h-[80px] ${collapsed ? "flex-col justify-center p-4" : "gap-4"}`}
      >
        <Link
          href="/dashboard"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-4 no-underline text-white ${collapsed ? "justify-center mb-2" : ""}`}
        >
          <div className="w-[50px] relative h-[50px]">
            <Image
              src="/PATHIK_LOGO.png"
              fill
              className="w-full h-full object-contain"
              alt="Pathik Logo"
            />
          </div>
          {/* <span className={`text-[1.5rem] font-bold tracking-[1px] whitespace-nowrap transition-all duration-300 ${collapsed ? "opacity-0 w-0 overflow-hidden" : ""}`}>Pathik</span> */}
        </Link>

        {/* Mobile Close Button */}
        <button
          className={`bg-white/10 border-none text-white w-[36px] h-[36px] rounded-lg items-center justify-center cursor-pointer transition-all duration-300 shrink-0 z-10 hover:bg-white/20 hover:scale-110 lg:hidden flex ${collapsed ? "mb-2" : ""}`}
          onClick={() => setMobileOpen(false)}
          title="Close Menu"
        >
          <i className="fas fa-times"></i>
        </button>

        {/* Sidebar Toggle Button */}
        <button
          className={`bg-white/10 border-none text-white w-[36px] h-[36px] rounded-lg items-center justify-center cursor-pointer transition-all duration-300 shrink-0 z-10 hover:bg-white/20 hover:scale-110 flex ${collapsed ? "w-full mb-2 mx-auto" : ""}`}
          id="pathikSidebarToggle"
          title="Toggle Sidebar"
          onClick={toggleSidebar}
        >
          <i
            className={`fas ${collapsed ? "fa-chevron-right" : "fa-chevron-left"}`}
            id="pathikSidebarToggleIcon"
          ></i>
        </button>
      </div>

      <nav className="py-4 m-0 list-none">
        <div
          className={`px-5 py-2 text-[0.75rem] uppercase tracking-[1px] text-white/60 font-semibold ${collapsed ? "hidden" : ""}`}
        >
          Main
        </div>
        <ul className="list-none p-0 m-0">
          {renderLink("/dashboard", "fa-home", "Dashboard")}
          {role === "SUPER_ADMIN" &&
            renderLink("/dashboard/notifications", "fa-bell", "Notifications")}
          {/* Super Admin Links */}
          {role === "SUPER_ADMIN" && (
            <>
              {renderLink(
                "/dashboard/police-stations",
                "fa-building-shield",
                "Police Stations",
              )}
              {renderLink("/dashboard/roles", "fa-user-tag", "Roles")}
              {renderLink("/dashboard/permissions", "fa-key", "Permissions")}
              {renderLink("/dashboard/all-guests", "fa-users", "Guests")}
              {renderLink("/dashboard/search", "fa-search", "Search")}
              {renderLink("/dashboard/hotels", "fa-hotel", "Hotels")}
              {renderLink("/dashboard/settings", "fa-cog", "Settings")}
            </>
          )}
          {(role === "SUPER_ADMIN" || role === "POLICE_STATION") &&
            renderLink("/dashboard/watchdogs", "fa-eye", "Watchdogs")}

          {/* Police Station Links */}
          {role === "POLICE_STATION" && (
            <>
              {renderLink("/dashboard/hotels", "fa-hotel", "Hotels")}
              {renderLink("/dashboard/search", "fa-search", "Search")}
            </>
          )}

          {/* Hotel Links */}
          {role === "HOTEL" && (
            <>
              {renderLink("/dashboard/hotels/rooms", "fa-door-open", "Rooms")}
              {renderLink("/dashboard/add-guest", "fa-user-plus", "Add Guest")}
              {renderLink("/dashboard/guests", "fa-users", "Guests")}
              {renderLink(
                "/dashboard/staff",
                "fa-id-badge",
                "Staff Management",
              )}
              {renderLink(
                "/dashboard/pending-checkout",
                "fa-sign-out-alt",
                "Pending Checkout",
              )}
            </>
          )}
        </ul>

        {/* Reports & Exports */}
        {/* <div
          className={`px-5 py-2 text-[0.75rem] uppercase tracking-[1px] text-white/60 font-semibold mt-4 ${collapsed ? "hidden" : ""}`}
        >
          Reports
        </div>
        <ul className="list-none p-0 m-0">
          {renderLink(
            "/dashboard/export-report",
            "fa-file-export",
            "Export Report",
          )}
        </ul> */}

        {/* Support */}
        {/* <div
          className={`px-5 py-2 text-[0.75rem] uppercase tracking-[1px] text-white/60 font-semibold mt-4 ${collapsed ? "hidden" : ""}`}
        >
          Support
        </div>
        <ul className="list-none p-0 m-0">
          {renderLink("#", "fa-book", "Guideline")}
          {renderLink("#", "fa-phone", "Contact Us")}
        </ul> */}
      </nav>
    </aside>
  );
}
