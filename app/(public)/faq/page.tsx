"use client";

import { motion } from "framer-motion";
import { HelpCircle, MessageSquare, ShieldCheck, Heart, ArrowRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Link from "next/link";

const faqCategories = [
  {
    title: "General",
    questions: [
      {
        q: "What is FindMyID?",
        a: "FindMyID is a students-led volunteer initiative designed to help the JKUAT community recover lost identification cards quickly through a simple, centralized digital platform."
      },
      {
        q: "Is this service official or affiliated with the university?",
        a: "FindMyID is a community-driven volunteer project. While we work to coordinate with official security points for ID drop-offs and pick-ups, the platform itself is independent and non-profit."
      },
      {
        q: "Is there a fee to use the platform?",
        a: "Absolutely not. FindMyID is and will always be completely free for all students. There are no charges for searching, reporting, or recovering your ID."
      }
    ]
  },
  {
    title: "Lost & Found Process",
    questions: [
      {
        q: "How do I report a lost ID?",
        a: "Go to the 'Lost' page and fill out the report form. Provide your registration number and any unique identifiers. Our system will notify you as soon as a potential match is found."
      },
      {
        q: "I found an ID, where should I drop it?",
        a: "First, report the found ID on our 'Found' page. Once our team verifies the details, we will email you with instructions on the specific official security point (like the Library, Hall 6, or Main Gate) where you should drop it off."
      },
      {
        q: "How do I claim my card?",
        a: "Search for your ID in our database. If you find it, click 'Claim Card'. You will need to provide proof of identity during the physical collection at the designated security spot."
      }
    ]
  },
  {
    title: "Security & Privacy",
    questions: [
      {
        q: "How is my personal information protected?",
        a: "We take privacy seriously. Your contact details are only visible to the system administrators and are used solely for the purpose of coordinating the return of your ID card."
      },
      {
        q: "What types of IDs can I report?",
        a: "You can report Student IDs, National IDs, Passports, and ATM cards found within the university campus."
      }
    ]
  }
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-zinc-50/50">
      {/* Hero Section */}
      <section className="bg-white border-b border-zinc-200 pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-12"
          >
            <div className="md:max-w-2xl">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-4">
                <HelpCircle className="mr-1.5 h-3.5 w-3.5" />
                Help Center
              </span>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-[#0B3D91] mb-6">
                Frequently <br className="hidden md:block"/>
                <span className="text-primary">Asked Questions.</span>
              </h1>
              <p className="text-xl text-zinc-600 leading-relaxed font-medium">
                Everything you need to know about how FindMyID works and how we help the JKUAT community.
              </p>
            </div>
            
            <div className="hidden lg:block relative shrink-0">
               <div className="w-64 h-64 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
                  <HelpCircle className="h-32 w-32 text-primary opacity-20" />
               </div>
               {/* Decorative floating dots */}
               <div className="absolute top-0 right-0 h-4 w-4 bg-secondary rounded-full animate-bounce"></div>
               <div className="absolute bottom-4 left-0 h-3 w-3 bg-primary rounded-full animate-pulse"></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Left Column: Accordion */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-8"
          >
            <div className="space-y-12">
               {faqCategories.map((category, idx) => (
                 <div key={idx}>
                    <h2 className="text-2xl font-bold text-zinc-900 mb-6 border-l-4 border-primary pl-4">
                      {category.title}
                    </h2>
                    <Accordion type="single" collapsible className="w-full space-y-4">
                      {category.questions.map((item, i) => (
                        <AccordionItem 
                          key={i} 
                          value={`item-${idx}-${i}`}
                          className="bg-white px-6 rounded-2xl border border-zinc-200 shadow-sm overflow-hidden"
                        >
                          <AccordionTrigger className="text-lg font-bold text-zinc-800 hover:text-primary hover:no-underline py-6">
                            {item.q}
                          </AccordionTrigger>
                          <AccordionContent className="text-zinc-600 leading-relaxed pb-6 text-base">
                            {item.a}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                 </div>
               ))}
            </div>
          </motion.div>

          {/* Right Column: Information & Contact */}
          <aside className="lg:col-span-4 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-zinc-900 p-10 rounded-[2.5rem] text-white shadow-xl"
            >
              <h3 className="text-2xl font-bold mb-6 flex items-center">
                <MessageSquare className="mr-3 h-6 w-6 text-primary" />
                Still confused?
              </h3>
              <p className="opacity-80 mb-8 leading-relaxed">
                Our support team is always ready to assist you if you can't find the answer you're looking for.
              </p>
              <Link href="/contact" className="block">
                <button className="w-full bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group">
                  Contact Support
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white p-10 rounded-[2.5rem] border border-zinc-200 shadow-sm"
            >
              <h3 className="text-xl font-bold text-zinc-900 mb-4 flex items-center">
                <Heart className="mr-3 h-6 w-6 text-primary" />
                The Mission
              </h3>
              <p className="text-zinc-600 leading-relaxed italic">
                "FindMyID started as a small student project with a big goal: to leverage technology to solve everyday campus problems. We believe in the power of student solidarity."
              </p>
            </motion.div>

            <div className="p-8 border-2 border-dashed border-zinc-200 rounded-3xl text-center">
               <ShieldCheck className="h-10 w-10 text-zinc-200 mx-auto mb-4" />
               <p className="text-sm font-medium text-zinc-500 uppercase tracking-widest">Secure & Verified</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
