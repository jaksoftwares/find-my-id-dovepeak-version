'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, ExternalLink, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { resendVerification } from "@/app/lib/authService";
import { motion, AnimatePresence } from "framer-motion";

interface VerifyEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  email?: string;
}

export function VerifyEmailModal({ isOpen, onClose, email }: VerifyEmailModalProps) {
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const openProvider = (provider: 'gmail' | 'outlook' | 'yahoo') => {
    const urls = {
      gmail: 'https://mail.google.com',
      outlook: 'https://outlook.live.com',
      yahoo: 'https://mail.yahoo.com'
    };
    window.open(urls[provider], '_blank');
  };

  const handleResend = async () => {
    if (!email || isResending) return;
    
    setIsResending(true);
    setResendStatus('idle');
    
    try {
      const result = await resendVerification(email);
      if (result.success) {
        setResendStatus('success');
        setTimeout(() => setResendStatus('idle'), 5000);
      } else {
        setResendStatus('error');
        setErrorMessage(result.message || 'Failed to resend email');
      }
    } catch (err) {
      setResendStatus('error');
      setErrorMessage('An unexpected error occurred');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border-zinc-200 shadow-2xl p-0 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
        
        <div className="p-8">
          <DialogHeader className="flex flex-col items-center justify-center text-center space-y-4">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="h-20 w-20 bg-primary/5 rounded-3xl flex items-center justify-center ring-8 ring-primary/5 mb-2"
            >
              <Mail className="h-10 w-10 text-primary" />
            </motion.div>
            
            <div className="space-y-2">
              <DialogTitle className="text-3xl font-extrabold tracking-tight text-[#0B3D91]">Verify your email</DialogTitle>
              <DialogDescription className="text-zinc-500 text-lg leading-relaxed">
                We've sent a verification link to <br />
                <span className="font-bold text-foreground text-primary break-all">{email || 'your email'}</span>
              </DialogDescription>
            </div>
          </DialogHeader>
          
          <div className="space-y-6 py-8">
            <div className="grid grid-cols-1 gap-3">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest text-center mb-1">Quick Access</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => openProvider('gmail')}
                  className="rounded-full hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                >
                  Gmail
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => openProvider('outlook')}
                  className="rounded-full hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                >
                  Outlook
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => openProvider('yahoo')}
                  className="rounded-full hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200"
                >
                  Yahoo
                </Button>
              </div>
            </div>

            <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 relative overflow-hidden group">
              <div className="relative z-10 flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-primary">!</span>
                </div>
                <p className="text-sm text-zinc-600 leading-snug">
                  If you don't see the email, please check your <span className="font-bold">Spam</span> or <span className="font-bold">Promotions</span> folder.
                </p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {resendStatus === 'success' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 p-3 bg-green-50 text-green-700 text-sm rounded-xl border border-green-100"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Email resent successfully!
                </motion.div>
              )}
              {resendStatus === 'error' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100"
                >
                  <AlertCircle className="h-4 w-4" />
                  {errorMessage}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={onClose}
              className="w-full h-12 bg-[#0B3D91] hover:bg-[#0B3D91]/90 text-white rounded-xl font-bold shadow-lg shadow-blue-900/10"
            >
              I'll check later
            </Button>
            
            <button 
              onClick={handleResend}
              disabled={isResending}
              className="text-sm font-semibold text-primary hover:underline flex items-center justify-center gap-2 py-2 disabled:opacity-50"
            >
              {isResending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Resend verification email
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
