import { CursorGlow } from "@/components/landing/cursor-glow";
import { Nav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { ModelsStrip } from "@/components/landing/models-strip";
import { Steps } from "@/components/landing/steps";
import { Platform } from "@/components/landing/platform";
import { Templates } from "@/components/landing/templates";
import { RolesBento } from "@/components/landing/roles-bento";
import { Compare } from "@/components/landing/compare";
import { Integrations } from "@/components/landing/integrations";
import { Pricing } from "@/components/landing/pricing";
import { FAQ } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";

export default function HomePage() {
  return (
    <>
      <CursorGlow />
      <Nav />
      <Hero />
      <ModelsStrip />
      <Steps />
      <Platform />
      <Templates />
      <RolesBento />
      <Compare />
      <Integrations />
      <Pricing />
      <FAQ />
      <FinalCta />
      <Footer />
    </>
  );
}
