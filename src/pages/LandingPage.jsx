import React from "react";
import { LandingStoryProvider } from "../components/landing-ui/LandingStoryContext";
import StickyNavbar from "../components/landing/StickyNavbar";
import HeroSection from "../components/landing/HeroSection";
import WorkspaceShowcase from "../components/landing/WorkspaceShowcase";
import DailyWorkflow from "../components/landing/DailyWorkflow";
import BuiltForFocus from "../components/landing/BuiltForFocus";
import EverythingConnected from "../components/landing/EverythingConnected";
import JourneySection from "../components/landing/JourneySection";
import ReportsShowcase from "../components/landing/ReportsShowcase";
import FutureRoadmap from "../components/landing/FutureRoadmap";
import CTASection from "../components/landing/CTASection";

export const LandingPage = () => {
  return (
    <LandingStoryProvider>
      <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-800 dark:text-white transition-colors duration-500 font-sans">
        <StickyNavbar />
        <HeroSection />
        <WorkspaceShowcase />
        <DailyWorkflow />
        <BuiltForFocus />
        <EverythingConnected />
        <JourneySection />
        <ReportsShowcase />
        <FutureRoadmap />
        <CTASection />
      </div>
    </LandingStoryProvider>
  );
};

export default LandingPage;
