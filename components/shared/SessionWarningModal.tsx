'use client';

import React, { useEffect, useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Timer, AlertTriangle, ShieldCheck } from "lucide-react";

interface SessionWarningModalProps {
  isOpen: boolean;
  onStayLoggedIn: () => void;
  onLogout: () => void;
  expiryTimeLeft: number; // in seconds
}

export function SessionWarningModal({ 
  isOpen, 
  onStayLoggedIn, 
  onLogout, 
  expiryTimeLeft 
}: SessionWarningModalProps) {
  const [timeLeft, setTimeLeft] = useState(expiryTimeLeft);

  useEffect(() => {
    setTimeLeft(expiryTimeLeft);
  }, [expiryTimeLeft]);

  useEffect(() => {
    if (!isOpen) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onStayLoggedIn()}>
      <DialogContent className="sm:max-w-md border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-900">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900 mb-4">
            <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <DialogTitle className="text-center text-xl font-bold text-amber-900 dark:text-amber-100">
            Session Expiring Soon
          </DialogTitle>
          <DialogDescription className="text-center text-amber-800 dark:text-amber-300 pt-2">
            Your session is about to expire due to inactivity. For your security, you will be automatically logged out in:
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-6">
          <div className="flex items-center gap-3 text-4xl font-mono font-bold text-amber-600 dark:text-amber-400">
            <Timer className="h-8 w-8 animate-pulse" />
            {formatTime(timeLeft)}
          </div>
        </div>

        <DialogFooter className="flex sm:justify-center gap-3">
          <Button 
            variant="outline" 
            onClick={onLogout}
            className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:text-amber-300"
          >
            Logout Now
          </Button>
          <Button 
            onClick={onStayLoggedIn}
            className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-200 dark:shadow-none"
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            Stay Signed In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
