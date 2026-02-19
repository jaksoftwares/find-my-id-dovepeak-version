
export default function ContactPage() {
  return (
    <div className="container mx-auto py-10 px-4 max-w-xl">
      <h1 className="text-3xl font-bold mb-6 text-[#0B3D91]">Contact Us</h1>
      <p className="mb-6 text-zinc-600">Have questions or found a bug? Reach out to us.</p>
      
      <div className="space-y-4">
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border">
          <h3 className="font-semibold text-lg">Email Support</h3>
          <p className="text-blue-600">support@jkuatfindmyid.com</p>
        </div>
        <div className="p-4 bg-zinc-50 rounded-lg border">
          <h3 className="font-semibold text-lg">University Security</h3>
          <p>Main Gate Security Office</p>
          <p className="text-zinc-500">+254 700 000 000</p>
        </div>
      </div>
    </div>
  );
}
