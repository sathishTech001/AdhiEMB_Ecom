import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  RotateCcw,
  Move,
  RefreshCw,
  Trash2,
  Copy,
  Info
} from 'lucide-react';
import { WatermarkConfig } from './DefaultWatermarkPanel';

export type PositionAnchor =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'middle-left'
  | 'center'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface TextEditorConfig {
  autoApply: boolean;
  textContent: string;
  fontFamily: string;
  fontSize: number;
  textColor: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  positionAnchor: PositionAnchor;
  rotation: number;
  customX?: number; // 0 to 1 ratio
  customY?: number; // 0 to 1 ratio
}

interface ImageTextEditorProps {
  imageUrl: string;
  productCode: string;
  watermarkConfig?: WatermarkConfig;
  config?: Partial<TextEditorConfig>;
  onChangeConfig?: (config: TextEditorConfig) => void;
  onCompositeGenerated?: (compositeDataUrl: string) => void;
}

export const FONT_FAMILIES = [
  { label: 'Poppins Bold', value: 'Poppins, sans-serif' },
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Roboto', value: 'Roboto, sans-serif' },
  { label: 'Montserrat', value: 'Montserrat, sans-serif' },
  { label: 'Oswald', value: 'Oswald, sans-serif' },
  { label: 'Arial Black', value: 'Arial Black, sans-serif' },
  { label: 'Fira Code', value: 'monospace' },
];

