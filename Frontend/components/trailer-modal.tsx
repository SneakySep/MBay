"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface TrailerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** YouTube video key; null renders a friendly empty state. */
  videoKey: string | null;
  title: string;
}

/**
 * 16:9 YouTube embed in a shadcn Dialog. Radix unmounts the content when
 * closed, which also stops iframe playback automatically.
 */
export function TrailerModal({
  open,
  onOpenChange,
  videoKey,
  title,
}: TrailerModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl gap-0 overflow-hidden bg-black p-0">
        <DialogTitle className="sr-only">{title} — trailer</DialogTitle>
        {videoKey ? (
          <div className="relative aspect-video w-full">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoKey}?autoplay=1&rel=0`}
              title={`${title} — trailer`}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <p className="p-12 text-center text-muted-foreground">
            No trailer available for this title.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
