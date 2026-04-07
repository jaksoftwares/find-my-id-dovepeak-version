"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const sections = [
  { id: "intro", title: "Introduction" },
  { id: "purpose", title: "Purpose" },
  { id: "liability", title: "Liability" },
  { id: "responsibility", title: "Responsibility" },
];

export default function TermsAndConditionsPage() {
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
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#0B3D91] mb-6">
              Terms & <span className="text-primary">Conditions</span>
            </h1>
            <p className="text-xl text-zinc-600 leading-relaxed font-medium">
              Please read these terms carefully. They define how we operate and your responsibilities as a user of the FindMyID community platform.
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
                      Welcome to FindMyID. By accessing or using this platform, you agree to comply with and be bound by the following Terms and Conditions. If you do not agree with these terms, you should discontinue use of the platform.
                    </p>
                    <p>
                      FindMyID is a community-based platform created to assist in the recovery of lost identification cards within the JKUAT community.
                    </p>
                  </div>
                </section>

                <section id="purpose" className="scroll-mt-32">
                  <h2 className="text-2xl font-bold text-zinc-900 mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400 text-sm">02</span>
                    Purpose of the Platform
                  </h2>
                  <div className="text-lg text-zinc-600 leading-relaxed space-y-6">
                    <p>
                      The purpose of FindMyID is to provide a central place where details of recovered identification cards can be posted, allowing owners to identify and reclaim their cards.
                    </p>
                    <div className="bg-primary/5 p-8 rounded-3xl border border-primary/10 italic text-primary font-medium">
                      "The platform serves only as an information-sharing tool and a bridge between students."
                    </div>
                  </div>
                </section>

                <section id="liability" className="scroll-mt-32">
                  <h2 className="text-2xl font-bold text-zinc-900 mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400 text-sm">03</span>
                    Limitation of Liability
                  </h2>
                  <div className="text-lg text-zinc-600 leading-relaxed space-y-6">
                    <p>FindMyID, its creator, and volunteers shall not be held responsible for:</p>
                    <ul className="grid md:grid-cols-2 gap-4 list-none pl-0">
                       {[
                         "Loss or damage resulting from use of the platform",
                         "Cards that are not recovered or not listed",
                         "Any misuse of the platform by users",
                         "Verification errors during the return process"
                       ].map((item, i) => (
                         <li key={i} className="flex items-start gap-3 p-4 bg-zinc-50 rounded-2xl border border-zinc-100 text-sm">
                            {item}
                         </li>
                       ))}
                    </ul>
                    <p className="text-sm font-bold text-zinc-800 italic pt-4">
                      The platform is provided "as is" without guarantees or warranties of any kind.
                    </p>
                  </div>
                </section>

                <section id="responsibility" className="scroll-mt-32 pb-20">
                  <h2 className="text-2xl font-bold text-zinc-900 mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400 text-sm">04</span>
                    User Responsibility
                  </h2>
                  <div className="text-lg text-zinc-600 leading-relaxed space-y-6">
                    <p>As a community member using FindMyID, you are responsible for:</p>
                    <ul className="space-y-4 list-none pl-0">
                       {[
                         "Verifying that a card belongs to you before claiming it",
                         "Following proper security procedures when collecting cards",
                         "Providing accurate information in your reports",
                         "Maintaining respectful behavior within the community forum"
                       ].map((item, i) => (
                         <li key={i} className="flex items-center gap-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            {item}
                         </li>
                       ))}
                    </ul>
                  </div>
                </section>

                <section className="pt-16 border-t border-zinc-100">
                   <div className="bg-zinc-900 p-12 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-primary/10">
                      <div className="space-y-4">
                        <h3 className="text-2xl font-bold">Have Questions?</h3>
                        <p className="opacity-70 max-w-sm">If you need clarification on these terms, our support team is ready to help.</p>
                      </div>
                      <Button asChild className="bg-primary hover:bg-primary/90 text-white font-bold py-4 px-10 rounded-2xl flex items-center group transition-all h-auto">
                        <Link href="/contact">
                          Contact Support
                        </Link>
                      </Button>
                   </div>
                </section>
             </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
