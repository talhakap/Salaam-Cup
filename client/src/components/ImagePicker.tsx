import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Images, Search, Check, ImageIcon } from "lucide-react";

interface ImagePickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string) => void;
  currentImage?: string;
}

export function ImagePicker({ open, onClose, onSelect, currentImage }: ImagePickerProps) {
  const [search, setSearch] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: images, isLoading } = useQuery<string[]>({
    queryKey: ["/api/admin/images"],
    enabled: open,
  });

  const filtered = useMemo(() => {
    if (!images) return [];
    if (!search.trim()) return images;
    const q = search.toLowerCase();
    return images.filter(img => img.toLowerCase().includes(q));
  }, [images, search]);

  const handleConfirm = () => {
    if (selectedImage) {
      onSelect(selectedImage);
      onClose();
      setSelectedImage(null);
      setSearch("");
    }
  };

  const handleImageClick = (img: string) => {
    setSelectedImage(img === selectedImage ? null : img);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { onClose(); setSelectedImage(null); setSearch(""); } }}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Images className="h-5 w-5" />
            Choose from Existing Images
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search images by filename..."
            className="pl-10"
            data-testid="input-image-search"
          />
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {isLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 p-1">
              {Array.from({ length: 15 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-md" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ImageIcon className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">{search ? "No images match your search" : "No images available"}</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 p-1">
              {filtered.map((img) => {
                const isSelected = selectedImage === img;
                const isCurrent = currentImage === img;
                const filename = img.split("/").pop() || img;
                return (
                  <button
                    key={img}
                    type="button"
                    onClick={() => handleImageClick(img)}
                    className={`
                      relative aspect-square rounded-md overflow-hidden border-2 transition-all
                      ${isSelected ? "border-primary ring-2 ring-primary/30" : isCurrent ? "border-green-500" : "border-transparent hover:border-muted-foreground/30"}
                    `}
                    title={filename}
                    data-testid={`button-pick-image-${filename}`}
                  >
                    <img
                      src={img}
                      alt={filename}
                      className="w-full h-full object-cover bg-muted"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                        const parent = (e.target as HTMLImageElement).parentElement;
                        if (parent && !parent.querySelector(".fallback-icon")) {
                          const div = document.createElement("div");
                          div.className = "fallback-icon absolute inset-0 flex items-center justify-center bg-muted";
                          const span = document.createElement("span");
                          span.className = "text-xs text-muted-foreground text-center px-1 break-all";
                          span.textContent = filename;
                          div.appendChild(span);
                          parent.appendChild(div);
                        }
                      }}
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="bg-primary text-primary-foreground rounded-full p-1">
                          <Check className="h-4 w-4" />
                        </div>
                      </div>
                    )}
                    {isCurrent && !isSelected && (
                      <div className="absolute top-1 right-1 bg-green-500 text-white text-[10px] px-1 rounded">
                        Current
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            {filtered.length} image{filtered.length !== 1 ? "s" : ""} available
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel-image-picker">
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedImage}
              data-testid="button-confirm-image-picker"
            >
              Use Selected Image
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ImageFieldProps {
  value: string;
  onChange: (url: string) => void;
  onUploadClick: () => void;
  isUploading: boolean;
  label?: string;
  placeholder?: string;
  uploadLabel?: string;
  previewClassName?: string;
}

export function ImageField({
  value,
  onChange,
  onUploadClick,
  isUploading,
  label = "Image",
  placeholder = "https://... or upload/choose above",
  uploadLabel = "Upload Image",
  previewClassName = "mt-2 aspect-video max-w-xs rounded-md overflow-hidden bg-muted",
}: ImageFieldProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div>
      {label && <label className="text-sm font-medium leading-none">{label}</label>}
      <div className="space-y-2 mt-1.5">
        <div className="flex gap-2 flex-wrap">
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={onUploadClick}
            disabled={isUploading}
            data-testid="button-upload-image"
          >
            {isUploading ? (
              <><span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> Uploading...</>
            ) : (
              <><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> {uploadLabel}</>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={() => setPickerOpen(true)}
            data-testid="button-browse-images"
          >
            <Images className="h-4 w-4" /> Browse Library
          </Button>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>or enter URL:</span>
        </div>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          data-testid="input-image-url"
        />
        {value && (
          <div className={previewClassName}>
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
      </div>
      <ImagePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={onChange}
        currentImage={value}
      />
    </div>
  );
}