export const ImageTextEditor: React.FC<ImageTextEditorProps> = ({
  imageUrl,
  productCode,
  watermarkConfig,
  config: initialConfig,
  onChangeConfig,
  onCompositeGenerated,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Editor configuration state
  const [autoApply, setAutoApply] = useState<boolean>(initialConfig?.autoApply ?? true);
  const [textContent, setTextContent] = useState<string>(
    initialConfig?.textContent || productCode || 'ADHI-PRD-000123'
  );
  const [fontFamily, setFontFamily] = useState<string>(
    initialConfig?.fontFamily || FONT_FAMILIES[0].value
  );
  const [fontSize, setFontSize] = useState<number>(initialConfig?.fontSize || 48);
  const [textColor, setTextColor] = useState<string>(initialConfig?.textColor || '#FFFFFF');
  const [isBold, setIsBold] = useState<boolean>(initialConfig?.isBold ?? true);
  const [isItalic, setIsItalic] = useState<boolean>(initialConfig?.isItalic ?? false);
  const [isUnderline, setIsUnderline] = useState<boolean>(initialConfig?.isUnderline ?? false);
  const [positionAnchor, setPositionAnchor] = useState<PositionAnchor>(
    initialConfig?.positionAnchor || 'top-left'
  );
  const [rotation, setRotation] = useState<number>(initialConfig?.rotation || 0);

  // Custom dragged coordinates (0 to 1 ratio)
  const [customPos, setCustomPos] = useState<{ x: number; y: number } | null>(
    initialConfig?.customX !== undefined && initialConfig?.customY !== undefined
      ? { x: initialConfig.customX, y: initialConfig.customY }
      : null
  );

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [loadedImg, setLoadedImg] = useState<HTMLImageElement | null>(null);

  // Synchronize when external productCode prop changes
  useEffect(() => {
    if (productCode && !initialConfig?.textContent) {
      setTextContent(productCode);
    }
  }, [productCode, initialConfig?.textContent]);

  // Load image
  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
      setLoadedImg(img);
    };
  }, [imageUrl]);

  // Calculate pixel coordinates from 9-point anchor
  const getAnchorCoords = useCallback(
    (anchor: PositionAnchor, width: number, height: number, textWidth: number, textHeight: number) => {
      const padding = Math.max(30, Math.round(width * 0.05));
      let x = padding + textWidth / 2;
      let y = padding + textHeight / 2;

      switch (anchor) {
        case 'top-left':
          x = padding + textWidth / 2;
          y = padding + textHeight / 2;
          break;
        case 'top-center':
          x = width / 2;
          y = padding + textHeight / 2;
          break;
        case 'top-right':
          x = width - padding - textWidth / 2;
          y = padding + textHeight / 2;
          break;
        case 'middle-left':
          x = padding + textWidth / 2;
          y = height / 2;
          break;
        case 'center':
          x = width / 2;
          y = height / 2;
          break;
        case 'middle-right':
          x = width - padding - textWidth / 2;
          y = height / 2;
          break;
        case 'bottom-left':
          x = padding + textWidth / 2;
          y = height - padding - textHeight / 2;
          break;
        case 'bottom-center':
          x = width / 2;
          y = height - padding - textHeight / 2;
          break;
        case 'bottom-right':
          x = width - padding - textWidth / 2;
          y = height - padding - textHeight / 2;
          break;
      }
      return { x, y };
    },
    []
  );

  // Render watermarks layer
  const drawWatermarkLayer = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    if (!watermarkConfig || !watermarkConfig.text.trim()) return;

    ctx.save();
    const scaledWatermarkSize = Math.max(16, Math.round((watermarkConfig.size / 100) * (w / 7)));
    ctx.font = `bold ${scaledWatermarkSize}px ${watermarkConfig.fontFamily}`;
    ctx.fillStyle = watermarkConfig.color;
    ctx.globalAlpha = watermarkConfig.opacity / 100;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const textMetrics = ctx.measureText(watermarkConfig.text);
    const textWidth = textMetrics.width;
    const wordSpacing = ((watermarkConfig.spacing ?? 120) / 100) * textWidth;
    const stepX = textWidth + wordSpacing;
    const stepY = scaledWatermarkSize * 3.5;

    ctx.rotate((-25 * Math.PI) / 180);

    let rowIndex = 0;
    for (let y = -h * 1.8; y < h * 2.8; y += stepY) {
      const offsetX = (rowIndex % 2) * (stepX / 2);
      for (let x = -w * 1.8 - stepX; x < w * 2.8; x += stepX) {
        ctx.fillText(watermarkConfig.text, x + offsetX, y);
      }
      rowIndex++;
    }

    ctx.restore();
  }, [watermarkConfig]);

  // Draw main live canvas
  const renderCanvas = useCallback(() => {
    if (!canvasRef.current || !loadedImg) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = loadedImg.naturalWidth || 800;
    const h = loadedImg.naturalHeight || 800;

    canvas.width = w;
    canvas.height = h;

    // 1. Draw background image
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(loadedImg, 0, 0, w, h);

    // 2. Draw watermark layer
    drawWatermarkLayer(ctx, w, h);

    // 3. Draw product code text if autoApply is enabled
    if (autoApply && textContent.trim()) {
      let fontStyle = '';
      if (isItalic) fontStyle += 'italic ';
      if (isBold) fontStyle += 'bold ';
      const scaledFontSize = Math.round(fontSize * (w / 800));
      ctx.font = `${fontStyle}${scaledFontSize}px ${fontFamily}`;

      const metrics = ctx.measureText(textContent);
      const textW = metrics.width;
      const textH = scaledFontSize;

      let posX = 0;
      let posY = 0;

      if (customPos) {
        posX = customPos.x * w;
        posY = customPos.y * h;
      } else {
        const coords = getAnchorCoords(positionAnchor, w, h, textW, textH);
        posX = coords.x;
        posY = coords.y;
      }

      ctx.save();
      ctx.translate(posX, posY);
      ctx.rotate((rotation * Math.PI) / 180);

      // Contrast shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(textContent, 0, 0);

      if (isUnderline) {
        ctx.lineWidth = Math.max(2, Math.round(scaledFontSize / 12));
        ctx.strokeStyle = textColor;
        ctx.beginPath();
        ctx.moveTo(-textW / 2, textH / 2 + 4);
        ctx.lineTo(textW / 2, textH / 2 + 4);
        ctx.stroke();
      }

      // Interactive bounding box
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.85)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(-textW / 2 - 12, -textH / 2 - 8, textW + 24, textH + 16);

      // Handles
      ctx.setLineDash([]);
      ctx.fillStyle = '#6366f1';
      const corners = [
        [-textW / 2 - 12, -textH / 2 - 8],
        [textW / 2 + 12, -textH / 2 - 8],
        [-textW / 2 - 12, textH / 2 + 8],
        [textW / 2 + 12, textH / 2 + 8],
        [0, -textH / 2 - 20],
      ];
      corners.forEach(([cx, cy]) => {
        ctx.beginPath();
        ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      ctx.restore();
    }

    // Generate clean composite export
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = w;
    exportCanvas.height = h;
    const exportCtx = exportCanvas.getContext('2d');
    if (exportCtx) {
      exportCtx.drawImage(loadedImg, 0, 0, w, h);
      drawWatermarkLayer(exportCtx, w, h);

      if (autoApply && textContent.trim()) {
        let fontStyle = '';
        if (isItalic) fontStyle += 'italic ';
        if (isBold) fontStyle += 'bold ';
        const scaledFontSize = Math.round(fontSize * (w / 800));
        exportCtx.font = `${fontStyle}${scaledFontSize}px ${fontFamily}`;

        const metrics = exportCtx.measureText(textContent);
        const textW = metrics.width;
        const textH = scaledFontSize;

        let posX = 0;
        let posY = 0;

        if (customPos) {
          posX = customPos.x * w;
          posY = customPos.y * h;
        } else {
          const coords = getAnchorCoords(positionAnchor, w, h, textW, textH);
          posX = coords.x;
          posY = coords.y;
        }

        exportCtx.save();
        exportCtx.translate(posX, posY);
        exportCtx.rotate((rotation * Math.PI) / 180);
        exportCtx.shadowColor = 'rgba(0, 0, 0, 0.75)';
        exportCtx.shadowBlur = 6;
        exportCtx.shadowOffsetX = 2;
        exportCtx.shadowOffsetY = 2;
        exportCtx.fillStyle = textColor;
        exportCtx.textAlign = 'center';
        exportCtx.textBaseline = 'middle';
        exportCtx.fillText(textContent, 0, 0);

        if (isUnderline) {
          exportCtx.lineWidth = Math.max(2, Math.round(scaledFontSize / 12));
          exportCtx.strokeStyle = textColor;
          exportCtx.beginPath();
          exportCtx.moveTo(-textW / 2, textH / 2 + 4);
          exportCtx.lineTo(textW / 2, textH / 2 + 4);
          exportCtx.stroke();
        }
        exportCtx.restore();
      }

      const compUrl = exportCanvas.toDataURL('image/png');
      if (onCompositeGenerated) {
        onCompositeGenerated(compUrl);
      }
    }
  }, [
    loadedImg,
    autoApply,
    textContent,
    fontFamily,
    fontSize,
    textColor,
    isBold,
    isItalic,
    isUnderline,
    positionAnchor,
    rotation,
    customPos,
    getAnchorCoords,
    drawWatermarkLayer,
    onCompositeGenerated,
  ]);

  // Trigger render on config changes
  useEffect(() => {
    renderCanvas();

    if (onChangeConfig) {
      onChangeConfig({
        autoApply,
        textContent,
        fontFamily,
        fontSize,
        textColor,
        isBold,
        isItalic,
        isUnderline,
        positionAnchor,
        rotation,
        customX: customPos?.x,
        customY: customPos?.y,
      });
    }
  }, [renderCanvas, onChangeConfig, autoApply, textContent, fontFamily, fontSize, textColor, isBold, isItalic, isUnderline, positionAnchor, rotation, customPos]);

  // Dragging event handlers
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!autoApply) return;
    setIsDragging(true);
    updatePositionFromEvent(e);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !autoApply) return;
    updatePositionFromEvent(e);
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const updatePositionFromEvent = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0.05, Math.min(0.95, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0.05, Math.min(0.95, (e.clientY - rect.top) / rect.height));
    setCustomPos({ x, y });
  };

  const handleSelectAnchor = (anchor: PositionAnchor) => {
    setPositionAnchor(anchor);
    setCustomPos(null);
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-6">
      {/* Top Header with Auto Apply Toggle */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 flex-wrap gap-2">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Image Text Editor (Product Code on Design)
        </h3>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Auto Apply
          </span>
          <button
            type="button"
            onClick={() => setAutoApply(!autoApply)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              autoApply ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                autoApply ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-start gap-2">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <span>
          The product code is automatically added to the design image. You can edit the text, size, color and position as per your requirement.
        </span>
      </div>

      {/* Text Content Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
          <span>Text Content</span>
          <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
            ← Auto added product code
          </span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="ADHI-PRD-000123"
            className="w-full text-sm font-mono font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          {textContent !== productCode && productCode && (
            <button
              type="button"
              onClick={() => setTextContent(productCode)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              title="Reset to Product Code"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Typography Row: Font Family, Size, Color */}
      <div className="grid grid-cols-12 gap-3">
        {/* Font Family */}
        <div className="col-span-6 space-y-1">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Font Family
          </label>
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          >
            {FONT_FAMILIES.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        {/* Font Size */}
        <div className="col-span-3 space-y-1">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Font Size
          </label>
          <div className="flex items-center">
            <input
              type="number"
              min="16"
              max="120"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value) || 24)}
              className="w-full text-xs font-bold px-2.5 py-2 rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
            />
            <span className="text-[11px] px-2 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-500 rounded-r-xl font-mono">
              px
            </span>
          </div>
        </div>

        {/* Text Color */}
        <div className="col-span-3 space-y-1">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Text Color
          </label>
          <div className="flex items-center gap-1.5 p-1 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800">
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="w-6 h-6 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
            />
            <span className="text-[10px] font-mono font-bold uppercase truncate">
              {textColor}
            </span>
          </div>
        </div>
      </div>

      {/* Row: Text Style, 9-Point Position Grid & Rotation */}
      <div className="grid grid-cols-12 gap-4 items-start pt-1">
        {/* Style Toggles */}
        <div className="col-span-4 space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Text Style
          </label>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsBold(!isBold)}
              className={`w-9 h-9 rounded-xl font-extrabold text-sm flex items-center justify-center transition-all ${
                isBold
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
              title="Bold"
            >
              B
            </button>

            <button
              type="button"
              onClick={() => setIsItalic(!isItalic)}
              className={`w-9 h-9 rounded-xl italic font-bold text-sm flex items-center justify-center transition-all ${
                isItalic
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
              title="Italic"
            >
              I
            </button>

            <button
              type="button"
              onClick={() => setIsUnderline(!isUnderline)}
              className={`w-9 h-9 rounded-xl underline font-bold text-sm flex items-center justify-center transition-all ${
                isUnderline
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
              title="Underline"
            >
              U
            </button>
          </div>
        </div>

        {/* 9-Point Positioning Grid */}
        <div className="col-span-4 space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Text Position (9-point grid)
          </label>
          <div className="inline-grid grid-cols-3 gap-1.5 p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
            {(
              [
                'top-left',
                'top-center',
                'top-right',
                'middle-left',
                'center',
                'middle-right',
                'bottom-left',
                'bottom-center',
                'bottom-right',
              ] as PositionAnchor[]
            ).map((anchor) => {
              const isSelected = positionAnchor === anchor && !customPos;
              return (
                <button
                  key={anchor}
                  type="button"
                  onClick={() => handleSelectAnchor(anchor)}
                  className={`w-6 h-6 rounded-md transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md scale-105 ring-2 ring-indigo-400'
                      : 'bg-white dark:bg-slate-700 hover:bg-indigo-100 dark:hover:bg-slate-600 text-slate-400'
                  }`}
                  title={anchor}
                />
              );
            })}
          </div>
        </div>

        {/* Rotation Slider */}
        <div className="col-span-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-700 dark:text-slate-300">Rotation</span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400">{rotation}°</span>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input
              type="range"
              min="-180"
              max="180"
              value={rotation}
              onChange={(e) => setRotation(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <button
              type="button"
              onClick={() => setRotation(0)}
              className="text-slate-400 hover:text-slate-600 p-1"
              title="Reset Rotation"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* LIVE PREVIEW CANVAS STAGE */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
            Live Preview
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setTextContent('')}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
              title="Clear Text"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setTextContent(productCode || 'ADHI-PRD-000123');
                setCustomPos(null);
                setPositionAnchor('top-left');
                setRotation(0);
              }}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition-colors"
              title="Reset"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Canvas Display */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-inner group">
          <canvas
            ref={canvasRef}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            className={`w-full h-full object-contain ${autoApply ? 'cursor-move' : ''}`}
          />

          {autoApply && (
            <div className="absolute bottom-2 left-2 pointer-events-none bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-semibold text-slate-300 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Move className="w-3 h-3 text-indigo-400" /> Click & Drag text to reposition
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
