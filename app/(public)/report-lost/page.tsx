

import { ReportLostForm } from "@/components/forms/ReportLostForm";

export default function ReportLostPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">Report Lost ID</h1>
        <p className="text-muted-foreground">
          Fill out the details below so we can notify you if your ID is found.
        </p>
      </div>
      <ReportLostForm />
    </div>
  );
}
