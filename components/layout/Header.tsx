'use client';

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/context/AuthContext";
import { User, LogOut, Loader2, ChevronDown, LayoutDashboard, Settings, Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout, isAdmin } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLButtonElement>(null);
  const mobileMenuContainerRef = useRef<HTMLDivElement>(null);

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
      
      // Check if the click is outside BOTH the trigger button AND the mobile menu container
      if (
        mobileMenuRef.current && 
        !mobileMenuRef.current.contains(event.target as Node) &&
        mobileMenuContainerRef.current && 
        !mobileMenuContainerRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Story', href: '/about' },
    { name: 'Find ID', href: '/ids' },
    { name: 'Lost', href: '/report-lost' },
    { name: 'Found', href: '/found' },
    { name: 'Contact', href: '/contact' },
    { name: 'Forum', href: '/forum' },
    { name: 'Donations', href: '/donations' },
  ];

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
            FindMy<span className="text-primary">ID</span>
          </span>
        </Link>
        
        {/* Navigation - Centered */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          {navLinks.map((link) => (
            <Link 
              key={link.href}
              href={link.href} 
              className={`hover:text-primary transition-colors flex flex-col items-center ${pathname === link.href ? 'text-primary' : ''}`}
            >
              {link.name}
              {pathname === link.href && <span className="h-1 w-1 rounded-full bg-primary mt-0.5" />}
            </Link>
          ))}
        </nav>
        
        {/* CTA - Right */}
        <div className="flex items-center gap-2">
          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-full lg:hidden text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
            ref={mobileMenuRef}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          <div className="flex items-center gap-4">
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
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

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.full_name || 'User'}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    
                    <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsDropdownOpen(false)}>
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                    
                    <Link href="/dashboard/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsDropdownOpen(false)}>
                      <User className="h-4 w-4" />
                      My Profile
                    </Link>

                    {isAdmin && (
                      <Link href="/admin" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsDropdownOpen(false)}>
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
                        {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
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
                <Link href="/register" className="hidden sm:block">
                  <Button variant="ghost" className="text-sm font-medium hover:text-primary hover:bg-primary/5 rounded-full px-4">
                    Sign Up
                  </Button>
                </Link>
                <Link href="/report-lost">
                  <Button className="rounded-full px-4 sm:px-6 font-semibold shadow-md hover:shadow-lg transition-all text-xs sm:text-sm">
                    Report Lost
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          ref={mobileMenuContainerRef}
          className="lg:hidden absolute top-20 left-0 w-full bg-white border-b border-gray-100 shadow-xl z-40 animate-in fade-in slide-in-from-top-4"
        >
          <nav className="flex flex-col p-6 gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-lg font-semibold px-4 py-2 rounded-lg transition-colors ${
                  pathname === link.href 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-zinc-50 hover:text-primary"
                }`}
              >
                {link.name}
              </Link>
            ))}
            {isAuthenticated && (
              <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-gray-100">
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-lg font-semibold px-4 py-2 rounded-lg text-muted-foreground hover:bg-zinc-50 hover:text-primary transition-colors"
                >
                  <LayoutDashboard className="h-5 w-5" />
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-lg font-semibold px-4 py-2 rounded-lg text-muted-foreground hover:bg-zinc-50 hover:text-primary transition-colors"
                >
                  <User className="h-5 w-5" />
                  My Profile
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-lg font-semibold px-4 py-2 rounded-lg text-muted-foreground hover:bg-zinc-50 hover:text-primary transition-colors"
                  >
                    <Settings className="h-5 w-5" />
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-3 text-lg font-semibold px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </div>
            )}
            {!isAuthenticated && (
              <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-gray-100">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg font-semibold px-4 py-2 text-muted-foreground hover:text-primary rounded-lg transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4"
                >
                  <Button className="w-full rounded-xl h-12 text-lg font-bold shadow-lg shadow-primary/20">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
