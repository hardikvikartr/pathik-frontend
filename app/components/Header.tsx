import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import ChangePasswordModal from "./ChangePasswordModal";

interface HeaderProps {
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  collapsed: boolean;
}

export default function Header({
  toggleSidebar,
  toggleMobileMenu,
  collapsed,
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { logout, user } = useAuth();
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header
      className="fixed top-0 right-0 left-0 lg:left-[280px] bg-white px-8 py-4 shadow-sm z-999 flex justify-between items-center transition-all duration-300 h-[80px] data-[collapsed=true]:lg:left-[80px]"
      data-collapsed={collapsed}
    >
      <div className="flex items-center gap-6">
        <button
          className="lg:hidden bg-transparent border-none text-[1.5rem] text-pathik-text-dark cursor-pointer p-2 rounded-lg transition-all duration-300 hover:bg-pathik-bg-light"
          id="pathikMobileMenuToggle"
          onClick={toggleMobileMenu}
        >
          <i className="fas fa-bars"></i>
        </button>
        {collapsed && (
          <button
            className="hidden lg:flex w-[40px] h-[40px] bg-linear-to-b from-pathik-primary to-pathik-secondary border-none text-white rounded-xl items-center justify-center cursor-pointer transition-all duration-300 shadow-md text-[1.25rem] hover:scale-110 hover:shadow-lg"
            id="pathikSidebarExpandToggle"
            title="Expand Sidebar"
            onClick={toggleSidebar}
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        )}

        {/* <div className="relative w-[300px] hidden md:block">
          <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-pathik-text-light"></i>
          <input
            type="text"
            placeholder="Search..."
            className="w-full py-2.5 px-4 pl-10 border border-pathik-border rounded-xl text-[0.9rem] transition-all duration-300 bg-pathik-bg-light focus:outline-none focus:border-pathik-primary focus:bg-white focus:shadow-[0_0_0_4px_rgba(102,126,234,0.1)]"
          />
        </div> */}
      </div>

      <div className="flex items-center gap-4">
        <Link
          href={"/dashboard"}
          className="relative w-[40px] h-[40px] flex items-center justify-center rounded-xl bg-pathik-bg-light text-pathik-text-medium cursor-pointer transition-all duration-300 no-underline hover:bg-pathik-primary hover:text-white hover:-translate-y-[2px]"
          title="Notifications"
        >
          <i className="fas fa-bell"></i>
          {/* <span className="absolute -top-1 -right-1 bg-pathik-coral text-white rounded-full w-[18px] h-[18px] text-[0.7rem] flex items-center justify-center font-semibold border-2 border-white">
            3
          </span> */}
        </Link>
        {/* <Link href="#" className="relative w-[40px] h-[40px] flex items-center justify-center rounded-xl bg-pathik-bg-light text-pathik-text-medium cursor-pointer transition-all duration-300 no-underline hover:bg-pathik-primary hover:text-white hover:-translate-y-[2px]" title="Messages">
          <i className="fas fa-envelope"></i>
          <span className="absolute -top-1 -right-1 bg-pathik-coral text-white rounded-full w-[18px] h-[18px] text-[0.7rem] flex items-center justify-center font-[600] border-2 border-white">5</span>
        </Link> */}

        {/* User Dropdown */}
        <div
          className="relative flex items-center gap-3 cursor-pointer p-2 rounded-xl transition-all duration-300 hover:bg-pathik-bg-light"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          ref={dropdownRef}
        >
          <div className="w-[40px] h-[40px] rounded-full bg-linear-to-b from-pathik-primary to-pathik-secondary flex items-center justify-center text-white font-bold text-[1rem] border-2 border-pathik-border">
            {user?.name?.[0] || "H"}
          </div>
          <div className="flex-col hidden sm:flex">
            <div className="font-semibold text-pathik-text-dark text-[0.9rem]">
              {user?.name || "Hotel Pathik"}
            </div>
            <div className="text-[0.75rem] text-pathik-text-light">
              {user?.role}
            </div>
          </div>
          <i
            className={`fas fa-chevron-down ml-2 hidden sm:block text-pathik-text-light transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`}
          ></i>

          <div
            className={`absolute top-full right-0 mt-2 w-48 bg-white border border-pathik-border rounded-xl shadow-xl overflow-hidden transition-all duration-200 origin-top-right z-1000 ${dropdownOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"}`}
          >
            <ul className="list-none m-0 p-0 text-[0.9rem]">
              {user?.role === "HOTEL" && (
                <li>
                  <Link
                    href="/dashboard/profile"
                    className="block px-4 py-2.5 text-pathik-text-dark hover:bg-pathik-bg-light hover:text-pathik-primary transition-colors no-underline"
                  >
                    <i className="fas fa-user mr-2 w-5 text-center"></i> Profile
                  </Link>
                </li>
              )}
              {user?.role === "SUPER_ADMIN" && (
                <li>
                  <Link
                    href={"/dashboard/settings"}
                    className="block px-4 py-2.5 text-pathik-text-dark hover:bg-pathik-bg-light hover:text-pathik-primary transition-colors no-underline"
                  >
                    <i className="fas fa-cog mr-2 w-5 text-center"></i> Settings
                  </Link>
                </li>
              )}
              <li className="border-t border-pathik-border my-1"></li>
              <li>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    setShowChangePasswordModal(true);
                  }}
                  className="w-full text-left px-4 py-2.5 text-pathik-text-dark hover:bg-pathik-bg-light hover:text-pathik-primary transition-colors bg-transparent border-none cursor-pointer flex items-center"
                >
                  <i className="fas fa-key mr-2 w-5 text-center"></i> Change
                  Password
                </button>
              </li>
              <li className="border-t border-pathik-border my-1"></li>
              <li>
                <button 
                  onClick={logout}
                  className="block px-4 w-full text-left py-2.5 text-pathik-coral hover:bg-pathik-coral-light/10 transition-colors no-underline"
                >
                  <i className="fas fa-sign-out-alt mr-2 w-5 text-center"></i>{" "}
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />
    </header>
  );
}
