import React, { useState, useRef, useEffect } from 'react';
import {
  Paintbrush,
  Eraser,
  Square,
  Lasso,
  Hand,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  Trash2,
  Download,
  Check,
  X,
  Sparkles,
  Info,
  Eye,
  EyeOff,
  Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import { inpaintImageData } from '@/lib/inpainting.utils';
import { apiClient } from '@/lib/axios';

type ToolMode = 'brush' | 'eraser' | 'rectangle' | 'lasso' | 'move';

interface ImageMaskEditorProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  fileName?: string;
  onSaveCleanedImage: (cleanedImageUrl: string, cleanedBlob: Blob) => void;
}

export const ImageMaskEditor: React.FC<ImageMaskEditorProps> = ({
  isOpen,
  onClose,
  imageUrl,
  fileName = 'design_image.png',
  onSaveCleanedImage,
}) => {
  // Canvas refs
  const containerRef = useRef<HTMLDivElement>(null);
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);

  // Tools state
  const [activeTool, setActiveTool] = useState<ToolMode>('brush');
  const [brushSize, setBrushSize] = useState<number>(30);
  const [brushHardness, setBrushHardness] = useState<number>(70);
  const [maskColor, setMaskColor] = useState<string>('#ef4444');
  const [showMaskOverlay, setShowMaskOverlay] = useState<boolean>(true);

  // Canvas Transform (Pan & Zoom)
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Drawing state
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [rectStart, setRectStart] = useState<{ x: number; y: number } | null>(null);
  const [lassoPoints, setLassoPoints] = useState<{ x: number; y: number }[]>([]);

  // History for Undo / Redo
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Inpainting & Output
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [cleanedImageUrl, setCleanedImageUrl] = useState<string | null>(null);
  const [cleanedBlob, setCleanedBlob] = useState<Blob | null>(null);
  const [previewTab, setPreviewTab] = useState<'original' | 'masked'>('masked');
  const [maskAppliedSuccess, setMaskAppliedSuccess] = useState<boolean>(false);

  // Image natural dimensions
  const [imgDim, setImgDim] = useState<{ width: number; height: number }>({ width: 800, height: 800 });

  // Load image on open
  useEffect(() => {
    if (!isOpen || !imageUrl) return;

    setMaskAppliedSuccess(false);
    setCleanedImageUrl(null);
    setCleanedBlob(null);
    setHistory([]);
    setHistoryIndex(-1);
    setZoom(1);
    setPan({ x: 0, y: 0 });

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
      const w = img.naturalWidth || 800;
      const h = img.naturalHeight || 800;
      setImgDim({ width: w, height: h });

      // Initialize base image canvas
      if (imageCanvasRef.current && maskCanvasRef.current) {
        imageCanvasRef.current.width = w;
        imageCanvasRef.current.height = h;
        maskCanvasRef.current.width = w;
        maskCanvasRef.current.height = h;

        const imgCtx = imageCanvasRef.current.getContext('2d');
        if (imgCtx) {
          imgCtx.clearRect(0, 0, w, h);
          imgCtx.drawImage(img, 0, 0, w, h);
        }

        const maskCtx = maskCanvasRef.current.getContext('2d');
        if (maskCtx) {
          maskCtx.clearRect(0, 0, w, h);
          saveStateToHistory(maskCtx, w, h);
        }
      }
    };
  }, [isOpen, imageUrl]);

  const saveStateToHistory = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const currentState = ctx.getImageData(0, 0, w, h);
    setHistory((prev) => {
      const updated = prev.slice(0, historyIndex + 1);
      return [...updated, currentState];
    });
    setHistoryIndex((prev) => prev + 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0 && maskCanvasRef.current) {
      const newIndex = historyIndex - 1;
      const maskCtx = maskCanvasRef.current.getContext('2d');
      if (maskCtx) {
        maskCtx.putImageData(history[newIndex], 0, 0);
        setHistoryIndex(newIndex);
      }
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1 && maskCanvasRef.current) {
      const newIndex = historyIndex + 1;
      const maskCtx = maskCanvasRef.current.getContext('2d');
      if (maskCtx) {
        maskCtx.putImageData(history[newIndex], 0, 0);
        setHistoryIndex(newIndex);
      }
    }
  };

  const handleClearMask = () => {
    if (maskCanvasRef.current) {
      const maskCtx = maskCanvasRef.current.getContext('2d');
      if (maskCtx) {
        maskCtx.clearRect(0, 0, imgDim.width, imgDim.height);
        saveStateToHistory(maskCtx, imgDim.width, imgDim.height);
        setMaskAppliedSuccess(false);
      }
    }
  };

  // Canvas Mouse Coordinates Helper
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!maskCanvasRef.current) return { x: 0, y: 0 };
    const rect = maskCanvasRef.current.getBoundingClientRect();
    const scaleX = imgDim.width / rect.width;
    const scaleY = imgDim.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  // Drawing Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'move') {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    const { x, y } = getCanvasCoords(e);
    setIsDrawing(true);

    const maskCtx = maskCanvasRef.current?.getContext('2d');
    if (!maskCtx) return;

    if (activeTool === 'brush') {
      maskCtx.beginPath();
      maskCtx.moveTo(x, y);
      maskCtx.lineCap = 'round';
      maskCtx.lineJoin = 'round';
      maskCtx.lineWidth = brushSize;
      maskCtx.strokeStyle = maskColor;
      maskCtx.globalCompositeOperation = 'source-over';
      maskCtx.lineTo(x + 0.1, y + 0.1);
      maskCtx.stroke();
    } else if (activeTool === 'eraser') {
      maskCtx.beginPath();
      maskCtx.moveTo(x, y);
      maskCtx.lineCap = 'round';
      maskCtx.lineJoin = 'round';
      maskCtx.lineWidth = brushSize;
      maskCtx.globalCompositeOperation = 'destination-out';
      maskCtx.lineTo(x + 0.1, y + 0.1);
      maskCtx.stroke();
    } else if (activeTool === 'rectangle') {
      setRectStart({ x, y });
    } else if (activeTool === 'lasso') {
      setLassoPoints([{ x, y }]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning && activeTool === 'move') {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
      return;
    }

    if (!isDrawing) return;

    const { x, y } = getCanvasCoords(e);
    const maskCtx = maskCanvasRef.current?.getContext('2d');
    if (!maskCtx) return;

    if (activeTool === 'brush' || activeTool === 'eraser') {
      maskCtx.lineTo(x, y);
      maskCtx.stroke();
    } else if (activeTool === 'lasso') {
      setLassoPoints((prev) => [...prev, { x, y }]);
      maskCtx.lineTo(x, y);
      maskCtx.stroke();
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (!isDrawing) return;
    setIsDrawing(false);

    const maskCtx = maskCanvasRef.current?.getContext('2d');
    if (!maskCtx) return;

    if (activeTool === 'rectangle' && rectStart) {
      const { x, y } = getCanvasCoords(e);
      const rx = Math.min(rectStart.x, x);
      const ry = Math.min(rectStart.y, y);
      const rw = Math.abs(x - rectStart.x);
      const rh = Math.abs(y - rectStart.y);

      maskCtx.fillStyle = maskColor;
      maskCtx.globalCompositeOperation = 'source-over';
      maskCtx.fillRect(rx, ry, rw, rh);
      setRectStart(null);
    } else if (activeTool === 'lasso' && lassoPoints.length > 2) {
      maskCtx.beginPath();
      maskCtx.moveTo(lassoPoints[0].x, lassoPoints[0].y);
      for (let i = 1; i < lassoPoints.length; i++) {
        maskCtx.lineTo(lassoPoints[i].x, lassoPoints[i].y);
      }
      maskCtx.closePath();
      maskCtx.fillStyle = maskColor;
      maskCtx.globalCompositeOperation = 'source-over';
      maskCtx.fill();
      setLassoPoints([]);
    }

    saveStateToHistory(maskCtx, imgDim.width, imgDim.height);
  };

  // Zoom controls
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 4));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Execute Inpainting
  const handleApplyMask = async () => {
    if (!imageCanvasRef.current || !maskCanvasRef.current) {
      toast.error('Canvas not initialized');
      return;
    }

    setIsProcessing(true);
    setMaskAppliedSuccess(false);

    try {
      const imgCtx = imageCanvasRef.current.getContext('2d');
      const maskCtx = maskCanvasRef.current.getContext('2d');

      if (!imgCtx || !maskCtx) throw new Error('Could not access canvas context');

      // 1. Client-Side instant inpainting using Telea Fast-Marching
      const inpaintRadius = Math.max(3, Math.round(brushSize / 8));
      const cleanedImageData = inpaintImageData(
        imgCtx,
        maskCtx,
        imgDim.width,
        imgDim.height,
        { radius: inpaintRadius }
      );

      // Render to temporary canvas to create blob and dataURL
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = imgDim.width;
      tempCanvas.height = imgDim.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCtx.putImageData(cleanedImageData, 0, 0);
      }

      const clientDataUrl = tempCanvas.toDataURL('image/png');
      setCleanedImageUrl(clientDataUrl);

      tempCanvas.toBlob((blob) => {
        if (blob) setCleanedBlob(blob);
      }, 'image/png');

      // 2. Also execute server inpainting in background to persist cleanly in Fstore
      try {
        const maskDataUrl = maskCanvasRef.current.toDataURL('image/png');
        const res = await apiClient.post('/api/products/images/mask/apply', {
          originalImageUrl: imageUrl,
          maskImageBase64: maskDataUrl,
          inpaintRadius: inpaintRadius,
          fileName: fileName,
        });

        if (res.data?.success && res.data?.data?.maskedImageUrl) {
          setCleanedImageUrl(res.data.data.maskedImageUrl);
        }
      } catch (srvErr) {
        console.warn('Server inpainting fallback used client data URL:', srvErr);
      }

      setMaskAppliedSuccess(true);
      setPreviewTab('masked');
      toast.success('Mask applied successfully! Unwanted areas removed.');
    } catch (err: any) {
      toast.error('Inpainting failed: ' + (err.message || 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!cleanedImageUrl) {
      toast.error('Apply mask first before downloading');
      return;
    }
    const a = document.createElement('a');
    a.href = cleanedImageUrl;
    a.download = `cleaned_${fileName}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Cleaned image downloaded');
  };

  const handleSaveAndApply = () => {
    if (!cleanedImageUrl || !cleanedBlob) {
      toast.error('Please apply mask to generate the cleaned image first.');
      return;
    }
    onSaveCleanedImage(cleanedImageUrl, cleanedBlob);
    toast.success('Cleaned image saved to product gallery!');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-hidden animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-7xl max-h-[96vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* TOP HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Edit Image — <span className="font-mono text-indigo-600 dark:text-indigo-400">{fileName}</span>
              </h2>
              <p className="text-xs text-slate-400">
                Use mask tools to remove text, watermark, or unwanted areas from the image.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="rounded-xl">
              <X className="w-4 h-4 mr-1" /> Close
            </Button>
          </div>
        </div>

        {/* TOP TOOLS BAR */}
        <div className="flex items-center justify-between px-6 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto gap-2">
          {/* Tool switchers */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <button
              onClick={() => setActiveTool('brush')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTool === 'brush'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
            >
              <Paintbrush className="w-4 h-4" /> Mask Brush
            </button>

            <button
              onClick={() => setActiveTool('eraser')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTool === 'eraser'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
            >
              <Eraser className="w-4 h-4" /> Eraser
            </button>

            <button
              onClick={() => setActiveTool('rectangle')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTool === 'rectangle'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
            >
              <Square className="w-4 h-4" /> Rectangle
            </button>

            <button
              onClick={() => setActiveTool('lasso')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTool === 'lasso'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
            >
              <Lasso className="w-4 h-4" /> Lasso
            </button>

            <button
              onClick={() => setActiveTool('move')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTool === 'move'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
            >
              <Hand className="w-4 h-4" /> Move / Pan
            </button>
          </div>

          {/* Zoom, Undo, Redo, Reset */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl p-0.5 bg-slate-50 dark:bg-slate-800/50">
              <button
                onClick={handleZoomOut}
                className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-white dark:hover:bg-slate-700"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono font-bold px-2 text-slate-700 dark:text-slate-300">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-white dark:hover:bg-slate-700"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-white dark:hover:bg-slate-700 ml-1"
                title="Reset Zoom"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1" />

            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Undo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Redo"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            <button
              onClick={handleClearMask}
              className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              title="Reset Mask"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MAIN BODY: 3-Column Layout (Settings, Canvas, Preview) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-0 bg-slate-100/60 dark:bg-slate-950/60">
          {/* LEFT COLUMN: Settings & Guide (Col 3) */}
          <div className="lg:col-span-3 p-5 border-r border-slate-200 dark:border-slate-800 space-y-6 overflow-y-auto bg-white dark:bg-slate-900">
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                Mask Settings
              </h3>

              {/* Brush Size Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">Brush Size</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{brushSize}px</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="120"
                  value={brushSize}
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Brush Hardness */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">Brush Hardness</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{brushHardness}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={brushHardness}
                  onChange={(e) => setBrushHardness(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Mask Color Picker */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Mask Overlay Color
                </span>
                <div className="flex items-center gap-2">
                  {['#ef4444', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b'].map((c) => (
                    <button
                      key={c}
                      onClick={() => setMaskColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        maskColor === c ? 'scale-125 ring-2 ring-indigo-500 ring-offset-2' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Preview Mode Toggle */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  {showMaskOverlay ? <Eye className="w-4 h-4 text-indigo-500" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                  Show Mask Overlay
                </span>
                <button
                  type="button"
                  onClick={() => setShowMaskOverlay(!showMaskOverlay)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    showMaskOverlay ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      showMaskOverlay ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* How to use Guide Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-indigo-500" /> How to use
              </h4>
              <ol className="text-xs text-slate-500 dark:text-slate-400 space-y-2 list-decimal list-inside leading-relaxed">
                <li><strong className="text-slate-700 dark:text-slate-300">Select Mask tool</strong> (Brush, Rect, or Lasso).</li>
                <li><strong className="text-slate-700 dark:text-slate-300">Brush / Drag</strong> over unwanted text or watermark.</li>
                <li>Click <strong className="text-indigo-600 dark:text-indigo-400">"Apply Mask"</strong> to clean the image.</li>
                <li>Preview and click <strong className="text-slate-700 dark:text-slate-300">"Save as Product Image"</strong>.</li>
              </ol>
            </div>
          </div>

          {/* CENTER COLUMN: Canvas Stage (Col 6) */}
          <div
            ref={containerRef}
            className="lg:col-span-6 relative overflow-hidden flex items-center justify-center p-4 select-none bg-slate-950"
            style={{
              backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          >
            <div
              className="relative transition-transform duration-75 shadow-2xl rounded-2xl overflow-hidden"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: 'center center',
                width: `${imgDim.width}px`,
                height: `${imgDim.height}px`,
                maxWidth: '100%',
                maxHeight: '100%',
                aspectRatio: `${imgDim.width} / ${imgDim.height}`,
              }}
            >
              {/* Layer 1: Base Image */}
              <canvas
                ref={imageCanvasRef}
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              />

              {/* Layer 2: Mask Drawing Overlay */}
              <canvas
                ref={maskCanvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className={`absolute inset-0 w-full h-full object-contain ${
                  showMaskOverlay ? 'opacity-85' : 'opacity-0'
                } ${activeTool === 'move' ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'}`}
              />
            </div>
          </div>

          {/* RIGHT COLUMN: Preview & Action Panel (Col 3) */}
          <div className="lg:col-span-3 p-5 border-l border-slate-200 dark:border-slate-800 space-y-5 overflow-y-auto bg-white dark:bg-slate-900 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  Live Preview
                </h3>
                <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <button
                    onClick={() => setPreviewTab('original')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                      previewTab === 'original'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500'
                    }`}
                  >
                    Original
                  </button>
                  <button
                    onClick={() => setPreviewTab('masked')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                      previewTab === 'masked'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-500'
                    }`}
                  >
                    Masked
                  </button>
                </div>
              </div>

              {/* Preview Box */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-square bg-slate-950 flex items-center justify-center shadow-inner">
                {previewTab === 'original' || !cleanedImageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Original"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img
                    src={cleanedImageUrl}
                    alt="Cleaned"
                    className="w-full h-full object-contain animate-fadeIn"
                  />
                )}

                {previewTab === 'masked' && !cleanedImageUrl && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/70 p-4 text-center">
                    <Paintbrush className="w-8 h-8 text-indigo-400 mb-2 opacity-80" />
                    <p className="text-xs font-semibold text-slate-300">
                      Paint over unwanted text and click "Apply Mask"
                    </p>
                  </div>
                )}
              </div>

              {/* Mask Applied Banner */}
              {maskAppliedSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Mask applied successfully! The unwanted area has been removed.</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClearMask}
                  className="w-full rounded-xl text-xs"
                >
                  Clear Mask
                </Button>

                <Button
                  type="button"
                  size="sm"
                  isLoading={isProcessing}
                  onClick={handleApplyMask}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1" /> Apply Mask
                </Button>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={!cleanedImageUrl}
                className="w-full rounded-xl text-xs"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" /> Download Image
              </Button>

              <Button
                type="button"
                size="lg"
                disabled={!cleanedImageUrl}
                onClick={handleSaveAndApply}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/25"
              >
                <Check className="w-4 h-4 mr-2" /> Save as Product Image
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
