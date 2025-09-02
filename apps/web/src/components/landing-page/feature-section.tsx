import { motion } from "framer-motion";
// import { AnalyticsCard } from "./analytics-card";
import { FeatureCard } from "./feature-card";
import { LandingShare } from "./landing-share";
import { LandingThemes } from "./landing-themes";
import { SampleChat } from "./sample-chat";
import { AnalyticsCard } from "./analytics-card";

export default function Features() {
  return (
    <section id="features" className="py-12 md:py-20">
      <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
          className="relative z-10 mx-auto max-w-xl space-y-4 text-center md:space-y-6"
        >
          <h2 className="instrument-serif-regular-italic text-3xl lg:text-4xl">
            <span className="text-purple-600 bg-purple-100 px-1 rounded relative inline-block z-1">
              Powerful{" "}
            </span>{" "}
            features for your business
          </h2>
          <p className="text-pretty text-lg text-neutral-500">
            Enhance your customer support with our comprehensive features,
            designed to streamline interactions and boost productivity.
          </p>
        </motion.div>
        <div className="mx-auto mt-14 grid w-full max-w-screen-lg grid-cols-1 px-4 sm:grid-cols-2">
          <div className="contents divide-neutral-200 max-sm:divide-y sm:divide-x">
            <FeatureCard
              title="AI powered customer support"
              description="Answer customer queries with an AI support agent trained on your website, docs, and more."
            >
              <SampleChat />
            </FeatureCard>

            <FeatureCard
              title="Analytics and insights"
              description="Gain valuable insights into customer interactions and bot performance with our analytics tools."
            >
              <AnalyticsCard />
            </FeatureCard>
          </div>

          <div className="contents divide-neutral-200 max-sm:divide-y sm:divide-x [&>*]:border-t [&>*]:border-neutral-200">
            <FeatureCard
              title="Highly customizable"
              description="Customer your bot with colors that match your brand's identity."
            >
              <LandingThemes />
            </FeatureCard>
            <FeatureCard
              title="Share everywhere"
              description="Embed, share, or use QR codes for instant connections."
            >
              <LandingShare />
            </FeatureCard>
          </div>
        </div>
      </div>
    </section>
  );
}
