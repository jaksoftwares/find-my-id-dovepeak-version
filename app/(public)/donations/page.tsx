
"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ExternalLink, ShieldCheck, Heart, Coffee, Landmark } from "lucide-react";

export default function DonationsPage() {
  return (
    <div className="min-h-screen bg-white selection:bg-primary/20 selection:text-primary pb-20">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden border-b border-zinc-100">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 bg-zinc-50">
          <img 
            src="/donations-hero.png" 
            alt="Donation Background" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/80 to-white"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 max-w-3xl mx-auto"
          >
            <span className="text-primary font-bold text-sm tracking-[0.2em] uppercase mb-4 block">
              Community Support
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#0B3D91]">
              Support <span className="text-primary">findmyid</span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-600 max-w-2xl mx-auto leading-relaxed font-medium">
              A volunteer initiative created for the community. Your support helps us maintain and improve the platform.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-4xl pt-12">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-16 grid md:grid-cols-3 gap-6 text-left"
        >
          {[
            {
              title: "Free for Everyone",
              description: "The platform will always remain free for searching and reporting lost cards."
            },
            {
              title: "Infrastructure",
              description: "Donations help pay for hosting and the technology that keeps the system running."
            },
            {
              title: "Community Driven",
              description: "Every contribution directly supports the growth of this community project."
            }
          ].map((item, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
              <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-16 bg-white rounded-3xl border border-zinc-200 p-8 md:p-12 shadow-xl shadow-zinc-200/50"
        >
          <div className="max-w-xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary text-sm font-semibold mb-4">
               Secure Payment via Dovepeak
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Ready to contribute?
            </h2>
            <p className="text-muted-foreground">
              You will be redirected to our secure payment gateway at Dovepeak Digital to complete your donation.
            </p>
            <div className="pt-4">
              <a 
                href="https://payment.dovepeakdigital.com/donations" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block w-full sm:w-auto"
              >
                <Button size="lg" className="rounded-full w-full sm:w-auto px-12 h-14 text-lg font-bold shadow-lg shadow-primary/25">
                  Proceed to Donation <ExternalLink className="ml-2 h-5 w-5" />
                </Button>
              </a>
            </div>
            <p className="text-xs text-muted-foreground pt-4">
              By clicking the button above, you agree to proceed to an external payment platform.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
