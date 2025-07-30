"use client";
import { useRef } from "react";
import HeroSection from "@/components/about/HeroSection";
// import HighlightsBar from "@/components/about/HighlightsBar";
import AboutModernHero from "@/components/about/AboutModernHero";
import MissionVisionSection from "@/components/about/MissionVisionSection";
import WhyMarsosSection from "@/components/about/WhyMarsosSection";
import ContactSection from "@/components/about/ContactSection";

export default function AboutUs() {
  const aboutRef = useRef(null);

  return (
    <main className='w-full min-h-screen bg-[#eaf3ed] font-sans overflow-x-hidden'>
      <HeroSection aboutRef={aboutRef} />
      {/* <HighlightsBar /> */}
      <AboutModernHero aboutRef={aboutRef} />
      <MissionVisionSection />
      <WhyMarsosSection />
      <ContactSection />
    </main>
  );
}
