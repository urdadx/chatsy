// import communityImage from "@/assets/personas/community.webp"
import leadImage from "@/assets/personas/lead.webp"
import salesImage from "@/assets/personas/sales.webp"
import supportImage from "@/assets/personas/support.webp"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useUpdatePersonality } from "@/lib/hooks/use-personality"
import { containerVariants } from "@/lib/utils"
import { ArrowRight } from "lucide-react"
import { motion } from "motion/react"
import { useId, useState } from "react"
import { useStepperStore } from "../store/stepper-store";
import { Button } from "../ui/button"
import Spinner from "../ui/spinner"

const botPersonalities = [

  {
    id: "support",
    value: "support",
    title: "Customer Support",
    subtitle: "Resolve issues",
    description: "Provides instant support and resolves customer issues efficiently.",
    image: supportImage,
  },
  {
    id: "sales",
    value: "sales",
    title: "Sales Agent",
    subtitle: "Drive conversions",
    description: "Converts visitors into customers through strategic conversations and recommendations.",
    image: salesImage,
  },
  // {
  //   id: "community",
  //   value: "community",
  //   title: "Community Manager",
  //   subtitle: "Engage & connect",
  //   description: "Builds community and creates meaningful connections with users.",
  //   image: communityImage,
  // },
  {
    id: "lead",
    value: "lead",
    title: "Lead Capture",
    subtitle: "Qualify prospects",
    description: "Identifies potential leads and qualifies prospects for your sales team.",
    image: leadImage,
  },
]

export function StepThree() {
  const { nextStep, previousStep } = useStepperStore();
  const [selectedPersonality, setSelectedPersonality] = useState<"support" | "sales" | "lead">("support")
  const updatePersonalityMutation = useUpdatePersonality();

  const id = useId()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await updatePersonalityMutation.mutateAsync(selectedPersonality)
      nextStep()
    } catch (error) {
      console.error("Error updating personality:", error)
    }
  }
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex flex-col h-full"
    >
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col">
            <h1 className="text-2xl text-start font-semibold">
              Personality
            </h1>
            <p className="text-start text-muted-foreground">
              How would you like your chatbot to behave?
            </p>
          </div>
          <RadioGroup
            className="gap-4"
            value={selectedPersonality}
            onValueChange={(value) => setSelectedPersonality(value as "support" | "sales" | "lead")}
          >
            {botPersonalities.map((personality) => (
              <div
                key={personality.id}
                className="border-2 items-center has-data-[state=checked]:border-2 has-data-[state=checked]:border-primary/50 has-data-[state=checked]:bg-primary/5 relative flex w-full  gap-2 rounded-xl  p-2 px-4 shadow-xs outline-none transition-colors hover:border-primary/30"
              >
                <RadioGroupItem
                  value={personality.value}
                  id={`${id}-${personality.id}`}
                  aria-describedby={`${id}-${personality.id}-description`}
                  className="order-1 after:absolute after:inset-0"
                />
                <div className="flex grow items-center gap-2">
                  <img
                    src={personality.image}
                    alt={personality.title}
                    className="shrink-0 w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex flex-col ">
                    <Label className="text-md font-normal" htmlFor={`${id}-${personality.id}`}>
                      {personality.title}{" "}
                    </Label>
                    {/* <p
                id={`${id}-${personality.id}-description`}
                className="text-muted-foreground text-xs leading-relaxed"
              >
                {personality.description}
              </p> */}
                  </div>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>
        <div className="flex gap-2 pt-6">
          <Button variant="outline" type="button" onClick={previousStep}>
            Previous
          </Button>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              disabled={updatePersonalityMutation.isPending}
            >
              {updatePersonalityMutation.isPending ? <Spinner /> : "Continue"} <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </form>
    </motion.div>
  )
}