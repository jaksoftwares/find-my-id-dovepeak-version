
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
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
          <Link href="/" className="hover:text-primary transition-colors data-[active=true]:text-primary" aria-current="page">
            Home
          </Link>
          <Link href="/about" className="hover:text-primary transition-colors">
            About Us
          </Link>
          <Link href="/ids" className="hover:text-primary transition-colors">
            Browse IDs
          </Link>
          <Link href="/contact" className="hover:text-primary transition-colors">
            Contact
          </Link>
          <Link href="/forum" className="hover:text-primary transition-colors">
            Community
          </Link>
        </nav>
        
        {/* CTA - Right */}
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors hidden sm:block">
            Log In
          </Link>
          <Link href="/report-lost">
            <Button className="rounded-full px-6 font-semibold shadow-md hover:shadow-lg transition-all">
              Report Lost ID
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
