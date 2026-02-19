
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
                    JKUAT<span className="text-primary">findmyid</span>
                 </span>
              </Link>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                 Connecting the community through trust and technology. The fastest way to recover your lost identification documents.
              </p>
           </div>
           
           {/* Links */}
           <div>
              <h4 className="font-bold text-foreground mb-6">Quick Links</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                 <li><Link href="/ids" className="hover:text-primary transition-colors">Browse IDs</Link></li>
                 <li><Link href="/report-lost" className="hover:text-primary transition-colors">Report Lost Item</Link></li>
                 <li><Link href="/submit-found" className="hover:text-primary transition-colors">Submit Found Item</Link></li>
                 <li><Link href="/forum" className="hover:text-primary transition-colors">Community Forum</Link></li>
                 <li><Link href="/dashboard" className="hover:text-primary transition-colors">Student Dashboard</Link></li>
              </ul>
           </div>
           
           {/* Support */}
           <div>
              <h4 className="font-bold text-foreground mb-6">Support</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                 <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                 <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Center</Link></li>
                 <li><Link href="/faq" className="hover:text-primary transition-colors">FAQs</Link></li>
                 <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              </ul>
           </div>
           
           {/* Newsletter / CTA */}
           <div>
              <h4 className="font-bold text-foreground mb-6">Stay Updated</h4>
              <p className="text-muted-foreground text-sm mb-4">Subscribe to get notifications about new features.</p>
              <div className="flex gap-2">
                 <input 
                   type="email" 
                   placeholder="Enter email" 
                   className="flex-1 bg-zinc-50 border border-input rounded-md px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                 />
                 <Button size="sm" className="rounded-md">Subscribe</Button>
              </div>
           </div>
        </div>
        
        <div className="border-t border-zinc-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
           <p>&copy; {new Date().getFullYear()} JKUATfindmyid. All rights reserved.</p>
           <div className="flex gap-6">
              <Link href="#" className="hover:text-foreground">Privacy Policy</Link>
              <Link href="#" className="hover:text-foreground">Terms</Link>
              <Link href="#" className="hover:text-foreground">Cookies</Link>
           </div>
        </div>
      </div>
    </footer>
  );
}
