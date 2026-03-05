"use client";

import { motion } from "framer-motion";
import { Lock, Eye, Database, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

const sections = [
  { id: "intro", title: "Introduction", icon: <Lock className="w-4 h-4" /> },
  { id: "collection", title: "Data Collection", icon: <Database className="w-4 h-4" /> },
  { id: "usage", title: "How We Use Data", icon: <Eye className="w-4 h-4" /> },
  { id: "protection", title: "Data Protection", icon: <ShieldCheck className="w-4 h-4" /> },
];

export default function PrivacyPolicyPage() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-white selection:bg-primary/10 selection:text-primary">
      {/* Hero Header */}
      <section className="bg-zinc-50 border-b border-zinc-200 pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-4">
              Privacy First
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#0B3D91] mb-6">
              Privacy <span className="text-primary">Policy</span>
            </h1>
            <p className="text-xl text-zinc-600 leading-relaxed font-medium">
              We respect your privacy and are committed to protecting any personal information shared through the FindMyID platform.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Layout */}
      <div className="container mx-auto px-4 py-20 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Sidebar Nav */}
          <aside className="hidden lg:block lg:col-span-3">
             <div className="sticky top-32 space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 px-4">Navigation</p>
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollTo(section.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-zinc-600 hover:text-primary hover:bg-zinc-50 rounded-xl transition-all text-left"
                  >
                    {section.icon}
                    {section.title}
                  </button>
                ))}
             </div>
          </aside>

          {/* Policy Text */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-9"
          >
             <div className="prose prose-zinc max-w-none space-y-16">
                
                <section id="intro" className="scroll-mt-32">
                  <h2 className="text-2xl font-bold text-zinc-900 mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400 text-sm">01</span>
                    Introduction
                  </h2>
                  <div className="text-lg text-zinc-600 leading-relaxed space-y-6">
                    <p>
                      FindMyID respects your privacy and is committed to protecting any personal information shared through the platform. This Privacy Policy explains how we collect, use, and protect information when you use the FindMyID platform.
                    </p>
                    <p>
                      By using this platform, you agree to the terms outlined in this Privacy Policy.
                    </p>
                  </div>
                </section>

                <section id="collection" className="scroll-mt-32">
                  <h2 className="text-2xl font-bold text-zinc-900 mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400 text-sm">02</span>
                    Information We Collect
                  </h2>
                  <div className="text-lg text-zinc-600 leading-relaxed space-y-6">
                    <p>
                      FindMyID may collect limited information necessary to help identify and return lost identification cards. This includes:
                    </p>
                    <ul className="grid md:grid-cols-2 gap-4 list-none pl-0">
                       {[
                         "Name on the ID card",
                         "Registration or ID number",
                         "Faculty or Department",
                         "Location & Date found"
                       ].map((item, i) => (
                         <li key={i} className="flex items-start gap-3 p-4 bg-zinc-50 rounded-2xl border border-zinc-100 text-sm font-medium">
                            <Database className="w-5 h-5 text-primary shrink-0" />
                            {item}
                         </li>
                       ))}
                    </ul>
                    <p>We only collect and display information that helps identify the owner of the card.</p>
                  </div>
                </section>

                <section id="usage" className="scroll-mt-32">
                  <h2 className="text-2xl font-bold text-zinc-900 mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400 text-sm">03</span>
                    How We Use Information
                  </h2>
                  <div className="text-lg text-zinc-600 leading-relaxed space-y-6">
                    <p>The information collected is used strictly for the purpose of:</p>
                    <ul className="space-y-4 list-none pl-0">
                       {[
                         "Helping individuals identify their lost ID cards",
                         "Connecting lost cards with their rightful owners",
                         "Maintaining a searchable database of recovered cards"
                       ].map((item, i) => (
                         <li key={i} className="flex items-center gap-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            {item}
                         </li>
                       ))}
                    </ul>
                    <div className="bg-primary/5 p-8 rounded-3xl border border-primary/10 italic text-primary font-medium text-sm">
                      "FindMyID does not use this information for marketing, advertising, or commercial purposes."
                    </div>
                  </div>
                </section>

                <section id="protection" className="scroll-mt-32 pb-20">
                  <h2 className="text-2xl font-bold text-zinc-900 mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400 text-sm">04</span>
                    Data Protection
                  </h2>
                  <div className="text-lg text-zinc-600 leading-relaxed space-y-6">
                    <p>
                      We take reasonable measures to protect the information stored on the platform. However, because the platform operates online, we cannot guarantee absolute security of all data.
                    </p>
                    <p>
                      Users are encouraged to report any concerns regarding privacy or misuse of information.
                    </p>
                  </div>
                </section>

                <section className="pt-16 border-t border-zinc-100">
                   <div className="bg-zinc-900 p-12 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-primary/10">
                      <div className="space-y-4">
                        <h3 className="text-2xl font-bold">Privacy Concerns?</h3>
                        <p className="opacity-70 max-w-sm">If you have questions about how your data is handled, please reach out.</p>
                      </div>
                      <Link href="/contact">
                        <button className="bg-primary hover:bg-primary/90 text-white font-bold py-4 px-10 rounded-2xl flex items-center gap-2 group transition-all">
                          Contact Support
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </Link>
                   </div>
                </section>

             </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
