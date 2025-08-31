import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/legal/privacy")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <div className="min-h-screen bg-white px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <Link
              to="/"
              className="flex items-center gap-2 text-indigo-600 hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Link>
          </div>
          <div className="flex max-w-2xl mx-auto items-center gap-3 mb-8">
            <h1 className="text-3xl text-center font-bold text-gray-900">
              Privacy Policy
            </h1>
          </div>

          <div className="prose prose-indigo max-w-2xl mx-auto">
            <p className="text-gray-600 mb-8">
              Last updated: September 05, 2025
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Introduction
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Padyna takes user privacy seriously and commits to protecting
                personal data while using it in line with legal requirements.
                This Privacy Policy explains how we collect and use personal
                data and outlines the rights our visitors, customers, and
                merchants have regarding their information. By accessing or
                using this website or any of our Services, you agree to the
                terms outlined in this Privacy Policy, and any other policies
                posted on our website. If you disagree with this Privacy Policy,
                please leave the website and stop using our Services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Information Collection And Use
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We collect the following data to confirm your identity, contact
                you, invoice you, and otherwise provide our Services:
              </p>

              <br />
              <ul className="list-disc pl-6 text-gray-600 leading-relaxed">
                <li>Name</li>
                <li>Email address</li>
                <li>IP address and device data</li>
              </ul>
              <br />

              <p className="text-gray-600 leading-relaxed">
                Other information that you share with us while using our
                Services or during checkout. We collect the above-mentioned
                personal data when the User uses or accesses our Services,
                places an order, or signs up for an account on our website.
              </p>
              <br />
              <p className="text-gray-600 leading-relaxed">
                Upon starting to use our Services we may process your email
                address to send you informative materials, such as newsletters,
                advertisements and others. At any point in time you can
                unsubscribe from receiving the above-mentioned information in
                our email footers.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Cookies
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We use cookies to collect information. You can configure your
                browser to refuse all cookies or to notify you when a website
                sends a cookie. However, if you choose not to accept cookies,
                you may be unable to access certain parts of our Service.
              </p>
              <br />
              <p className="text-gray-600 leading-relaxed">
                When you visit our site, we automatically record certain
                information. This data is typically anonymous and doesn’t reveal
                your identity. However, if you're logged into your account, we
                may associate some of this information with your account. The
                information we collect includes:
              </p>
              <br />
              <ul className="list-disc pl-6 text-gray-600 leading-relaxed">
                <li>Your IP address or proxy server address</li>
                <li>The domain name you requested</li>
                <li>
                  Your internet service provider's name (depending on your ISP
                  configuration)
                </li>
                <li>The date and time of your visit</li>
                <li>The duration of your session</li>
                <li>The pages you accessed</li>
                <li>
                  The number of times you visited our site within a given month
                </li>
                <li>The file URLs you viewed and related information</li>
                <li>The website that referred you to our site</li>
                <li>Your computer's operating system</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Security
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We take the security of your personal information seriously. We
                use reasonable organizational, technical, and administrative
                measures to protect the confidentiality, integrity, and
                availability of your personal data. However, no system is 100%
                secure, so we can’t guarantee absolute protection.
              </p>
              <br />
              <p className="text-gray-600 leading-relaxed">
                We encourage you to safeguard your data, set strong passwords
                for your Padyna account, sign out after each session, limit
                access to your device, and avoid sharing sensitive information
                that could cause you significant harm if exposed.
              </p>
              <br />
              <p className="text-gray-600 leading-relaxed">
                We protect the personal information we store or transmit using
                security and access controls such as username and password
                authentication, two-factor authentication, and data encryption
                when appropriate.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Information You Share Publicly
              </h2>
              <p className="text-gray-600 leading-relaxed">
                If you share your personal information with others, we cannot
                control or take responsibility for how they use or manage that
                data. You might share information in various ways, by posting a
                public message on a forum, sharing content on social media, or
                contacting another user (such as a third-party Author) either
                through our Sites or directly via email.
              </p>
              <br />
              <p className="text-gray-600 leading-relaxed">
                Before you make your information public or share it with anyone,
                consider the implications carefully. If you're giving
                information to another user through our Sites, ask how they plan
                to handle it. If you're sharing information through another
                website, review that site’s privacy policy to understand how it
                manages data—our privacy policy won’t apply in that case.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Data Subject’s Rights
              </h2>
              <p className="text-gray-700 leading-relaxed">
                If you're located in the European Economic Area, EU data
                protection laws grant you certain rights over your personal
                data. You can contact us at{" "}
                <a
                  className="text-blue-500 underline"
                  href="mailto:support@padyna.com"
                >
                  support@padyna.com
                </a>{" "}
                to access, correct, amend, delete, or restrict the use of your
                personal data. If you believe we’ve processed your data
                unlawfully, you have the right to file a complaint with us or
                with your local data protection authority.
              </p>
            </section>
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Retention Periods
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We retain your personal data for as long as you have an active
                relationship with us, such as maintaining a Padyna account or
                using our Services. If you delete your account or stop using our
                Services, we may still store copies of your data when necessary
                to comply with legal obligations, resolve disputes, prevent
                fraud or abuse, enforce our agreements, or protect our
                legitimate interests.
              </p>
            </section>
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Children’s Privacy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Our Service doesn’t target anyone under the age of 13
                (“Children”), and we don’t knowingly collect personal
                information from them. If you’re a parent or guardian and you
                learn that your child has shared personal information with us,
                please contact us. If we find that a child under 18 has provided
                personal information, we will immediately delete it from our
                servers.
              </p>
            </section>
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Change To Privacy Policy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy, for example, when we
                introduce new services or features. The updates take effect as
                soon as they are posted on this page. We encourage you to check
                this page periodically. By continuing to use our Services or
                providing personal data after we update the policy, you agree to
                the revised terms.
              </p>
            </section>
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Contact Us
              </h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about this Privacy Policy, please
                contact us at{" "}
                <a
                  className="text-blue-500 underline"
                  href="mailto:support@padyna.com"
                >
                  support@padyna.com
                </a>{" "}
                and we will answer them for you.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <span className="text-muted-foreground block text-center text-sm">
              {" "}
              © {new Date().getFullYear()} Padyna, All rights reserved
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
