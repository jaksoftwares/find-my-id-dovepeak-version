
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorDisplayProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
  variant?: "inline" | "full";
}

export function ErrorDisplay({ 
  message = "Something went wrong. Please try again.", 
  onRetry, 
  className,
  variant = "full"
}: ErrorDisplayProps) {
  
  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg", className)}>
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
        <p className="flex-1">{message}</p>
        {onRetry && (
          <Button variant="ghost" size="sm" onClick={onRetry} className="h-auto p-1 text-red-700 hover:text-red-800 hover:bg-red-100">
            Retry
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-red-200 bg-red-50/50", className)}>
      <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <AlertCircle className="h-6 w-6 text-red-600" />
      </div>
      <h3 className="text-lg font-semibold text-red-900 mb-2">Something went wrong</h3>
      <p className="text-sm text-red-600 max-w-sm mb-6 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button 
          variant="outline" 
          onClick={onRetry}
          className="bg-white border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}
