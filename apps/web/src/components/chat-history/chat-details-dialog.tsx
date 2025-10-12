import { Info } from "lucide-react"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"

export const ChatDetailsDialog = ({ chatId }: { chatId?: string }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Info color="#915bf5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Chat details</DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}