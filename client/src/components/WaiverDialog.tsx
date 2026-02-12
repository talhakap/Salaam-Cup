import { useState, useRef, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface WaiverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRead: () => void;
}

export function WaiverDialog({ open, onOpenChange, onRead }: WaiverDialogProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setHasScrolledToBottom(false);
      requestAnimationFrame(() => {
        const el = scrollRef.current;
        if (el && el.scrollHeight <= el.clientHeight + 30) {
          setHasScrolledToBottom(true);
        }
      });
    }
  }, [open]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight <= 30) {
      setHasScrolledToBottom(true);
    }
  }, []);

  const handleRead = () => {
    onRead();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col gap-0 p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="font-display uppercase text-lg">
            Waiver &amp; Terms of Participation
          </DialogTitle>
          <DialogDescription>
            Please read the full waiver agreement below. You must scroll to the bottom before you can continue.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 min-h-0 px-6">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="h-[50vh] overflow-y-auto rounded-md border p-4"
            data-testid="waiver-scroll-container"
          >
            <div className="space-y-4 text-sm text-muted-foreground pr-2" data-testid="waiver-content">
              <p className="font-semibold text-foreground">SALAAM CUP WAIVER AND RELEASE OF LIABILITY</p>

              <p>By registering and participating in the Salaam Cup tournament ("Event"), I acknowledge and agree to the following terms and conditions:</p>

              <p className="font-semibold text-foreground">1. ASSUMPTION OF RISK</p>
              <p>I understand that participation in sports activities involves inherent risks, including but not limited to physical injury, disability, and death. I voluntarily assume all risks associated with my participation in the Event, whether or not caused by the negligence of the organizers, officials, volunteers, or other participants.</p>

              <p className="font-semibold text-foreground">2. RELEASE AND WAIVER</p>
              <p>I hereby release, waive, and discharge the Salaam Cup organizing committee, its directors, officers, employees, volunteers, sponsors, and affiliated organizations from any and all liability, claims, demands, or causes of action arising out of or related to any loss, damage, or injury, including death, that may be sustained by me during or as a result of my participation in the Event.</p>

              <p className="font-semibold text-foreground">3. MEDICAL ACKNOWLEDGMENT</p>
              <p>I confirm that I am physically fit to participate in the Event. I understand that the Event organizers do not provide medical insurance, and I am responsible for my own medical coverage. I consent to receiving medical treatment that may be deemed advisable in the event of injury, accident, or illness during the Event.</p>

              <p className="font-semibold text-foreground">4. CODE OF CONDUCT</p>
              <p>I agree to abide by all rules and regulations of the Event and to conduct myself in a sportsmanlike manner. I understand that unsportsmanlike conduct, including but not limited to verbal abuse, physical violence, discrimination, or harassment, may result in immediate disqualification and removal from the Event without refund.</p>

              <p className="font-semibold text-foreground">5. MEDIA RELEASE</p>
              <p>I grant the Salaam Cup organizing committee permission to use my name, likeness, image, voice, and/or appearance as such may be embodied in any photographs, videos, recordings, or other media taken during the Event for any purpose, including promotional materials, social media, and website content, without compensation.</p>

              <p className="font-semibold text-foreground">6. PERSONAL PROPERTY</p>
              <p>I understand that the Event organizers are not responsible for any lost, stolen, or damaged personal property during the Event.</p>

              <p className="font-semibold text-foreground">7. REFUND POLICY</p>
              <p>Registration fees are non-refundable unless the Event is cancelled by the organizers. In the event of cancellation, refunds will be issued at the discretion of the organizing committee.</p>

              <p className="font-semibold text-foreground">8. INDEMNIFICATION</p>
              <p>I agree to indemnify and hold harmless the Salaam Cup organizing committee and its affiliates from any claims made by third parties arising out of my participation in the Event.</p>

              <p className="font-semibold text-foreground">9. GOVERNING LAW</p>
              <p>This waiver shall be governed by and construed in accordance with the laws of the province/state in which the Event is held.</p>

              <p className="font-semibold text-foreground">10. ACKNOWLEDGMENT</p>
              <p>I have read this waiver and release of liability, fully understand its terms, and understand that I am giving up substantial rights by agreeing to it. I acknowledge that I am signing this agreement freely and voluntarily, and intend my agreement to be a complete and unconditional release of all liability to the greatest extent allowed by law.</p>

              <p className="text-xs italic mt-6">Please scroll to the bottom of this agreement and click "Read" to confirm that you have read and understood these terms.</p>
            </div>
          </div>
        </div>
        <div className="p-6 pt-4 flex items-center gap-3">
          {!hasScrolledToBottom && (
            <p className="text-xs text-muted-foreground mr-auto">
              Scroll to the bottom to continue
            </p>
          )}
          <div className="ml-auto">
            <Button
              onClick={handleRead}
              disabled={!hasScrolledToBottom}
              className="rounded-full font-bold uppercase text-xs tracking-wider px-8"
              data-testid="button-waiver-read"
            >
              Read
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
