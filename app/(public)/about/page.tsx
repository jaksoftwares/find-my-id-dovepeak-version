"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function AboutPage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="bg-white min-h-screen selection:bg-primary/10 selection:text-primary">
      {/* Hero Section - Zinc background for distinction from Header */}
      <section className="relative pt-24 pb-20 bg-zinc-50 border-b border-zinc-100">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <motion.div {...fadeIn}>
            <span className="text-primary font-bold text-sm tracking-[0.2em] uppercase mb-4 block">Our Journey</span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-[#0B3D91] mb-6 leading-tight tracking-tight">
              The FindMyID Story
            </h1>
            <p className="text-xl text-zinc-600 leading-relaxed font-medium">
              A community effort born from a simple personal experience, built to help JKUAT students help each other.
            </p>
          </motion.div>
        </div>
      </section>

      {/* The "Imagine" Narrative Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
           <motion.div 
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             viewport={{ once: true }}
             className="space-y-12"
           >
              <div className="space-y-8">
                <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 leading-snug">
                  Imagine this.
                </h2>
                <div className="text-xl text-zinc-600 leading-relaxed space-y-6">
                  <p>
                    You are walking across campus after a long day of classes. Somewhere between the lecture halls, the library, and the cafeteria, your identification card slips out of your pocket.
                  </p>
                  <p className="font-medium text-zinc-900">You don't notice it immediately.</p>
                  <p>
                    Days later, you realize it is missing. Suddenly, everything becomes stressful. You need that ID for exams, services, and identification. Replacing it could take weeks, while your card might be lying unidentified in a corner of the campus.
                  </p>
                </div>

                <div className="py-12 border-y border-zinc-100 my-12">
                   <div className="flex flex-col md:flex-row gap-8 items-center text-left">
                      <div className="bg-primary/5 p-8 rounded-3xl border border-primary/10 flex-1">
                        <p className="text-2xl font-bold text-primary italic leading-tight">
                          "And it happened to me. Not once—but twice."
                        </p>
                      </div>
                      <div className="flex-1 text-zinc-600 text-lg">
                        That frustration planted a simple question in my mind: <span className="text-foreground font-bold italic">"What if there was an easier way for us to find our lost IDs within the university?"</span>
                      </div>
                   </div>
                </div>
              </div>
           </motion.div>
        </div>
      </section>

      {/* What is FindMyID - Simplified Grid without icons */}
      <section className="py-24 bg-zinc-50 border-y border-zinc-100">
        <div className="container mx-auto px-4">
           <div className="max-w-4xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-zinc-900 mb-6 font-primary">What is FindMyID?</h2>
              <p className="text-lg text-zinc-600 leading-relaxed">
                FindMyID is a bridge. Every day, IDs are found in lecture halls and hostels, but they often stay unclaimed because the owners never know where to look. We provide the platform where those details meet.
              </p>
           </div>

           <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[
                { 
                  title: "Matching System", 
                  text: "When an ID is found, details are posted so the owner can identify it instantly." 
                },
                { 
                  title: "Community Effort", 
                  text: "Built on the belief that responsibility belongs to all of us. When we work together, we solve things faster." 
                },
                { 
                  title: "Always Free", 
                  text: "This is a non-profit volunteer service. There are no charges—it is purely about helping each other." 
                },
                { 
                  title: "Clear Communication", 
                  text: "Once verified, you get clear instructions for pickup from official security spots." 
                }
              ].map((item, i) => (
                <div key={i} className="bg-white p-8 rounded-2xl border border-zinc-200">
                   <h3 className="text-xl font-bold mb-3 text-foreground">{item.title}</h3>
                   <p className="text-zinc-600 leading-relaxed">{item.text}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Meet the Creator - Refined Typography */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-4xl text-left">
           <div className="flex flex-col md:flex-row gap-16 items-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="shrink-0"
              >
                 <div className="w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-200 shadow-sm">
                    <img 
                      src="/joseph-kirika.jpg" 
                      alt="Joseph Kirika" 
                      className="w-full h-full object-cover"
                    />
                 </div>
              </motion.div>

              <div className="flex-1 space-y-6">
                 <span className="text-primary font-bold text-sm tracking-widest uppercase mb-2 block">The Person Behind</span>
                 <h2 className="text-4xl font-bold text-zinc-900">Joseph Kirika</h2>
                 <p className="text-xl text-zinc-600 leading-relaxed italic">
                   "Sometimes, solving a problem as small as helping someone recover their lost ID card can remove a lot of stress from their life."
                 </p>
                 <div className="space-y-4 text-zinc-600 text-lg">
                    <p>
                      I am a final-year Computer Science student. I believe technology should solve simple, every day problems that affect people in our community.
                    </p>
                    <p>
                      This project is my way of giving back. Beyond FindMyID, I'm passionate about building digital solutions that solve real challenges in our communities.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* My Mission - Final Block */}
      <section className="pb-32 pt-12 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="bg-primary p-12 md:p-16 rounded-3xl text-white text-center shadow-xl shadow-primary/10"
           >
              <div className="space-y-8">
                 <h2 className="text-3xl md:text-5xl font-bold">The Mission</h2>
                 <p className="text-xl md:text-2xl font-light opacity-90 leading-relaxed max-w-2xl mx-auto italic">
                    "We are one community, and responsibility belongs to all of us."
                 </p>
                 <div className="h-1 w-20 bg-white/30 mx-auto rounded-full"></div>
                 <p className="text-lg opacity-80 leading-relaxed max-w-2xl mx-auto">
                   FindMyID exists so that if you ever lose your ID, the community has your back. And if you find one, you can be the help someone else needs.
                 </p>
                 <div className="pt-8">
                   <Link href="/ids">
                      <Button size="lg" className="rounded-full bg-white text-primary hover:bg-zinc-50 px-12 h-14 text-lg font-bold">
                        Search Database
                      </Button>
                   </Link>
                 </div>
              </div>
           </motion.div>
        </div>
      </section>
    </div>
  );
}
