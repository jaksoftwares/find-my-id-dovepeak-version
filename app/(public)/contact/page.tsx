
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase/client";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Something went wrong");
      }
      
      setSubmitted(true);
    } catch (err: any) {
      console.error("Form submission error:", err);
      setError(err.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      title: "Email Us",
      description: "Send us a message anytime",
      value: "amuyunzu.joseph@students.jkuat.ac.ke",
      color: "bg-orange-100 text-orange-600"
    },
    {
      title: "Call Us",
      description: "Direct community support",
      value: "+254 714703374",
      color: "bg-purple-100 text-purple-600"
    },
    {
      title: "Recovery Points",
      description: "Official pickup locations",
      value: "Main Gate / Hall 6 / Library",
      color: "bg-orange-100 text-orange-600"
    },
    {
      title: "Available Hours",
      description: "When we're around",
      value: "Monday - Friday: 8:00 AM - 5:00 PM",
      color: "bg-purple-100 text-purple-600"
    }
  ];

  const faqItems = [
    {
      question: "How do I report a lost ID?",
      answer: "Click on 'Lost' in the navigation and fill out the form with details about your card."
    },
    {
      question: "How do I get my ID back?",
      answer: "Once your ID is identified on the platform and your claim is approved, we'll email you details on where to pick it up from official school spots."
    },
    {
      question: "Is this service free?",
      answer: "Yes, FindMyID is a completely free community service. We don't charge anything to help you recover your ID."
    }
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-zinc-50 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold text-foreground mb-2">Message Received!</h2>
            <p className="text-muted-foreground mb-6">
              Thanks for reaching out. We'll get back to you as soon as we can.
            </p>
            <Button 
              onClick={() => setSubmitted(false)}
              variant="outline"
              className="rounded-full"
            >
              Send Another Message
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Get in <span className="text-primary">Touch</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have questions or suggestions? We're here to help the community. 
              Reach out through any of the channels below.
            </p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border-zinc-200 shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">
                  Send us a Message
                </CardTitle>
                <CardDescription>
                  Drop us a line and we'll respond as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name</Label>
                      <Input 
                        id="name"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                        className="rounded-xl border-zinc-200 focus:border-primary focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email"
                        type="email"
                        placeholder="yourname@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                        className="rounded-xl border-zinc-200 focus:border-primary focus:ring-primary"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input 
                      id="subject"
                      placeholder="What is this about?"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      required
                      className="rounded-xl border-zinc-200 focus:border-primary focus:ring-primary"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message"
                      placeholder="Write your message here..."
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      required
                      className="rounded-xl border-zinc-200 focus:border-primary focus:ring-primary resize-none"
                    />
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
                      {error}
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 rounded-full h-12 text-base font-bold"
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Info & FAQ */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-6"
          >
            {/* Contact Info Cards */}
            <div className="grid sm:grid-cols-2 gap-4">
              {contactInfo.map((item, index) => (
                <Card key={index} className="border-zinc-100 shadow-sm hover:shadow-md transition-shadow rounded-2xl">
                  <CardContent className="pt-6">
                    <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mb-1">{item.description}</p>
                    <p className="font-medium text-primary break-all">{item.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* FAQ Section */}
            <Card className="border-zinc-100 shadow-sm rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Common Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {faqItems.map((item, index) => (
                  <div key={index} className="border-b border-zinc-50 last:border-0 pb-4 last:pb-0">
                    <h4 className="font-bold text-foreground mb-2">{item.question}</h4>
                    <p className="text-sm text-muted-foreground">{item.answer}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
