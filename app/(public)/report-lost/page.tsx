"use client";

import { ReportLostForm } from "@/components/forms/ReportLostForm";
import { motion } from "framer-motion";
import { ClipboardList, Search, BellRing, ShieldCheck, Info, FileQuestion } from "lucide-react";

const steps = [
  {
    icon: <ClipboardList className="h-6 w-6 text-primary" />,
    title: "1. Submit Report",
    description: "Provide details about your lost item, including unique identifiers.",
  },
  {
    icon: <Search className="h-6 w-6 text-secondary" />,
    title: "2. Automatic Matching",
    description: "Our system constantly scans newly found items against your report.",
  },
  {
    icon: <BellRing className="h-6 w-6 text-primary" />,
    title: "3. Get Notified",
    description: "Receive an instant email and SMS alert as soon as your ID is found.",
  },
];

const faqs = [
  {
    question: "What items can I report?",
    answer: "You can report any official identification document including National IDs, Student IDs, Passports, Driving Licenses, and ATM cards.",
  },
  {
    question: "Is there a fee for reporting?",
    answer: "No, reporting a lost ID is completely free for all JKUAT students and staff members.",
  },
  {
    question: "How long does it take?",
    answer: "If your ID has already been found and verified, you might get a match immediately. Otherwise, we'll notify you the moment it's turned in.",
  },
];

export default function ReportLostPage() {
  return (
    <div className="min-h-screen bg-zinc-50/50">
      {/* Page Header / Hero */}
      <section className="bg-white border-b border-zinc-200 pt-16 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center md:text-left md:flex items-center justify-between gap-12"
          >
            <div className="md:max-w-2xl">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-4">
                <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                Secure Document Recovery
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
                Lost Your ID? <br className="hidden md:block"/>
                <span className="text-primary">We're Here to Help.</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Report your lost identification document today. JKUATfindmyid bridges the gap between those who've lost their IDs and those who've found them.
              </p>
            </div>
            
            <div className="hidden md:grid grid-cols-1 gap-4 w-full max-w-sm mt-8 md:mt-0">
               {steps.map((step, i) => (
                 <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-zinc-50 border border-zinc-100 shadow-sm">
                   <div className="mt-1">{step.icon}</div>
                   <div>
                     <h3 className="font-bold text-sm text-foreground">{step.title}</h3>
                     <p className="text-xs text-muted-foreground">{step.description}</p>
                   </div>
                 </div>
               ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Form */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-7"
          >
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center">
                <ClipboardList className="mr-2 h-6 w-6 text-primary" />
                Fill the Lost ID Report
              </h2>
              <p className="text-muted-foreground">
                Please provide as much detail as possible to increase the chances of a successful match.
              </p>
            </div>
            
            <ReportLostForm />
          </motion.div>

          {/* Right Column: Tips & Info */}
          <aside className="lg:col-span-5 space-y-8 mt-10 md:mt-0">
            {/* Quick Tips */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-200"
            >
              <h3 className="text-xl font-bold text-foreground mb-6 flex items-center">
                <Info className="mr-2 h-5 w-5 text-secondary" />
                Helpful Tips
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Ensure your <strong>Registration/Serial number</strong> is 100% accurate. This is our primary matching criteria.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Describe any <strong>distinguishing marks</strong> (e.g., specific ID holder, stickers, or slight damage) in the description.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Check your email and dashboard regularly for status updates.
                  </p>
                </li>
              </ul>
            </motion.div>

            {/* FAQs */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-primary/5 p-8 rounded-2xl border border-primary/10"
            >
              <h3 className="text-xl font-bold text-foreground mb-6 flex items-center">
                <FileQuestion className="mr-2 h-5 w-5 text-primary" />
                Frequently Asked
              </h3>
              <div className="space-y-6">
                {faqs.map((faq, i) => (
                  <div key={i}>
                    <h4 className="font-bold text-sm text-foreground mb-1">{faq.question}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Contact Support */}
            <div className="text-center p-6 border-2 border-dashed border-zinc-200 rounded-2xl">
               <p className="text-sm text-muted-foreground mb-3">Still have questions?</p>
               <a href="/contact" className="text-primary font-bold hover:underline">Contact Support</a>
            </div>
          </aside>
          
        </div>
      </div>
      
      {/* Decorative background element */}
      <div className="fixed bottom-0 right-0 -z-10 opacity-5 pointer-events-none translate-x-1/4 translate-y-1/4">
        <svg width="400" height="400" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="0.5" fill="none" className="text-primary" />
          <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="0.5" fill="none" className="text-secondary" />
        </svg>
      </div>
    </div>
  );
}
