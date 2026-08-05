import Navbar from "../../components/navbar/Navbar";
import Hero from "../../components/hero/Hero";
import Services from "../../components/services/Services";
import HowItWorks from "../../components/howItWorks/HowItWorks";
import Games from "../../components/games/Games";
import Footer from "../../components/footer/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Services />
      <Games />
      <HowItWorks />
      <Footer />
    </>
  );
}