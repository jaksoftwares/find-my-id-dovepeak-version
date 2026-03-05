
export default function FAQPage() {
  return (
    <div className="bg-zinc-50 min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold mb-10 text-[#0B3D91] text-center">Frequently Asked Questions</h1>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
            <h3 className="text-xl font-bold mb-3 text-foreground">How do I report a lost ID?</h3>
            <p className="text-zinc-600">Simply go to the <a href="/report-lost" className="text-primary hover:underline font-medium">Lost</a> page, fill in your details and the card information. This helps us match it if someone finds it.</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
            <h3 className="text-xl font-bold mb-3 text-foreground">I found an ID, what should I do?</h3>
            <p className="text-zinc-600">Please go to <a href="/found" className="text-primary hover:underline font-medium">Found</a>, upload a photo (we'll blur sensitive info), and enter the details. You can drop it off at the security spots mentioned during submission.</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
            <h3 className="text-xl font-bold mb-3 text-foreground">Is this service free?</h3>
            <p className="text-zinc-600">Yes, FindMyID is completely free. It is a community project created to help students recover their IDs without any charges.</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
            <h3 className="text-xl font-bold mb-3 text-foreground">How do I get my ID back?</h3>
            <p className="text-zinc-600">If your ID is listed on the platform, you can submit a claim. Once approved, you will receive an email with instructions on where to pick it up from official school spots like the main gate or library.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
