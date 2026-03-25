'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Lock, UserCog } from 'lucide-react';

interface RestrictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  action?: string;
}

export function RestrictionModal({
  isOpen,
  onClose,
  title = "Access Restricted",
  description = "This operation requires Administrator privileges and is restricted to maintain system security.",
  action = "This action"
}: RestrictionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-t-4 border-t-red-500">
        <DialogHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
            <Lock className="h-8 w-8 text-red-600" />
          </div>
          <DialogTitle className="text-center text-xl font-bold">{title}</DialogTitle>
          <DialogDescription className="text-center pt-2 text-base text-zinc-600">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="sm:justify-center mt-6">
          <Button 
            type="button" 
            variant="default" 
            className="w-full sm:w-auto px-12 rounded-xl py-6 font-bold shadow-lg shadow-primary/20"
            onClick={onClose}
          >
            I Understand
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
