

import { SubmitFoundForm } from "@/components/forms/SubmitFoundForm";

export default function SubmitFoundPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">Submit Found ID</h1>
        <p className="text-muted-foreground">
          Thank you for your honesty. Please provide details of the ID you found.
        </p>
      </div>
      <SubmitFoundForm />
    </div>
  );
}
