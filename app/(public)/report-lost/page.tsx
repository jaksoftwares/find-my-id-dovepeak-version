"use client";

import { ReportLostForm } from "@/components/forms/ReportLostForm";
import { motion } from "framer-motion";

const steps = [
  {
    title: "1. Report it",
    description: "Provide details about your card so we can help identify it.",
  },
  {
    title: "2. We Match it",
    description: "Our team checks newly found cards against your report.",
  },
  {
    title: "3. Get Email",
    description: "Receive an email once your ID is recovered and approved.",
  },
];

const faqs = [
  {
    question: "What items can I report?",
    answer: "You can report official IDs like Student IDs, National IDs, Passports, and ATM cards.",
  },
  {
    question: "Is there a fee?",
    answer: "No, this is a completely free service for the community.",
  },
  {
    question: "How do I get it back?",
    answer: "Once a match is approved, we will email you the exact pickup location on campus.",
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
              
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
                Lost Your ID? <br className="hidden md:block"/>
                <span className="text-primary">The community will help you find it.</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Report your lost identification card. FindMyID helps students recover lost IDs through a community effort.
              </p>
            </div>
            
            <div className="hidden md:grid grid-cols-1 gap-4 w-full max-w-sm mt-8 md:mt-0">
               {steps.map((step, i) => (
                 <div key={i} className="flex items-start gap-4 p-4 rounded-3xl bg-zinc-50 border border-zinc-100 shadow-sm">
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
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Lost ID Report
              </h2>
              <p className="text-muted-foreground">
                Please provide details to help us identify your card when it is found.
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
              className="bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-200"
            >
              <h3 className="text-xl font-bold text-foreground mb-6">
                Helpful Tips
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Double check your <strong>ID or Registration number</strong>. It is the main way we find matches.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Describe any <strong>unique details</strong> (stickers, case color, or slight marks) in the description.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Check your email and dashboard for updates on your report.
                  </p>
                </li>
              </ul>
            </motion.div>

            {/* FAQs */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-primary/5 p-8 rounded-[2rem] border border-primary/10"
            >
              <h3 className="text-xl font-bold text-foreground mb-6">
                Common Questions
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
