
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Search, ArrowRight, ShieldCheck, MapPin, Smile, MessageSquare, Heart, HelpCircle, CheckCircle2, User, ExternalLink, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import { useIds } from "@/hooks/useIds";
import { Suspense } from "react";

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const router = useRouter();
  const { ids, loading: idsLoading } = useIds();
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
    <div className="flex flex-col min-h-screen bg-white bg-gradient-to-b from-white to-zinc-50/30 overflow-hidden selection:bg-primary/20 selection:text-primary">
      
      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-32 md:pt-32 md:pb-48 text-center overflow-hidden">
        {/* Subtle Mesh Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(184,156,255,0.1),rgba(255,255,255,0))] pointer-events-none"></div>
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
            Recover Your Lost ID <br className="hidden md:block"/>
            <span className="relative inline-block">
              Easily and For Free
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
            A simple community platform for JKUAT students to recover lost identification cards. Search our database of found IDs and reconnect with your property.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
             <Link href="/ids">
               <Button className="rounded-full h-12 px-8 text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
                 Search Found IDs
               </Button>
             </Link>
             <Link href="/report-lost">
               <Button variant="outline" className="rounded-full h-12 px-8 text-base border-2 hover:bg-primary/5">
                 I Lost My ID
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
                     placeholder="Search by ID Number or Name..." 
                     className="pl-12 h-12 rounded-lg border-zinc-200 focus:border-primary focus:ring-primary/20 text-base"
                     value={searchQuery}
                     onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                   />
                 </div>
                 <Button type="submit" size="lg" className="h-12 px-8 rounded-lg">
                   Check Now
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
         </motion.div>
      </section>

      {/* Meet the Creator Section - First after Hero */}
      <section className="py-24 bg-zinc-50/50 border-t border-zinc-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12 max-w-5xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative shrink-0"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200">
                 <img 
                    src="/joseph-kirika.jpg" 
                    alt="Joseph Kirika" 
                    className="w-full h-full object-cover"
                 />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex-1 text-center lg:text-left"
            >
              <h2 className="text-3xl font-bold text-foreground mb-4">Hi, I'm Joseph Kirika</h2>
              <p className="text-lg text-zinc-600 mb-6 leading-relaxed italic">
                "Imagine walking across campus and realizing your ID is gone. I've been there twice, and that's why I built FindMyID—a volunteer project to help us recover lost cards easily through technology."
              </p>
              <Link href="/about">
                <Button variant="outline" className="rounded-full px-8">
                  Read my full story
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="w-full h-px bg-zinc-100"></div>

      {/* Services/Features Section - Minimal Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
           <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-zinc-900 mb-4">How FindMyID works</h2>
              <p className="text-zinc-600">A community effort to help students find their lost identification cards.</p>
           </div>
           
            <div className="grid md:grid-cols-3 gap-10">
               {[
                 { 
                   icon: <ShieldCheck className="h-8 w-8 text-primary" />, 
                   title: "Volunteer Effort", 
                   desc: "Our team and community volunteers collect found ID details and post them here to help you." 
                 },
                 { 
                   icon: <MapPin className="h-8 w-8 text-secondary" />, 
                   title: "Official Collection Points", 
                   desc: "Once identified and approved, you will be emailed details on where to pick your ID from official school spots." 
                 },
                 { 
                   icon: <Smile className="h-8 w-8 text-primary" />, 
                   title: "Completely Free", 
                   desc: "This is a non-profit community service. There are no charges to search for or recover your ID card." 
                 }
               ].map((feature, i) => (
                 <motion.div 
                   key={i} 
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: i * 0.1 }}
                   className="bg-white p-8 rounded-xl shadow-sm border border-zinc-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
                 >
                    <div className="w-16 h-16 rounded-2xl bg-zinc-50 flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                       {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                 </motion.div>
               ))}
            </div>
        </div>
      </section>

      <section className="py-20 bg-zinc-50 border-y border-zinc-100">
        <div className="container mx-auto px-4">
           <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div className="max-w-xl text-left">
                 <h2 className="text-3xl font-bold text-zinc-900">Recent Cards</h2>
                 <p className="text-zinc-600 mt-2">
                    Here are the latest identification cards that have been reported found by fellow students.
                 </p>
              </div>
              <Link href="/ids">
                <Button variant="outline" className="rounded-full px-6">
                  View all cards
                </Button>
              </Link>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {idsLoading ? (
                 [1, 2, 3, 4].map((i) => (
                   <div key={i} className="h-[320px] bg-zinc-50 animate-pulse rounded-2xl border border-zinc-100"></div>
                 ))
              ) : ids.length > 0 ? (
                ids.slice(0, 4).map((id, i) => (
                  <motion.div 
                    key={id.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="group bg-zinc-50/50 rounded-2xl border border-zinc-100 overflow-hidden hover:shadow-xl transition-all duration-500"
                  >
                    <div className="aspect-[4/3] bg-zinc-200 relative overflow-hidden">
                       <img 
                          src={id.image_url || '/images/id-placeholder.png'} 
                          alt={id.full_name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 blur-[2px] group-hover:blur-0"
                       />
                       <div className="absolute top-3 right-3">
                          <div className="bg-white/90 backdrop-blur px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-primary">
                             {id.id_type.replace('_', ' ')}
                          </div>
                       </div>
                    </div>
                    <div className="p-5">
                       <h3 className="font-bold text-foreground truncate capitalize">{id.full_name}</h3>
                       <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 text-secondary" />
                          <span className="truncate">{id.location_found}</span>
                       </div>
                       <Button 
                         variant="link" 
                         className="p-0 h-auto mt-4 text-xs font-bold text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                         asChild
                       >
                         <Link href={`/ids?query=${id.full_name}`}>
                            Claim Process <ArrowRight className="h-3 w-3" />
                         </Link>
                       </Button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                   <p className="text-muted-foreground">No recent IDs found. Check the full database.</p>
                </div>
              )}
           </div>
        </div>
      </section>
      
      {/* Visual Break / Divider */}
      <div className="w-full h-px bg-zinc-100"></div>


      {/* Community & FAQ Section */}
      <section className="py-20 bg-zinc-50 border-y border-zinc-100">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold text-foreground mb-6">Common Questions</h2>
              <Accordion type="single" collapsible className="w-full space-y-3">
                {[
                  {
                    q: "Is this affiliated with the school?",
                    a: "No. This is a volunteer initiative created by a student for the community."
                  },
                  {
                    q: "How do I pick up my card?",
                    a: "Once a claim is approved, you will receive an email with instructions on where to pick up your card from official school security spots."
                  },
                  {
                    q: "Are there any charges?",
                    a: "No. FindMyID is completely free for all students."
                  }
                ].map((item, i) => (
                  <AccordionItem key={i} value={`item-${i}`} className="border-none bg-white rounded-xl px-4 border border-zinc-200">
                    <AccordionTrigger className="hover:no-underline py-4 text-left font-semibold text-zinc-900">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 text-zinc-600">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col justify-center"
            >
              <h2 className="text-2xl font-bold text-foreground mb-4">Join the Community</h2>
              <p className="text-muted-foreground mb-8 text-lg">
                Our forum is a place where we help each other and share suggestions to make campus life easier. 
              </p>
              <div className="flex gap-4">
                <Link href="/forum">
                  <Button className="rounded-full px-8 h-12 bg-primary">
                    Go to Forum
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-white text-center">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
              Let's find your lost card.
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
               <Link href="/ids">
                 <Button size="lg" className="rounded-full px-12 h-14 text-lg font-bold">
                   Search Database
                 </Button>
               </Link>
               <Link href="/report-lost">
                 <Button size="lg" variant="outline" className="rounded-full px-12 h-14 text-lg font-bold">
                   Report Lost
                 </Button>
               </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
