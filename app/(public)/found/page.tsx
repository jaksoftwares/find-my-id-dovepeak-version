"use client";

import { SubmitFoundForm } from "@/components/forms/SubmitFoundForm";
import { motion } from "framer-motion";
import { HandHeart, Camera, ShieldCheck, Info, FileQuestion, CheckCircle2 } from "lucide-react";

const steps = [
  {
    icon: <HandHeart className="h-6 w-6 text-primary" />,
    title: "1. Post Details",
    description: "Provide the card specifics so the owner can recognize it.",
  },
  {
    icon: <Camera className="h-6 w-6 text-secondary" />,
    title: "2. Document",
    description: "Accurate details help us match the ID to its owner faster.",
  },
  {
    icon: <CheckCircle2 className="h-6 w-6 text-primary" />,
    title: "3. Secure Return",
    description: "Once verified, you'll get instructions for the security drop-off.",
  },
];

const faqs = [
  {
    question: "Where do I drop the ID?",
    answer: "Wait for a match confirmation. We will then email you the specific security spot to drop it off.",
  },
  {
    question: "Is my privacy protected?",
    answer: "Yes. Your contact details are only shared with the administrator for verification purposes.",
  },
  {
    question: "What if it's not a student ID?",
    answer: "We accept National IDs, Passports, and ATM cards found within the JKUAT campus.",
  },
];

export default function FoundPage() {
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
                <HandHeart className="mr-1.5 h-3.5 w-3.5" />
                Volunteer Effort
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#0B3D91] mb-4">
                Found an ID Card? <br className="hidden md:block"/>
                <span className="text-primary">Be the Help Someone Needs.</span>
              </h1>
              <p className="text-lg text-zinc-600 leading-relaxed font-medium">
                Thank you for your honesty. Reporting a found ID here is the fastest way to reconnect a student with their lost property.
              </p>
            </div>
            
            <div className="hidden md:grid grid-cols-1 gap-4 w-full max-w-sm mt-8 md:mt-0">
               {steps.map((step, i) => (
                 <div key={i} className="flex items-start gap-4 p-4 rounded-3xl bg-zinc-50 border border-zinc-100 shadow-sm transition-all hover:border-primary/20">
                   <div className="mt-1">{step.icon}</div>
                   <div>
                     <h3 className="font-bold text-sm text-zinc-900">{step.title}</h3>
                     <p className="text-xs text-zinc-500">{step.description}</p>
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
              <h2 className="text-2xl font-bold text-zinc-900 mb-2 flex items-center">
                <Camera className="mr-2 h-6 w-6 text-primary" />
                Submit Found Details
              </h2>
              <p className="text-zinc-600">
                Please provide the exact details from the card so the matching system can work its magic.
              </p>
            </div>
            
            <div className="bg-white p-2 rounded-3xl shadow-sm border border-zinc-100">
              <SubmitFoundForm />
            </div>
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
              <h3 className="text-xl font-bold text-zinc-900 mb-6 flex items-center">
                <Info className="mr-2 h-5 w-5 text-secondary" />
                Helpful Tips
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <p className="text-sm text-zinc-600">
                    Enter the <strong>Full Name</strong> and <strong>ID Number</strong> exactly as they appear on the card.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <p className="text-sm text-zinc-600">
                    Mention exactly <strong>where you found it</strong> (e.g., Gate B, Assembly Hall) in the description.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <p className="text-sm text-zinc-600">
                    Hold on to the card securely. You'll receive an email once we have a verified owner match.
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
              <h3 className="text-xl font-bold text-zinc-900 mb-6 flex items-center">
                <FileQuestion className="mr-2 h-5 w-5 text-primary" />
                Common Questions
              </h3>
              <div className="space-y-6">
                {faqs.map((faq, i) => (
                  <div key={i}>
                    <h4 className="font-bold text-sm text-zinc-900 mb-1">{faq.question}</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed font-medium">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Community Message */}
            <div className="bg-zinc-900 p-8 rounded-[2rem] text-white">
               <p className="text-sm opacity-80 mb-4 italic">"True community is built on the small acts of kindness we do for one another."</p>
               <div className="h-px w-full bg-white/10 mb-4"></div>
               <p className="text-xs font-bold uppercase tracking-wider text-primary">FindMyID Volunteer Protocol</p>
            </div>
          </aside>
          
        </div>
      </div>
    </div>
  );
}
