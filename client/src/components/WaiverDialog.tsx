import { useState, useRef, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";

const DEFAULT_WAIVER = `<p><strong>SALAAM CUP WAIVER AND RELEASE OF LIABILITY</strong></p>
<p>By registering and participating in the Salaam Cup tournament ("Event"), I acknowledge and agree to the following terms and conditions:</p>
<p><strong>1. ASSUMPTION OF RISK</strong></p>
<p>I understand that participation in sports activities involves inherent risks, including but not limited to physical injury, disability, and death. I voluntarily assume all risks associated with my participation in the Event.</p>
<p><strong>2. RELEASE AND WAIVER</strong></p>
<p>I hereby release, waive, and discharge the Salaam Cup organizing committee, its directors, officers, employees, volunteers, sponsors, and affiliated organizations from any and all liability.</p>
<p><strong>3. MEDICAL ACKNOWLEDGMENT</strong></p>
<p>I confirm that I am physically fit to participate in the Event and am responsible for my own medical coverage.</p>
<p><strong>4. CODE OF CONDUCT</strong></p>
<p>I agree to abide by all rules and regulations and conduct myself in a sportsmanlike manner.</p>
<p><strong>5. MEDIA RELEASE</strong></p>
<p>I grant permission to use my name, likeness, and image for promotional materials and social media.</p>
<p><strong>6. PERSONAL PROPERTY</strong></p>
<p>The Event organizers are not responsible for any lost, stolen, or damaged personal property.</p>
<p><strong>7. REFUND POLICY</strong></p>
<p>Registration fees are non-refundable unless the Event is cancelled by the organizers.</p>
<p><strong>8. INDEMNIFICATION</strong></p>
<p>I agree to indemnify and hold harmless the Salaam Cup organizing committee from any claims made by third parties.</p>
<p><strong>9. GOVERNING LAW</strong></p>
<p>This waiver shall be governed by the laws of the province/state in which the Event is held.</p>
<p><strong>10. ACKNOWLEDGMENT</strong></p>
<p>I have read this waiver, fully understand its terms, and acknowledge that I am agreeing freely and voluntarily.</p>`;

interface WaiverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRead: () => void;
}

export function WaiverDialog({ open, onOpenChange, onRead }: WaiverDialogProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: waiverData, isLoading } = useQuery<{ id: number; content: string; updatedAt: string } | null>({
    queryKey: ["/api/waiver-content"],
    enabled: open,
  });

  const waiverHtml = waiverData?.content || DEFAULT_WAIVER;

  useEffect(() => {
    if (open) {
      setHasScrolledToBottom(false);
      const checkHeight = () => {
        const el = scrollRef.current;
        if (el && el.scrollHeight <= el.clientHeight + 30) {
          setHasScrolledToBottom(true);
        }
      };
      requestAnimationFrame(checkHeight);
      const timer = setTimeout(checkHeight, 300);
      return () => clearTimeout(timer);
    }
  }, [open, waiverHtml]);

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
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : (
              <div
                className="prose prose-sm max-w-none text-muted-foreground [&_strong]:text-foreground pr-2"
                data-testid="waiver-content"
                dangerouslySetInnerHTML={{ __html: waiverHtml }}
              />
            )}
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
