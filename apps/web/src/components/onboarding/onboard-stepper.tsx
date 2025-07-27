import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperTrigger,
} from "@/components/ui/stepper";
import { useStepperStore } from "../store/stepper-store";
import { Completed } from "./completed";
import { StepOne } from "./step-one";
import { StepThree } from "./step-three";
import { StepTwo } from "./step-two";

const steps = [1, 2, 3, 4];

const renderStepComponent = (step: number) => {
  switch (step) {
    case 1:
      return <StepOne />;
    case 2:
      return <StepTwo />;
    case 3:
      return <StepThree />;
    case 4:
      return <Completed />;
    default:
      return null;
  }
};

export default function OnboardStepper() {
  const { currentStep, setCurrentStep } = useStepperStore();

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 text-center">
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
