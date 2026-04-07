
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="w-full bg-white border-t border-zinc-100 pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
           {/* Brand Column */}
           <div className="space-y-4">
              <Link href="/" className="flex items-center gap-2">
                 <div className="h-8 w-8 rounded-full border-2 border-primary flex items-center justify-center bg-primary/10">
                    <span className="text-primary font-bold">J</span>
                 </div>
                 <span className="text-xl font-bold tracking-tight text-foreground">
                    FindMy<span className="text-primary">ID</span>
                 </span>
              </Link>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                 A community-driven platform for JKUAT students to recover lost identification cards quickly and easily.
              </p>
           </div>
           
           {/* Links */}
           <div>
              <h4 className="font-bold text-foreground mb-6">Quick Links</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                 <li><Link href="/ids" className="hover:text-primary transition-colors">Search Found IDs</Link></li>
                 <li><Link href="/report-lost" className="hover:text-primary transition-colors">I Lost My ID</Link></li>
                 <li><Link href="/submit-found" className="hover:text-primary transition-colors">I Found an ID</Link></li>
                 <li><Link href="/forum" className="hover:text-primary transition-colors">Community Forum</Link></li>
                 <li><Link href="/dashboard" className="hover:text-primary transition-colors">User Dashboard</Link></li>
              </ul>
           </div>
           
           {/* Support */}
           <div>
              <h4 className="font-bold text-foreground mb-6">Support</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                 <li><Link href="/about" className="hover:text-primary transition-colors">About FindMyID</Link></li>
                 <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Center</Link></li>
                 <li><Link href="/faq" className="hover:text-primary transition-colors">FAQs</Link></li>
                 <li><Link href="/donations" className="hover:text-primary transition-colors">Donation</Link></li>
                  <li>
                    <a 
                      href="https://www.dovepeakdigital.com/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="hover:text-primary transition-colors"
                    >
                      The Startup
                    </a>
                  </li>
                 <li><Link href="/disclaimer" className="hover:text-primary transition-colors">Legal Disclaimer</Link></li>
                 <li><Link href="/terms" className="hover:text-primary transition-colors">Terms and Conditions</Link></li>
              </ul>
           </div>
           
           {/* Newsletter / CTA */}
           <div>
              <h4 className="font-bold text-foreground mb-6">Stay Updated</h4>
              <p className="text-muted-foreground text-sm mb-4">Help us keep the community informed. Join our forum!</p>
              <div className="flex gap-2">
                 <Button size="sm" className="rounded-md w-full" asChild>
                    <Link href="/forum">Go to Forum</Link>
                 </Button>
              </div>
           </div>
        </div>
        
        <div className="border-t border-zinc-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
           <p>&copy; <span suppressHydrationWarning>{new Date().getFullYear()}</span> FindMyID. All rights reserved.</p>
           <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-foreground transition-colors underline-offset-4 hover:underline">Privacy Policy</Link>
              <Link href="/disclaimer" className="hover:text-foreground transition-colors underline-offset-4 hover:underline">Disclaimer</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors underline-offset-4 hover:underline">Terms</Link>
           </div>
        </div>
      </div>
    </footer>
  );
}
