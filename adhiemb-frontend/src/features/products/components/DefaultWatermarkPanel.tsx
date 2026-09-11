import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RotateCcw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface WatermarkConfig {
  text: string;
  fontFamily: string;
  color: string;
  opacity: number; // 0 to 100
  size: number; // 10 to 100
  spacing: number; // 20 to 300 (% gap between watermark names)
}

export const DEFAULT_WATERMARK_CONFIG: WatermarkConfig = {
  text: 'ADHIEMB',
  fontFamily: 'Poppins, sans-serif',
  color: '#FFFFFF',
  opacity: 30,
  size: 36,
  spacing: 120,
};

interface DefaultWatermarkPanelProps {
  imageUrl: string;
  config?: WatermarkConfig;
  onChange?: (config: WatermarkConfig) => void;
}

export const DefaultWatermarkPanel: React.FC<DefaultWatermarkPanelProps> = ({
  imageUrl,
  config: externalConfig,
  onChange,
}) => {
  const [config, setConfig] = useState<WatermarkConfig>(
    externalConfig || DEFAULT_WATERMARK_CONFIG
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadedImg, setLoadedImg] = useState<HTMLImageElement | null>(null);

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

  // Render watermarked preview canvas with distinct word spacing & staggered rows
  const renderWatermark = useCallback(() => {
    if (!canvasRef.current || !loadedImg) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = loadedImg.naturalWidth || 400;
    const h = loadedImg.naturalHeight || 300;

    canvas.width = w;
    canvas.height = h;

    // Draw base image
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(loadedImg, 0, 0, w, h);

    if (!config.text.trim()) return;

    // Watermark styling
    const scaledFontSize = Math.max(16, Math.round((config.size / 100) * (w / 7)));
    ctx.font = `bold ${scaledFontSize}px ${config.fontFamily}`;
    ctx.fillStyle = config.color;
    ctx.globalAlpha = config.opacity / 100;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const textMetrics = ctx.measureText(config.text);
    const textWidth = textMetrics.width;
    const wordSpacing = ((config.spacing ?? 120) / 100) * textWidth;
    const stepX = textWidth + wordSpacing;
    const stepY = scaledFontSize * 3.5;

    // Draw repeated diagonal watermark pattern with generous name spacing
    ctx.save();
    ctx.rotate((-25 * Math.PI) / 180);

    let rowIndex = 0;
    for (let y = -h * 1.8; y < h * 2.8; y += stepY) {
      const offsetX = (rowIndex % 2) * (stepX / 2);
      for (let x = -w * 1.8 - stepX; x < w * 2.8; x += stepX) {
        ctx.fillText(config.text, x + offsetX, y);
      }
      rowIndex++;
    }

    ctx.restore();
    ctx.globalAlpha = 1.0;
  }, [loadedImg, config]);

  useEffect(() => {
    renderWatermark();
    if (onChange) {
      onChange(config);
    }
  }, [renderWatermark, onChange, config]);

  const handleReset = () => {
    setConfig(DEFAULT_WATERMARK_CONFIG);
  };

  const updateProp = <K extends keyof WatermarkConfig>(key: K, value: WatermarkConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4">
      {/* Notice Banner */}
      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
        <span>All images will have "ADHIEMB" watermark by default.</span>
      </div>

      <div className="space-y-3">
        <div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Default Watermark Preview
          </h4>
          <p className="text-[11px] text-slate-400">
            All uploaded images will include ADHIEMB watermark by default.
          </p>
        </div>

        {/* 3-Column Box: Original vs Watermarked + Settings Panel */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800">
          {/* Thumbnails Comparison (Col 7) */}
          <div className="md:col-span-7 flex items-center justify-between gap-2">
            {/* Original Image */}
            <div className="flex-1 space-y-1 text-center">
              <span className="text-[10px] font-bold text-slate-400 block">
                Original Image
              </span>
              <div className="rounded-xl overflow-hidden bg-slate-950 aspect-video flex items-center justify-center border border-slate-200 dark:border-slate-800">
                <img src={imageUrl} alt="Original" className="w-full h-full object-contain" />
              </div>
            </div>

            <span className="text-slate-400 font-bold text-sm">→</span>

            {/* With Watermark */}
            <div className="flex-1 space-y-1 text-center">
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 block truncate">
                With {config.text} Watermark
              </span>
              <div className="rounded-xl overflow-hidden bg-slate-950 aspect-video flex items-center justify-center border-2 border-indigo-500/50 shadow-md">
                <canvas ref={canvasRef} className="w-full h-full object-contain" />
              </div>
            </div>
          </div>

          {/* Watermark Settings Box (Col 5) */}
          <div className="md:col-span-5 p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-700">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Watermark Settings (Global Default)
              </span>
            </div>

            {/* Watermark Text */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500">Text</label>
              <input
                type="text"
                value={config.text}
                onChange={(e) => updateProp('text', e.target.value)}
                placeholder="ADHIEMB"
                className="w-full text-xs font-mono font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Font & Color Row */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">Font</label>
                <select
                  value={config.fontFamily}
                  onChange={(e) => updateProp('fontFamily', e.target.value)}
                  className="w-full text-[11px] font-semibold px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="Poppins, sans-serif">Poppins Bold</option>
                  <option value="Inter, sans-serif">Inter</option>
                  <option value="Roboto, sans-serif">Roboto</option>
                  <option value="Montserrat, sans-serif">Montserrat</option>
                  <option value="Oswald, sans-serif">Oswald</option>
                  <option value="Arial Black, sans-serif">Arial Black</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">Color</label>
                <div className="flex items-center gap-1.5 p-1 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900">
                  <input
                    type="color"
                    value={config.color}
                    onChange={(e) => updateProp('color', e.target.value)}
                    className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent"
                  />
                  <span className="text-[10px] font-mono font-bold truncate">
                    {config.color}
                  </span>
                </div>
              </div>
            </div>

            {/* Opacity Slider */}
            <div className="space-y-0.5">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                <span>Opacity</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">{config.opacity}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={config.opacity}
                onChange={(e) => updateProp('opacity', parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Size Slider */}
            <div className="space-y-0.5">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                <span>Size</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">{config.size}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={config.size}
                onChange={(e) => updateProp('size', parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Spacing / Gap Slider */}
            <div className="space-y-0.5">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                <span>Spacing (Gap)</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">{config.spacing ?? 120}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="300"
                value={config.spacing ?? 120}
                onChange={(e) => updateProp('spacing', parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Reset Button */}
            <div className="pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="w-full text-xs font-bold text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 py-1"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset to Default
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
