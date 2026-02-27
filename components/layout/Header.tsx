'use client';

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/context/AuthContext";
import { User, LogOut, Loader2, ChevronDown, LayoutDashboard, Settings } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout, isAdmin } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setIsDropdownOpen(false);
    await logout();
    router.push('/login');
    router.refresh();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
           <div className="relative">
             <div className="h-8 w-8 rounded-full border-2 border-primary flex items-center justify-center">
                <span className="text-primary font-bold text-lg">J</span>
             </div>
             {/* Decorative dot */}
             <div className="absolute -top-1 -right-1 h-3 w-3 bg-secondary rounded-full"></div>
           </div>
          <span className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
            JKUAT<span className="text-primary">findmyid</span>
          </span>
        </Link>
        
        {/* Navigation - Centered */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link 
            href="/" 
            className={`hover:text-primary transition-colors flex flex-col items-center ${pathname === '/' ? 'text-primary' : ''}`}
          >
            Home
            {pathname === '/' && <span className="h-1 w-1 rounded-full bg-primary mt-0.5" />}
          </Link>
          <Link 
            href="/about" 
            className={`hover:text-primary transition-colors flex flex-col items-center ${pathname === '/about' ? 'text-primary' : ''}`}
          >
            About Us
            {pathname === '/about' && <span className="h-1 w-1 rounded-full bg-primary mt-0.5" />}
          </Link>
          <Link 
            href="/ids" 
            className={`hover:text-primary transition-colors flex flex-col items-center ${pathname === '/ids' ? 'text-primary' : ''}`}
          >
            Browse IDs
            {pathname === '/ids' && <span className="h-1 w-1 rounded-full bg-primary mt-0.5" />}
          </Link>
          <Link 
            href="/contact" 
            className={`hover:text-primary transition-colors flex flex-col items-center ${pathname === '/contact' ? 'text-primary' : ''}`}
          >
            Contact
            {pathname === '/contact' && <span className="h-1 w-1 rounded-full bg-primary mt-0.5" />}
          </Link>
          <Link 
            href="/forum" 
            className={`hover:text-primary transition-colors flex flex-col items-center ${pathname === '/forum' ? 'text-primary' : ''}`}
          >
            Community
            {pathname === '/forum' && <span className="h-1 w-1 rounded-full bg-primary mt-0.5" />}
          </Link>
        </nav>
        
        {/* CTA - Right */}
        <div className="flex items-center gap-4">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              {/* User Dropdown Button */}
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all"
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium hidden sm:inline">
                  {user?.full_name?.split(' ')[0] || 'User'}
                </span>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.full_name || 'User'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    {user?.role && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full capitalize">
                        {user.role}
                      </span>
                    )}
                  </div>
                  
                  <Link 
                    href="/dashboard" 
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  
                  <Link 
                    href="/dashboard/profile" 
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    My Profile
                  </Link>

                  {isAdmin && (
                    <Link 
                      href="/admin" 
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Admin Panel
                    </Link>
                  )}
                  
                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                    >
                      {isLoggingOut ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <LogOut className="h-4 w-4" />
                      )}
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors hidden sm:block">
                Log In
              </Link>
              <Link href="/report-lost">
                <Button className="rounded-full px-6 font-semibold shadow-md hover:shadow-lg transition-all">
                  Report Lost ID
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
