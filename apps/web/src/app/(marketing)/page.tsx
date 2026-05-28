import { Nav } from "@/components/landing/nav/nav";
import { Hero } from "@/components/landing/hero";
import { ModelsStrip } from "@/components/landing/models-strip";
import { Steps } from "@/components/landing/steps";
import { Templates } from "@/components/landing/templates";
import RolesBento from "@/components/landing/roles-bento";
import { Integrations } from "@/components/landing/integrations";
import { Pricing } from "@/components/landing/pricing";
import { FAQ } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";

export default function HomePage() {
  return (
    <>
      <Nav />
      <Hero />
      <ModelsStrip />
      <Steps />
      <Templates />
      <RolesBento />
 
      <Integrations />
      <Pricing />
      <FAQ />
      <Footer />
    </>
  );
}
