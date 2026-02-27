
'use client';

import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, ArrowRight, ExternalLink } from "lucide-react";

interface VerifyEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  email?: string;
}

export function VerifyEmailModal({ isOpen, onClose, email }: VerifyEmailModalProps) {
  const openGmail = () => {
    window.open('https://mail.google.com', '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border-zinc-200 shadow-2xl">
        <DialogHeader className="flex flex-col items-center justify-center text-center space-y-4 pt-6">
          <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center ring-8 ring-blue-50/50">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <div className="space-y-2">
            <DialogTitle className="text-2xl font-bold tracking-tight">Verify your email</DialogTitle>
            <DialogDescription className="text-zinc-500 text-base leading-relaxed px-4">
              We've sent a verification link to <span className="font-semibold text-foreground">{email || 'your email'}</span>. 
              Please confirm your email address to access your account.
            </DialogDescription>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 py-6">
            <div className="bg-zinc-50 p-4 rounded-xl border border-dashed border-zinc-300 mx-2">
                <p className="text-xs text-zinc-500 text-center italic">
                    Tip: Check your spam or promotions folder if you don't see the email within a couple of minutes.
                </p>
            </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 pb-6">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full sm:flex-1 h-11 border-zinc-200 hover:bg-zinc-50 font-medium"
          >
            Close
          </Button>
          <Button 
            onClick={openGmail}
            className="w-full sm:flex-1 h-11 bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all gap-2 font-medium"
          >
            Check Inbox
            <ExternalLink className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
