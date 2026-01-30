"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ImageZoomProps {
  imageUrl: string | null;
  onClose: () => void;
  title?: string;
}

export function ImageZoom({ imageUrl, onClose, title = "Image en grand" }: ImageZoomProps) {
  return (
    <Dialog open={!!imageUrl} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] bg-black/95 border-blood-900/30 p-2">
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {imageUrl && (
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={imageUrl}
              alt={title}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            
            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full w-10 h-10 p-0"
              onClick={onClose}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
            
            {/* Open in new tab */}
            <Button
              variant="secondary"
              size="sm"
              className="absolute bottom-4 right-4 bg-white/10 hover:bg-white/20 text-white"
              onClick={() => window.open(imageUrl, "_blank")}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Ouvrir en plein écran
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
