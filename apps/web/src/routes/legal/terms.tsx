import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/legal/terms")({
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
              Terms of Service
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
                Welcome to Padyna, operated by Abdul-Wahab Osman Abass and our
                team ("Company", "us", "we", or "our")! Below are our Terms of
                Service, we invite you to carefully read the following pages. It
                will take you approximately 5 minutes.
                <br />
                <br />
                These Terms of Service ("Terms", "Terms of Service") govern your
                use of our web pages located at{" "}
                <a
                  className="text-blue-500 underline"
                  href="https://padyna.com"
                >
                  https://padyna.com
                </a>{" "}
                operated by Padyna.
                <br />
                <br />
                Our Privacy Policy also governs your use of our Service and
                explains how we collect, safeguard and disclose information that
                results from your use of our web pages. Please read it{" "}
                <a
                  className="text-blue-500 underline"
                  href="https://padyna.com/legal/privacy"
                >
                  Privacy Policy
                </a>
                .
              </p>
              <br />
              <p className="text-gray-600 leading-relaxed">
                Your agreement with us includes these Terms and our Privacy
                Policy (“Agreements”). You acknowledge that you have read and
                understood Agreements, and agree to be bound by them.
              </p>
              <br />
              <p className="text-gray-600 leading-relaxed">
                If you do not agree with (or cannot comply with) Agreements,
                then you may not use the Service, but please let us know by
                emailing at{" "}
                <a
                  className="text-blue-500 underline"
                  href="mailto:support@padyna.com"
                >
                  support@padyna.com
                </a>{" "}
                so we can try to find a solution. These Terms apply to all
                visitors, users and others who wish to access or use Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Your Account
              </h2>
              <p className="text-gray-600 leading-relaxed">
                To provide you with our Services, we need your agreement to our
                terms. While our service is available to nearly everyone, please
                make sure to keep your passwords secure and avoid sharing your
                credentials with others.
              </p>
              <br />
              <p className="text-gray-600 leading-relaxed">
                To access or use our service, you must create an account with
                us. When you create this account you must provide accurate and
                up-to-date information. It is important that you maintain and
                update your details and any other information that you provide
                to us.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Security
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We prioritize the security of our users, but please note that
                despite our best efforts to safeguard your content and account,
                we cannot fully prevent unauthorized third parties from
                bypassing our security measures. It’s essential that you keep
                your password confidential and notify us immediately if you
                notice any unauthorized activity or potential breaches.
              </p>
              <br />
              <p className="text-gray-600 leading-relaxed">
                You are responsible for keeping your account and password
                secure, which includes restricting access to your computer
                and/or account. You accept responsibility for all actions taken
                under your account or password, whether on our Service or
                through any third-party service. In case you detect any security
                breach or unauthorized use, inform us right away.
              </p>
              <br />
              <p className="text-gray-600 leading-relaxed">
                When choosing a username, you may not select one that belongs to
                or is associated with someone else, or that isn’t legally
                available for use, including any name or trademark owned by
                another without proper authorization. Additionally, usernames
                that are offensive, vulgar, or obscene are strictly prohibited.
              </p>
              <br />
              <p className="text-gray-600 leading-relaxed">
                We reserve the right to refuse service, terminate accounts,
                modify or remove content, or cancel orders at our sole
                discretion.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Purchases
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Some parts of the Service are billed on a subscription basis
                ("Subscription(s)"). You will be billed in advance on a
                recurring and periodic basis ("Billing Cycle"). Billing cycles
                are set on a monthly basis At the end of each Billing Cycle,
                your Subscription will automatically renew under the exact same
                conditions unless you cancel it or Padyna cancels it.
              </p>
              <br />
              <p className="text-gray-600 leading-relaxed">
                You may cancel your Subscription renewal either through your
                settings page or by contacting Padyna customer support team at{" "}
                <a
                  className="text-blue-500 underline"
                  href="mailto:support@padyna.com"
                >
                  support@padyna.com
                </a>{" "}
                . A valid payment method, including credit card, is required to
                process the payment for your Subscription. You shall provide
                Padyna with accurate and complete billing information. By
                submitting such payment information, you automatically authorize
                Padyna to charge all Subscription fees incurred through your
                account to any such payment instruments.
              </p>
              <br />
              <p className="text-gray-600 leading-relaxed">
                Should automatic billing fail to occur for any reason, Padyna
                will issue an electronic invoice indicating that you must
                proceed manually, within a certain deadline date, with the full
                payment corresponding to the billing period as indicated on the
                invoice. Padyna in its sole discretion and at any time, may
                modify the Subscription fees for the Subscriptions. Any
                Subscription fee change will become effective at the end of the
                then-current Billing Cycle.
              </p>
              <br />
              <p className="text-gray-600 leading-relaxed">
                Padyna will provide you with a reasonable prior notice of any
                change in Subscription fees to give you an opportunity to
                terminate your Subscription before such change becomes
                effective. Your continued use of the Service after the
                Subscription fee change comes into effect constitutes your
                agreement to pay the modified Subscription fee amount.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Cancellation and Refunds
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Users can cancel their Padyna subscription at any time via their
                dashboard. If a refund is required, users must contact our
                support team at{" "}
                <a
                  className="text-blue-500 underline"
                  href="mailto:support@padyna.com"
                >
                  support@padyna.com
                </a>{" "}
                after cancellation. Refunds are processed within five (5)
                working days, subject to eligibility.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Your Content
              </h2>
              <p className="text-gray-700 leading-relaxed">
                When you add text, images, videos, or other materials to your
                page on Padyna, you take full responsibility for this content,
                including its legal status and appropriateness. For any content
                owned by others, you must ensure you have proper permissions or
                licenses to use it on your page and Padyna.
              </p>
              <br />
              <p className="text-gray-700 leading-relaxed">
                By uploading content to Padyna, you give us permission to use it
                solely for the purpose of operating, improving, and providing
                the chatbot service to your authorized users and customers. You
                confirm you have all necessary rights from third parties to
                share this content. You maintain ownership of all your rights to
                the content you share through Padyna, and it is your
                responsibility to protect and manage these rights. We will not
                display your content publicly, except to the extent you make it
                accessible to your end-users/customers through the chatbot.
              </p>
            </section>
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Acceptable Use
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Your access and use of Padyna are governed by these Terms of
                Service, along with all applicable laws and regulations. We are
                committed to maintaining the safety of the Padyna Service for
                all users and preventing inappropriate content or behavior. We
                reserve the right to cooperate with third parties, including law
                enforcement, in response to genuine and reasonable allegations
                of violations of these Terms.
              </p>
            </section>
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Confidentiality
              </h2>
              <p className="text-gray-700 leading-relaxed">
                You must protect any confidential information we share with you
                about Padyna. If we provide you with information that is
                confidential or that a reasonable person would consider
                confidential, you must keep it private and use appropriate
                security measures to prevent unauthorized access or disclosure.
              </p>
            </section>
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Liability
              </h2>
              <p className="text-gray-700 leading-relaxed">
                You acknowledge that we do not accept liability for any damages
                you may suffer from using the Service or from copying,
                distributing, or downloading Content from it. Under no
                circumstances will we accept responsibility for any indirect,
                punitive, special, incidental, or consequential damages,
                including lost business, revenue, profits, use, privacy, data,
                goodwill, or other economic advantage, regardless of how they
                arise, whether due to a contract breach or a tort, even if we
                previously received notice of the potential for such damages.
              </p>
              <br />
              <p className="text-gray-700 leading-relaxed">
                You bear full responsibility for maintaining adequate security
                protection and data backups for any equipment you use with the
                Service. You agree not to make any claims against us for lost
                data, re-run time, inaccurate instructions, work delays, or lost
                profits resulting from your use of the Service. You must not
                transfer or assign your account to anyone else. Without limiting
                the above, we will never owe you more in total than the amount
                you have paid us.
              </p>
            </section>
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Disclaimer
              </h2>
              <p className="text-gray-700 leading-relaxed">
                You use Padyna at your own risk. We provide Padyna on an “AS IS”
                and “AS AVAILABLE” basis, without any warranties of any
                kind—express or implied. We make no guarantees about uptime or
                availability, and we disclaim all implied warranties, including
                merchantability, fitness for a particular purpose,
                non-infringement, and performance.
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
