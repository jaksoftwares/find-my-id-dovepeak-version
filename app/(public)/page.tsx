
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Search, ArrowRight, ShieldCheck, MapPin, Smile } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set("query", searchQuery);
    if (selectedCategory !== "all") params.set("id_type", selectedCategory);
    router.push(`/ids?${params.toString()}`);
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    const params = new URLSearchParams();
    if (searchQuery) params.set("query", searchQuery);
    if (category !== "all") params.set("id_type", category);
    router.push(`/ids?${params.toString()}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white  overflow-hidden selection:bg-primary/20 selection:text-primary">
      
      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-32 md:pt-32 md:pb-48 text-center overflow-hidden">
        {/* Decorative Background Elements */}
        {/* Purple Star/Sparkle (Top Left-ish) */}
        <motion.div 
           initial={{ opacity: 0, scale: 0 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 1, delay: 0.2 }}
           className="absolute top-20 left-[10%] md:left-[20%] text-secondary opacity-80"
        >
           <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 md:w-16 md:h-16">
              <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
           </svg>
        </motion.div>
        
        {/* Striped Box (Top Right-ish) */}
        <motion.div 
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 1, delay: 0.4 }}
           className="absolute top-24 right-[5%] md:right-[15%] opacity-60 pointer-events-none"
        >
            <div className="w-16 h-16 md:w-24 md:h-24 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] bg-contain">
               {/* Using SVG mainly for the specific diagonal lines look */}
               <svg viewBox="0 0 100 100" className="w-full h-full stroke-primary stroke-2 fill-none">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <line key={i} x1={i * 10} y1="0" x2="0" y2={i * 10} transform="translate(10,10)" /> 
                  ))}
                   {/* Simplified visual representation of the striped box */}
                   <rect width="10" height="40" x="10" y="0" fill="#E96B35" transform="rotate(45)" opacity="0.2"/>
                   <rect width="10" height="40" x="30" y="0" fill="#B89CFF" transform="rotate(45)" opacity="0.2"/>
               </svg>
            </div>
        </motion.div>

        {/* Wavy Lines (Bottom Left-ish) */}
        <motion.div 
           className="absolute bottom-10 left-[15%] text-secondary opacity-50 hidden md:block"
           animate={{ y: [0, 10, 0] }}
           transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        >
           <svg width="40" height="80" viewBox="0 0 40 80" fill="none" stroke="currentColor" strokeWidth="2">
               <path d="M10 0 C 30 10, 30 30, 10 40 C 30 50, 30 70, 10 80" />
               <path d="M25 0 C 45 10, 45 30, 25 40 C 45 50, 45 70, 25 80" />
           </svg>
        </motion.div>


        <div className="container mx-auto max-w-4xl relative z-10">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-semibold tracking-widest text-muted-foreground uppercase mb-4"
          >
            We transform lost into found
          </motion.p>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6 leading-tight"
          >
            Reclaim Your Identity <br className="hidden md:block"/>
            <span className="relative inline-block">
              With Confidence
              {/* Underline decoration */}
              <span className="absolute bottom-2 left-0 w-full h-3 bg-secondary/30 -z-10 rounded-sm"></span>
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            The official JKUAT community platform. Report lost IDs, browse found items, and reconnect with your property securely and efficiently.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
             <Link href="/ids">
               <Button className="rounded-full h-12 px-8 text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
                 Browse Found IDs
               </Button>
             </Link>
             <Link href="/report-lost">
               <Button variant="outline" className="rounded-full h-12 px-8 text-base border-2 hover:bg-primary/5">
                 Report Lost Item
               </Button>
             </Link>
          </motion.div>
        </div>
      </section>

      {/* Search Section - Floating Card */}
      <section className="container mx-auto px-4 -mt-16 md:-mt-24 relative z-20 mb-20">
         <motion.div 
           initial={{ y: 40, opacity: 0 }}
           whileInView={{ y: 0, opacity: 1 }}
           viewport={{ once: true }}
           className="bg-white rounded-2xl shadow-xl border border-zinc-100 p-8 md:p-10 max-w-3xl mx-auto"
         >
             <form onSubmit={handleSearch}>
               <div className="flex flex-col md:flex-row gap-4">
                 <div className="flex-1 relative">
                   <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                   <Input 
                     placeholder="Search by ID Number, Name, or Serial..." 
                     className="pl-12 h-12 rounded-lg border-zinc-200 focus:border-primary focus:ring-primary/20 text-base"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                   />
                 </div>
                 <Button type="submit" size="lg" className="h-12 px-8 rounded-lg">
                   Search Now
                 </Button>
               </div>
             </form>
             
             {/* Category Filters */}
             <div className="mt-4 flex flex-wrap gap-2 justify-center">
               {[
                 { value: "all", label: "All" },
                 { value: "student_id", label: "Student ID" },
                 { value: "national_id", label: "National ID" },
                 { value: "passport", label: "Passport" },
                 { value: "atm_card", label: "ATM Card" },
                 { value: "nhif", label: "NHIF" },
                 { value: "driving_license", label: "Driving License" },
               ].map((cat) => (
                 <button
                   key={cat.value}
                   type="button"
                   onClick={() => handleCategoryClick(cat.value)}
                   className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                     selectedCategory === cat.value
                       ? "bg-primary text-white"
                       : "bg-zinc-100 text-zinc-600 hover:bg-primary/10 hover:text-primary"
                   }`}
                 >
                   {cat.label}
                 </button>
               ))}
             </div>

             <p className="text-center mt-4 text-sm text-muted-foreground">
               Popular searches: <span 
                 className="text-primary cursor-pointer hover:underline" 
                 onClick={() => handleCategoryClick("student_id")}>Student ID</span>, <span 
                 className="text-primary cursor-pointer hover:underline"
                 onClick={() => handleCategoryClick("national_id")}>National ID</span>, <span 
                 className="text-primary cursor-pointer hover:underline"
                 onClick={() => handleCategoryClick("atm_card")}>ATM Card</span>
             </p>
         </motion.div>
      </section>

      {/* Services/Features Section - Minimal Grid */}
      <section className="py-20 bg-zinc-50/50 /50">
        <div className="container mx-auto px-4">
           <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-secondary font-bold text-sm tracking-widest uppercase">Why Choose Us</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4 text-foreground">Effortless & Secure Recovery</h2>
              <div className="h-1 w-20 bg-primary mx-auto rounded-full"></div>
           </div>
           
           <div className="grid md:grid-cols-3 gap-10">
              {[
                { 
                  icon: <ShieldCheck className="h-8 w-8 text-primary" />, 
                  title: "Verified Listings", 
                  desc: "Every found ID is verified by our administration team before being listed publicly." 
                },
                { 
                  icon: <MapPin className="h-8 w-8 text-secondary" />, 
                  title: "Centralized Pickup", 
                  desc: "Collected items are securely stored at the main security office for easy retrieval." 
                },
                { 
                  icon: <Smile className="h-8 w-8 text-primary" />, 
                  title: "Community First", 
                  desc: "Built by students, for students. A trusted platform fostering accountability." 
                }
              ].map((feature, i) => (
                <div key={i} className="bg-white p-8 rounded-xl shadow-sm border border-zinc-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                   <div className="w-16 h-16 rounded-2xl bg-zinc-50 flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                      {feature.icon}
                   </div>
                   <h3 className="text-xl font-bold mb-3 text-foreground">{feature.title}</h3>
                   <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                   <div className="mt-6 flex items-center text-primary font-medium text-sm cursor-pointer group-hover:gap-2 transition-all">
                      Learn more <ArrowRight className="ml-1 h-4 w-4" />
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>
      
      {/* Visual Break / Divider */}
      <div className="w-full h-2 bg-gradient-to-r from-transparent via-secondary to-transparent opacity-30"></div>

    </div>
  );
}
