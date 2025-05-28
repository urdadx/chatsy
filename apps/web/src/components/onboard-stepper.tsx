import { motion } from "framer-motion";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperTrigger,
} from "@/components/ui/stepper";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Completed } from "./onboarding/completed";
import { StepFour } from "./onboarding/step-four";
import { StepOne } from "./onboarding/step-one";
import { StepThree } from "./onboarding/step-three";
import { StepTwo } from "./onboarding/step-two";

const steps = [1, 2, 3, 4, 5];

const renderStepComponent = (step: number) => {
  switch (step) {
    case 1:
      return <StepOne />;
    case 2:
      return <StepTwo />;
    case 3:
      return <StepThree />;
    case 4:
      return <StepFour />;
    case 5:
      return <Completed />;
    default:
      return null;
  }
};

export default function OnboardStepper() {
  const [currentStep, setCurrentStep] = useState(1);

  const navigate = useNavigate();

  return (
    <div className=" max-w-2xl space-y-8 text-center">
      <div className="flex items-center gap-2">
        <Stepper
          value={currentStep}
          onValueChange={setCurrentStep}
          className="gap-1"
        >
          {steps.map((step) => (
            <StepperItem key={step} step={step} className="flex-1">
              <StepperTrigger
                className="w-full flex-col items-start gap-2"
                asChild
              >
                <StepperIndicator asChild className="bg-border h-1 w-full">
                  <span className="sr-only">{step}</span>
                </StepperIndicator>
              </StepperTrigger>
            </StepperItem>
          ))}
        </Stepper>
      </div>

      <div className="min-h-[350px]">{renderStepComponent(currentStep)}</div>

      <div className="flex justify-start space-x-4">
        <Button
          variant="outline"
          onClick={() => setCurrentStep((prev) => prev - 1)}
          disabled={currentStep === 1}
        >
          Previous
        </Button>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={() => {
              if (currentStep === steps.length) {
                navigate({ to: "/admin/playground" });
              } else {
                setCurrentStep((prev) => prev + 1);
              }
            }}
            disabled={currentStep > steps.length}
          >
            {currentStep === steps.length ? (
              "Finish"
            ) : (
              <>
                Continue <ArrowRight className=" h-4 w-4" />
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
