import { create } from "zustand";
import { persist } from "zustand/middleware";

interface StepperState {
  currentStep: number;
  totalSteps: number;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  resetStepper: () => void;
  isFirstStep: () => boolean;
  isLastStep: () => boolean;
}

export const useStepperStore = create<StepperState>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      totalSteps: 5,
      setCurrentStep: (step: number) =>
        set({ currentStep: Math.max(1, Math.min(step, get().totalSteps)) }),
      nextStep: () => {
        const { currentStep, totalSteps } = get();
        if (currentStep < totalSteps) {
          set({ currentStep: currentStep + 1 });
        }
      },
      previousStep: () => {
        const { currentStep } = get();
        if (currentStep > 1) {
          set({ currentStep: currentStep - 1 });
        }
      },
      resetStepper: () => set({ currentStep: 1 }),
      isFirstStep: () => get().currentStep === 1,
      isLastStep: () => get().currentStep === get().totalSteps,
    }),
    {
      name: "stepper-storage",
    },
  ),
);
