
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-zinc-50 min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <Card className="border-zinc-200 shadow-sm">
          <CardHeader className="border-b border-zinc-100 bg-white rounded-t-xl py-8">
            <CardTitle className="text-3xl font-bold text-[#0B3D91]">Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="p-8 md:p-12 space-y-8 text-zinc-700 leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">Introduction</h2>
              <p>
                FindMyID respects your privacy and is committed to protecting any personal information shared through the platform. This Privacy Policy explains how we collect, use, and protect information when you use the FindMyID platform.
              </p>
              <p>
                FindMyID is a community-based service created to help members of the JKUAT community increase their chances of recovering lost identification cards.
              </p>
              <p>
                By using this platform, you agree to the terms outlined in this Privacy Policy.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">Information We Collect</h2>
              <p>
                FindMyID may collect limited information necessary to help identify and return lost identification cards.
              </p>
              <p>This may include:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Name appearing on the identification card</li>
                <li>Registration number or identification number (partially displayed where necessary)</li>
                <li>Faculty, department, or institution information visible on the card</li>
                <li>Location where the card was found</li>
                <li>Date the card was recovered</li>
              </ul>
              <p>We only collect and display information that helps identify the owner of the card.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">How We Use the Information</h2>
              <p>The information collected is used strictly for the purpose of:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Helping individuals identify their lost ID cards</li>
                <li>Connecting lost identification cards with their rightful owners</li>
                <li>Maintaining a searchable database of recovered cards</li>
              </ul>
              <p>FindMyID does not use this information for marketing, advertising, or commercial purposes.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">Information Display</h2>
              <p>
                To help users identify their cards, some details from recovered IDs may be displayed on the platform.
              </p>
              <p>
                However, FindMyID takes reasonable steps to ensure that sensitive information is minimized and only the necessary details are shown.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">Data Protection</h2>
              <p>
                We take reasonable measures to protect the information stored on the platform. However, because the platform operates online, we cannot guarantee absolute security of all data.
              </p>
              <p>Users are encouraged to report any concerns regarding privacy or misuse of information.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">Third-Party Access</h2>
              <p>
                FindMyID does not sell, rent, or share personal information with third parties.
              </p>
              <p>
                Information displayed on the platform is solely intended to help individuals identify and recover their lost identification cards.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">Voluntary Use</h2>
              <p>
                Use of the FindMyID platform is completely voluntary. Users may choose whether or not to use the platform when searching for lost identification cards.
              </p>
            </section>

            <section className="space-y-4 border-t border-zinc-100 pt-8">
              <h2 className="text-xl font-bold text-foreground">Policy Updates</h2>
              <p>
                This Privacy Policy may be updated from time to time to improve transparency and compliance with best practices. Users are encouraged to review this page periodically.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
