import { motion } from "framer-motion";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

export const StepOne = () => {
  return (
    <motion.div initial="hidden" animate="visible">
      <form className="pt-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col">
            <h1 className="text-2xl text-start font-semibold">
              First things first.
            </h1>
            <p className="text-start  text-muted-foreground">
              Give your bot a name
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              autoFocus
              id="name"
              type="text"
              placeholder="ex: rico"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" placeholder="Tell us about yourself..." />
          </div>
        </div>
      </form>
    </motion.div>
  );
};
