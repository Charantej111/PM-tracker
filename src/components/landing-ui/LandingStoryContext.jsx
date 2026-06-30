import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { careerPresets } from "../../data/careerPresets";

const LandingStoryContext = createContext(null);

export const STORY_STEPS = ["plan", "learn", "build", "measure", "grow"];

export const LandingStoryProvider = ({ children }) => {
  const [activePreset, setActivePreset] = useState("pm");
  const [currentStep, setCurrentStep] = useState("plan");
  const [isPlaying, setIsPlaying] = useState(true);

  const activePresetData = useMemo(() => {
    return careerPresets[activePreset] || careerPresets.pm;
  }, [activePreset]);

  // Transition to next step
  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      const idx = STORY_STEPS.indexOf(prev);
      if (idx === -1 || idx === STORY_STEPS.length - 1) {
        return STORY_STEPS[0];
      }
      return STORY_STEPS[idx + 1];
    });
  }, []);

  // Timer loop: cycles step-by-step, then pauses, then repeats
  useEffect(() => {
    if (!isPlaying) return;

    let timer;
    let longWaitTimer;

    const runLoop = () => {
      timer = setInterval(() => {
        setCurrentStep((prev) => {
          const idx = STORY_STEPS.indexOf(prev);
          if (idx === STORY_STEPS.length - 1) {
            // Reached the end. Clear standard interval, wait 15 seconds, then resume
            clearInterval(timer);
            longWaitTimer = setTimeout(() => {
              setCurrentStep(STORY_STEPS[0]);
              runLoop();
            }, 15000); // Wait 15 seconds before repeating
            return prev;
          }
          return STORY_STEPS[idx + 1];
        });
      }, 4000); // 4 seconds per step
    };

    runLoop();

    return () => {
      clearInterval(timer);
      clearTimeout(longWaitTimer);
    };
  }, [isPlaying]);

  const selectPreset = useCallback((presetKey) => {
    if (careerPresets[presetKey]) {
      setActivePreset(presetKey);
    }
  }, []);

  const selectStep = useCallback((stepKey) => {
    if (STORY_STEPS.includes(stepKey)) {
      setCurrentStep(stepKey);
      setIsPlaying(false); // Stop autoplay when user manually interacts
    }
  }, []);

  const startAutoplay = useCallback(() => setIsPlaying(true), []);
  const stopAutoplay = useCallback(() => setIsPlaying(false), []);

  const value = useMemo(() => ({
    activePreset,
    activePresetData,
    currentStep,
    isPlaying,
    selectPreset,
    selectStep,
    startAutoplay,
    stopAutoplay,
    nextStep
  }), [
    activePreset,
    activePresetData,
    currentStep,
    isPlaying,
    selectPreset,
    selectStep,
    startAutoplay,
    stopAutoplay,
    nextStep
  ]);

  return (
    <LandingStoryContext.Provider value={value}>
      {children}
    </LandingStoryContext.Provider>
  );
};

export const useLandingStory = () => {
  const context = useContext(LandingStoryContext);
  if (!context) {
    throw new Error("useLandingStory must be used within a LandingStoryProvider");
  }
  return context;
};
