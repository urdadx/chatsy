import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperTrigger,
} from "@/components/ui/stepper";
import { Completed } from "./onboarding/completed";
import { CreateWorkspaceOnboard } from "./onboarding/create-workspace-onboard";
import { StepFour } from "./onboarding/step-four";
import { StepOne } from "./onboarding/step-one";
import { StepThree } from "./onboarding/step-three";
import { StepTwo } from "./onboarding/step-two";
import { useStepperStore } from "./store/stepper-store";

const steps = [1, 2, 3];

const renderStepComponent = (step: number) => {
  switch (step) {
    case 1:
      return <CreateWorkspaceOnboard />;
    case 2:
      return <StepTwo />;
    case 3:
      return <Completed />;
    default:
      return null;
  }
};

export default function OnboardStepper() {
  const { currentStep, setCurrentStep } = useStepperStore();

  return (
    <div className="max-w-2xl space-y-8 text-center">
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

      <div className="">{renderStepComponent(currentStep)}</div>
    </div>
  );
}
