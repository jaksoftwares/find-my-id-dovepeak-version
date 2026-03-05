
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsAndConditionsPage() {
  return (
    <div className="bg-zinc-50 min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <Card className="border-zinc-200 shadow-sm">
          <CardHeader className="border-b border-zinc-100 bg-white rounded-t-xl py-8">
            <CardTitle className="text-3xl font-bold text-[#0B3D91]">Terms and Conditions</CardTitle>
          </CardHeader>
          <CardContent className="p-8 md:p-12 space-y-8 text-zinc-700 leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">Introduction</h2>
              <p>Welcome to FindMyID.</p>
              <p>
                By accessing or using this platform, you agree to comply with and be bound by the following Terms and Conditions. If you do not agree with these terms, you should discontinue use of the platform.
              </p>
              <p>
                FindMyID is a community-based platform created to assist in the recovery of lost identification cards within the JKUAT community.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">Purpose of the Platform</h2>
              <p>
                The purpose of FindMyID is to provide a central place where details of recovered identification cards can be posted, allowing owners to identify and reclaim their cards.
              </p>
              <p>The platform serves only as an information-sharing tool.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">No Guarantee of Recovery</h2>
              <p>FindMyID does not guarantee that:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>All lost identification cards will be found</li>
                <li>All recovered cards will be listed on the platform</li>
                <li>A card listed on the platform will remain available</li>
              </ul>
              <p>The platform only increases the chances of reconnecting lost cards with their owners.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">User Responsibility</h2>
              <p>Users are responsible for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Verifying that a card belongs to them before claiming it</li>
                <li>Following proper procedures when collecting recovered cards</li>
                <li>Providing accurate information when communicating with the platform administrators</li>
              </ul>
            </section>

            <section className="space-y-4 border-t border-zinc-100 pt-8 text-red-700/80">
              <h2 className="text-xl font-bold text-foreground">Limitation of Liability</h2>
              <p>FindMyID, its creator, and volunteers shall not be held responsible for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Loss or damage resulting from use of the platform</li>
                <li>Cards that are not recovered or not listed</li>
                <li>Any misuse of the platform by users</li>
              </ul>
              <p>The platform is provided "as is" without guarantees or warranties of any kind.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">Free Community Service</h2>
              <p>
                FindMyID is provided free of charge as a community initiative. No payment is required to search, list, or recover identification cards through the platform.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">Platform Management</h2>
              <p>The administrators reserve the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Update, remove, or modify card listings</li>
                <li>Remove content that appears inaccurate or inappropriate</li>
                <li>Update the platform policies when necessary</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">Contact</h2>
              <p>
                If you have any questions regarding the Privacy Policy or Terms and Conditions, you may contact the FindMyID team through the platform.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
