
"use client";

import { motion } from "framer-motion";
import { ShieldAlert, AlertTriangle, Scale, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function DisclaimerPage() {
  return (
    <div className="bg-zinc-50 min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="h-8 w-8 text-orange-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
            Legal <span className="text-orange-600">Disclaimer</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            Important information about our community effort and limits of liability.
          </p>
        </motion.div>

        <div className="grid gap-8">
          {/* Main Statement */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-orange-100 bg-orange-50/30 overflow-hidden rounded-3xl">
              <CardContent className="p-8 md:p-10">
                <div className="flex items-start gap-5">
                  <div className="hidden md:flex shrink-0 w-12 h-12 rounded-full bg-orange-100 items-center justify-center text-orange-600">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-4">Not a Business</h2>
                    <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                      FindMyID is <span className="text-foreground font-bold underline decoration-orange-300">not a business</span>. It is purely a volunteer effort by a student to help fellow students recover their lost identification documents. 
                      This service is free, and it will stay free.
                    </p>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      It is a community-driven initiative and is not affiliated with any official institutional security department or administration. 
                      While we strive to facilitate the recovery of lost identification documents, FindMyID does not store, possess, or guarantee the safety of any physical items.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Points Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="h-full border-zinc-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
                    <Info className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold mb-3">Service Scope</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    The platform serves solely as a matching and notification service. Users are responsible for verifying the identity of individuals during the exchange of items. 
                    Official collections should only be conducted at designated public and official security spots on campus.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="h-full border-zinc-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-4">
                    <Scale className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold mb-3">Liability Limits</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    FindMyID is not liable for any loss, theft, or damage to property, nor for any disputes arising from the use of this platform. This service is provided 
                    'as is' without any warranties, express or implied.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Safety Reminder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white border text-center p-10 rounded-3xl"
          >
            <h3 className="text-xl font-bold mb-3">Safety First</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-4">
              Proceed with caution and prioritize your safety at all times. By using FindMyID, you acknowledge and agree to these terms.
            </p>
            <div className="h-1 w-20 bg-orange-400 mx-auto rounded-full" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
