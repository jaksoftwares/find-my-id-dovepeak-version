
export default function FAQPage() {
  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8 text-[#0B3D91]">Frequently Asked Questions</h1>
      
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h3 className="text-xl font-semibold mb-2">How do I report a lost ID?</h3>
          <p className="text-zinc-600 dark:text-zinc-400">Simply go to the "Report Lost" page, fill in your details and the ID details. This helps us match it if someone finds it.</p>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-xl font-semibold mb-2">I found an ID, what should I do?</h3>
          <p className="text-muted-foreground">Please go to "Submit Found", upload a photo (we'll blur sensitive info), and enter the details. You can drop it off at the security desk listed.</p>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-xl font-semibold mb-2">Is this service free?</h3>
          <p className="text-muted-foreground">Yes, JKUATfindmyid is completely free for all students and staff.</p>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-xl font-semibold mb-2">How do I get my ID back?</h3>
          <p className="text-muted-foreground">If your ID is listed as "Found", you can claim it through the portal. You will be directed on where to collect it, usually the main security office.</p>
        </div>
      </div>
    </div>
  );
}
