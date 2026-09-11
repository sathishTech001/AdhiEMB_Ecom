import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, RefreshCw, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { api } from '@/lib/axios';
import { Button } from './Button';
import { cn, getImageUrl } from '@/lib/utils';

export interface ImageUploaderProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  directory?: 'categories' | 'products' | 'users' | 'banners' | 'promotions' | 'general';
  error?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  helpText?: string;
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024; // 5MB

export function ImageUploader({
  value = '',
  onChange,
  label = 'Image / Thumbnail',
  directory = 'general',
  error,
  disabled = false,
  className = '',
  required = false,
  helpText,
}: ImageUploaderProps) {
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [fileFormat, setFileFormat] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [hasImageError, setHasImageError] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when external value changes
  useEffect(() => {
    if (value) {
      setPreviewUrl(getImageUrl(value));
      setHasImageError(false);
      const ext = value.split('.').pop()?.split('?')[0].toUpperCase();
      if (ext && ['JPG', 'JPEG', 'PNG', 'WEBP'].includes(ext)) {
        setFileFormat(ext);
      }
    } else if (!localFile) {
      setPreviewUrl('');
      setLocalFile(null);
      setDimensions(null);
      setFileFormat('');
    }
  }, [value, localFile]);

  // Format file size display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Helper to extract image dimensions using HTMLImageElement
  const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => {
        resolve({ width: 0, height: 0 });
      };
      img.src = url;
    });
  };

  // Handle file selection from device
  const handleFileSelect = async (file: File) => {
    setValidationError(null);
    setHasImageError(false);
    setUploadProgress(0);

    const ext = file.name.split('.').pop()?.toUpperCase() || '';
    const mime = file.type.toLowerCase();

    // 1. Format Validation
    if (!ALLOWED_MIME_TYPES.includes(mime)) {
      setValidationError('Unsupported image format. Please select JPG, JPEG, PNG, or WEBP.');
      return;
    }

    // 2. File Size Validation (Strict 5MB Limit - NO restriction on image width/height)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const selectedMb = (file.size / (1024 * 1024)).toFixed(1);
      setValidationError(`Image upload failed. Selected size: ${selectedMb} MB. Maximum allowed: ${MAX_IMAGE_SIZE_MB} MB. Please select a smaller image.`);
      return;
    }

    setLocalFile(file);
    setFileFormat(ext || mime.split('/')[1]?.toUpperCase() || 'IMAGE');

    // Create local preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Read Dimensions (all dimensions allowed)
    const dims = await getImageDimensions(objectUrl);
    if (dims.width > 0 && dims.height > 0) {
      setDimensions(dims);
    }

    // Upload file to backend fstore
    try {
      setIsUploading(true);
      setUploadProgress(10);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('directory', directory);

      const response = await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          }
        },
      });

      if (response.data && response.data.data) {
        const storedUrl = response.data.data.url || response.data.data.filePath;
        setUploadProgress(100);
        onChange(storedUrl);
        setPreviewUrl(objectUrl || getImageUrl(storedUrl));
      } else {
        throw new Error('Invalid response from upload server');
      }
    } catch (err: any) {
      console.error('Upload to fstore failed:', err);
      const serverMsg = err.response?.data?.message || 'Failed to upload image file to fstore.';
      setValidationError(serverMsg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || isUploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setLocalFile(null);
    setPreviewUrl('');
    setDimensions(null);
    setFileFormat('');
    setValidationError(null);
    setHasImageError(false);
    setUploadProgress(0);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Field Label */}
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          {helpText && (
            <span className="text-[11px] text-slate-400 font-normal">{helpText}</span>
          )}
        </div>
      )}

      {/* Native Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        disabled={disabled || isUploading}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
          }
        }}
      />

      {/* Upload Dropzone (Shown if no image selected) */}
      {!previewUrl && (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
          className={cn(
            'border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-900/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20',
            (disabled || isUploading) && 'opacity-60 cursor-not-allowed'
          )}
        >
          <div className="flex items-center gap-3.5 text-left">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-inner">
              {isUploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Upload className="w-5 h-5" />
              )}
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {isUploading ? 'Uploading to fstore storage...' : 'Select an image to upload'}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Supports JPG, JPEG, PNG, or WEBP • Maximum image size: 5 MB
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-600 text-white shadow-sm">
              Max: 5 MB
            </span>
          </div>
        </div>
      )}

      {/* Upload Progress Bar */}
      {isUploading && (
        <div className="space-y-1.5 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
          <div className="flex items-center justify-between text-xs font-semibold text-indigo-700 dark:text-indigo-300">
            <span className="flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading image to server storage...
            </span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-indigo-200 dark:bg-indigo-900 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Selected / Existing Image Preview & Metadata Card */}
      {previewUrl && !isUploading && (
        <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950/5 dark:bg-slate-900 p-3.5 shadow-sm flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-3.5">
            {/* Left Side: Image Preview Box */}
            <div className="relative w-full sm:w-36 h-28 shrink-0 overflow-hidden rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
              {!hasImageError ? (
                <img
                  src={previewUrl}
                  alt="Uploaded preview"
                  onError={() => setHasImageError(true)}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-2 text-center text-slate-400 space-y-1">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  <span className="text-[11px] font-semibold text-slate-300">Image unavailable</span>
                </div>
              )}
            </div>

            {/* Right Side: Image Metadata */}
            <div className="flex-1 min-w-0 space-y-1.5 w-full text-xs">
              <div className="font-bold text-slate-900 dark:text-white truncate">
                <span className="text-slate-400 font-normal">File: </span>
                <span className="font-mono">{localFile ? localFile.name : previewUrl.split('/').pop()}</span>
              </div>

              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-slate-600 dark:text-slate-400 text-xs">
                {localFile && (
                  <div>Size: <span className="font-semibold text-slate-800 dark:text-slate-200">{formatFileSize(localFile.size)}</span></div>
                )}
                {dimensions && dimensions.width > 0 && (
                  <div>Dims: <span className="font-semibold text-slate-800 dark:text-slate-200">{dimensions.width}×{dimensions.height} px</span></div>
                )}
                {fileFormat && (
                  <div>Format: <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{fileFormat}</span></div>
                )}
                <div className="text-emerald-500 font-semibold flex items-center gap-1 col-span-2">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Max Size: 5 MB (Valid)
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons: Full-width container with flex row and full button visibility */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading}
              className="h-8 text-xs font-semibold px-3"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Replace Image
            </Button>

            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleRemoveImage}
              disabled={disabled || isUploading}
              className="h-8 text-xs font-semibold px-3"
            >
              <X className="w-3.5 h-3.5 mr-1.5" />
              Remove
            </Button>
          </div>
        </div>
      )}

      {/* Validation / Error Box */}
      {(validationError || error) && (
        <div className="flex items-start gap-2 text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="block font-bold">❌ Image Upload Error</span>
            <span className="block font-normal">{validationError || error}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Backwards compatibility alias
export const ImageInput = ImageUploader;
