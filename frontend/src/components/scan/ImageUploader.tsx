'use client';

import { useState, useRef } from 'react';
import { UploadSimple, Image as ImageIcon, Camera } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useToast } from '@/components/ui/Toast';

interface ImageUploaderProps {
  onUpload: (file: File) => void;
  isLoading?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload, isLoading = false }) => {
  const isMobile = useIsMobile();
  const { addToast } = useToast();
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      addToast({
        type: 'warning',
        title: 'Invalid file type',
        message: 'Please upload an image file (JPG, PNG, etc.)',
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Call onUpload callback
    onUpload(file);
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
        disabled={isLoading}
        aria-label="Upload image from gallery"
        id="image-upload"
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        className="hidden"
        disabled={isLoading}
        aria-label="Take photo with camera"
        id="camera-capture"
      />

      {preview ? (
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-cream-dark">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-auto max-h-96 object-contain"
            />
          </div>

          {!isLoading && (
            <Button
              variant="outline"
              onClick={() => {
                setPreview(null);
                if (inputRef.current) {
                  inputRef.current.value = '';
                }
              }}
              className="w-full"
            >
              Choose Different Image
            </Button>
          )}
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload image area. Drag and drop an image or click to select"
          className={`
            relative border-2 border-dashed rounded-2xl p-12
            transition-all duration-200 cursor-pointer
            ${
              dragActive
                ? 'border-terracotta bg-terracotta/5'
                : 'border-charcoal/20 hover:border-terracotta hover:bg-cream-dark'
            }
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            focus:outline-none focus:ring-2 focus:ring-terracotta focus:ring-offset-2
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleButtonClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleButtonClick();
            }
          }}
        >
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            {dragActive ? (
              <UploadSimple size={64} weight="duotone" className="text-terracotta" />
            ) : (
              <ImageIcon size={64} weight="duotone" className="text-charcoal/40" />
            )}

            <div>
              <p className="text-lg font-medium text-charcoal mb-2">
                {dragActive ? 'Drop your image here' : 'Upload a photo of your fridge'}
              </p>
              <p className="text-sm text-charcoal/60">
                Drag and drop or click to select • JPG, PNG up to 10MB
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-center justify-center">
              {/* Camera button - prominent on mobile */}
              <Button
                variant="primary"
                size="lg"
                onClick={(e) => {
                    e.stopPropagation();
                    cameraRef.current?.click();
                }}
                iconLeft={<Camera size={20} />}
                className="sm:hidden w-full"
                disabled={isLoading}
              >
                Take Photo
              </Button>

              {/* Gallery button */}
              <Button
                variant={isMobile ? 'outline' : 'primary'}
                size="lg"
                onClick={(e) => {
                  e.stopPropagation();
                  handleButtonClick();
                }}
                disabled={isLoading}
                className={isMobile ? "w-full" : ""}
              >
                {isMobile ? 'Choose from Gallery' : 'Choose Image'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
