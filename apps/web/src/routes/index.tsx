import FAQs from "@/components/faqs";
import { CTASession } from "@/components/landing-page/cta-session";
import Features from "@/components/landing-page/feature-section";
import { FooterSection } from "@/components/landing-page/footer";
import { HeroHeader } from "@/components/landing-page/hero-header";
import IntegrationsSection from "@/components/landing-page/integrations-section";
import { Setup } from "@/components/landing-page/landing-setup";
import { Pricing } from "@/components/landing-page/pricing";
import HeroVideoDialog from "@/components/magicui/hero-video-dialog";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <main className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] ">
      <HeroHeader />
      <div className="relative z-10 space-y-12">
        <CTASession />
        <div className="max-w-6xl px-3 sm:px-0 mx-auto relative flex justify-center items-center sm:flex-col sm:items-center">
          <HeroVideoDialog
            className="block dark:hidden"
            animationStyle="top-in-bottom-out"
            videoSrc="https://www.youtube.com/embed/WZ7hLRLdTIw?si=q7T9MsErVoRWKTgj"
            thumbnailAlt="Hero Video"
          />
          <HeroVideoDialog
            className="hidden dark:block"
            animationStyle="top-in-bottom-out"
            videoSrc="https://www.youtube.com/embed/WZ7hLRLdTIw?si=q7T9MsErVoRWKTgj"
            thumbnailAlt="Hero Video"
          />
        </div>
        <Features />
        <Setup />
        <IntegrationsSection />

        <div className="pt-10">
          <Pricing />
        </div>
        <FAQs />
        <FooterSection />
      </div>
    </main>
  );
}
