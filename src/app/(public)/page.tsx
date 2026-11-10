import { HeroSection } from "@/components/marketing/hero-section";
import { HowItWorksSection } from "@/components/marketing/how-it-works-section";
import { ProgramsSection } from "@/components/marketing/programs-section";
import { ProgressSection } from "@/components/marketing/progress-section";

export default function Home() {
  return (
    <>
      <HeroSection />
      <HowItWorksSection />
      <ProgramsSection />
      <ProgressSection />
    </>
  );
}
