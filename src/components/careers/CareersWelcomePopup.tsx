import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coffee, Sparkles } from "lucide-react";

interface CareersWelcomePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CareersWelcomePopup = ({ isOpen, onClose }: CareersWelcomePopupProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="sm:max-w-md text-center"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="items-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
            <Coffee className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-display">
            Welcome to Career Craft Cafe!
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            Your one-stop destination to explore career paths, discover opportunities, and craft your professional journey.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Explore 100+ career paths across multiple domains</span>
          </div>
          
          <Button onClick={onClose} className="w-full" size="lg">
            Start Exploring
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CareersWelcomePopup;
