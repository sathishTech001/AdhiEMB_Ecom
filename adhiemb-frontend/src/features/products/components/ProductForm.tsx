import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Ruler, 
  UploadCloud, 
  Upload,
  Image as ImageIcon, 
  Check, 
  Trash2, 
  Send, 
  Save,
  Star,
  AlertCircle,
  Hash,
  X,
  Sparkles,
  RefreshCw,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/forms/FormField';
import { FormSelect } from '@/components/forms/FormSelect';
import { Badge } from '@/components/ui/Badge';
import { ImageInput } from '@/components/ui/ImageInput';
import { ImageMaskEditor } from './ImageMaskEditor';
import { ImageTextEditor } from './ImageTextEditor';
import { DefaultWatermarkPanel, WatermarkConfig, DEFAULT_WATERMARK_CONFIG } from './DefaultWatermarkPanel';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/axios';
import { useCategoriesQuery } from '@/features/categories/hooks/useCategories';
import { MachineFormat, ProductDetail, CreateProductData, ProductFile, DESIGN_TYPES } from '../types/product.types';
import toast from 'react-hot-toast';

const MACHINE_FORMATS: MachineFormat[] = ['DST', 'PES', 'EXP', 'JEF', 'EMB', 'VP3', 'HUS', 'XXX'];
const SUPPORTED_MANUAL_FORMATS = ['DST', 'PES', 'EXP', 'JEF', 'EMB', 'VP3', 'HUS', 'XXX', 'ZIP'] as const;

const generateUniqueProductCode = () => {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `ADHI-PRD-${randomNum}`;
};

const slugify = (text?: string | null) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

const generateProductCode = (title: string) => {
  if (!title) return generateUniqueProductCode();
  const clean = title.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 6);
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  return clean ? `ADHI-PRD-${clean}${randomSuffix}` : generateUniqueProductCode();
};

const productSchema = z.object({
  title: z.string().trim().min(1, 'Product title is required'),
  productCode: z.string().trim().min(1, 'Product code is required'),
  slug: z.string().optional(),
  description: z.string().trim().min(1, 'Description is required'),
  categoryId: z.string().min(1, 'Please select a category'),
  designType: z.string().min(1, 'Please select a design type'),
  stitchCount: z.coerce.number().min(1, 'Stitch count must be at least 1'),
  widthMm: z.coerce.number().min(1, 'Width must be at least 1mm'),
  heightMm: z.coerce.number().min(1, 'Height must be at least 1mm'),
  colorCount: z.coerce.number().min(1, 'Color count must be at least 1'),
  stopCount: z.coerce.number().min(0, 'Stop count must be 0 or greater'),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialValues?: Partial<ProductDetail>;
  onSubmit: (data: CreateProductData, status: 'DRAFT' | 'PENDING_APPROVAL') => Promise<void>;
  isLoading?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialValues,
  onSubmit,
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const [selectedFormats, setSelectedFormats] = useState<MachineFormat[]>(
    initialValues?.formats || ['DST', 'PES', 'EXP', 'JEF', 'EMB']
  );
  const [images, setImages] = useState<string[]>(
    initialValues?.images?.map((img) => (typeof img === 'string' ? img : (img.imageUrl || img.url || ''))).filter(Boolean) ||
    (initialValues?.primaryImage ? [initialValues.primaryImage] : [])
  );
  const [newImageUrl, setNewImageUrl] = useState('');
  const [files, setFiles] = useState<ProductFile[]>(initialValues?.files || []);
  const [machineFilesError, setMachineFilesError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [editingImage, setEditingImage] = useState<{ url: string; index?: number; fileName?: string } | null>(null);
  const [stampedImageUrl, setStampedImageUrl] = useState<string | null>(null);
  const [watermarkConfig, setWatermarkConfig] = useState<WatermarkConfig>(DEFAULT_WATERMARK_CONFIG);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: categories = [] } = useCategoriesQuery();

  const categoryOptions = [
    { label: 'Select Category...', value: '' },
    ...categories.map((c) => ({ label: c.name, value: String(c.id) })),
  ];

  const designTypeOptions = [
    { label: 'Select Design Type...', value: '' },
    ...DESIGN_TYPES.map((dt) => ({ label: dt, value: dt })),
  ];

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    mode: 'onChange',
    defaultValues: {
      title: initialValues?.title || '',
      productCode: initialValues?.productCode || (initialValues?.title ? generateProductCode(initialValues.title) : generateUniqueProductCode()),
      slug: initialValues?.slug || '',
      description: initialValues?.description || '',
      categoryId: initialValues?.categoryId ? String(initialValues.categoryId) : '',
      designType: initialValues?.designType || 'Neck Design',
      stitchCount: initialValues?.stitchCount || 12500,
      widthMm: initialValues?.widthMm || 120,
      heightMm: initialValues?.heightMm || 95,
      colorCount: initialValues?.colorCount || 6,
      stopCount: initialValues?.stopCount || 8,
    },
  });

  const watchedProductCode = watch('productCode') || '';

  useEffect(() => {
    if (initialValues && (initialValues.id || initialValues.title)) {
      reset({
        title: initialValues.title || '',
        productCode: initialValues.productCode || '',
        slug: initialValues.slug || '',
        description: initialValues.description || '',
        categoryId: initialValues.categoryId ? String(initialValues.categoryId) : '',
        designType: initialValues.designType || 'Neck Design',
        stitchCount: initialValues.stitchCount || 12500,
        widthMm: initialValues.widthMm || 120,
        heightMm: initialValues.heightMm || 95,
        colorCount: initialValues.colorCount || 6,
        stopCount: initialValues.stopCount || 8,
      });

      if (initialValues.images && initialValues.images.length > 0) {
        setImages(
          initialValues.images
            .map((img) => (typeof img === 'string' ? img : (img.imageUrl || img.url || '')))
            .filter(Boolean)
        );
      } else if (initialValues.primaryImage || (initialValues as any).primaryImageUrl) {
        setImages([initialValues.primaryImage || (initialValues as any).primaryImageUrl]);
      }

      if (initialValues.files && initialValues.files.length > 0) {
        setFiles(initialValues.files);
      }

      if (initialValues.formats && initialValues.formats.length > 0) {
        setSelectedFormats(initialValues.formats);
      } else if ((initialValues as any).availableFormats && (initialValues as any).availableFormats.length > 0) {
        setSelectedFormats((initialValues as any).availableFormats);
      }
    }
  }, [initialValues, reset]);

  const toggleFormat = (format: MachineFormat) => {
    if (selectedFormats.includes(format)) {
      setSelectedFormats(selectedFormats.filter((f) => f !== format));
    } else {
      setSelectedFormats([...selectedFormats, format]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    if (imageError) setImageError(null);
  };

  const handleDeviceFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const newAttachedFiles: ProductFile[] = [];
    const updatedFormats: MachineFormat[] = [...selectedFormats];
    const existingNamesLower = new Set(
      files.map((f) => (f.fileName || f.originalFileName || '').trim().toLowerCase()).filter(Boolean)
    );
    let duplicateFound = false;
    let unsupportedFound = false;

    Array.from(selectedFiles).forEach((f) => {
      const cleanOriginalName = f.name.trim();
      const lowerName = cleanOriginalName.toLowerCase();

      // 1. Case-insensitive duplicate check
      if (existingNamesLower.has(lowerName)) {
        duplicateFound = true;
        return;
      }

      // 2. Format validation from extension
      const lastDotIndex = cleanOriginalName.lastIndexOf('.');
      if (lastDotIndex === -1) {
        unsupportedFound = true;
        return;
      }

      const ext = cleanOriginalName.substring(lastDotIndex + 1).toUpperCase();
      if (!SUPPORTED_MANUAL_FORMATS.includes(ext as any)) {
        unsupportedFound = true;
        return;
      }

      existingNamesLower.add(lowerName);

      const defaultPrice = 25;

      newAttachedFiles.push({
        fileName: cleanOriginalName,
        originalFileName: cleanOriginalName,
        fileUrl: '#',
        filePath: cleanOriginalName,
        storageKey: cleanOriginalName,
        format: ext,
        fileFormat: ext as any,
        fileSize: f.size,
        fileSizeBytes: f.size,
        machineInfo: 'Standard',
        price: defaultPrice,
      });

      if (
        ext !== 'ZIP' &&
        MACHINE_FORMATS.includes(ext as MachineFormat) &&
        !updatedFormats.includes(ext as MachineFormat)
      ) {
        updatedFormats.push(ext as MachineFormat);
      }
    });

    if (duplicateFound) {
      toast.error('Duplicate machine files were ignored.');
    }
    if (unsupportedFound) {
      toast.error('Some files were ignored because of unsupported format.');
    }

    if (newAttachedFiles.length > 0) {
      setFiles((prev) => [...prev, ...newAttachedFiles]);
      setSelectedFormats(updatedFormats);
      setMachineFilesError(null);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const updateFileProp = (index: number, field: keyof ProductFile, val: any) => {
    setFiles((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const removeFile = (index: number) => {
    const removedFile = files[index];
    const remainingFiles = files.filter((_, i) => i !== index);
    setFiles(remainingFiles);

    // Update compatible formats if this format is no longer present
    if (removedFile && removedFile.format) {
      const formatStillExists = remainingFiles.some(
        (f) => f.format?.toUpperCase() === removedFile.format?.toUpperCase()
      );
      if (!formatStillExists && MACHINE_FORMATS.includes(removedFile.format as MachineFormat)) {
        setSelectedFormats((prev) => prev.filter((fmt) => fmt !== removedFile.format));
      }
    }
  };

  // Handler for Save Draft (Minimum validation: Title, Product Code, at least 1 Machine File)
  const handleSaveDraft = async () => {
    let hasError = false;
    const currentTitle = getValues('title')?.trim();
    const currentCode = getValues('productCode')?.trim();

    if (!currentTitle) {
      setError('title', { type: 'manual', message: 'Product title is required' });
      hasError = true;
    }

    if (!currentCode) {
      setError('productCode', { type: 'manual', message: 'Product code is required' });
      hasError = true;
    }

    if (files.length === 0) {
      setMachineFilesError('At least one machine file is required.');
      hasError = true;
    } else {
      const invalidPriceFile = files.find(
        (f) => f.price === undefined || f.price === null || (f.price as any) === '' || isNaN(Number(f.price)) || Number(f.price) < 0
      );
      if (invalidPriceFile) {
        setMachineFilesError('Price is required and must be a valid non-negative number for every machine file.');
        hasError = true;
      }
    }

    if (hasError) {
      toast.error('Please resolve the required fields to save draft.');
      return;
    }

    const uploadBase64IfDataUrl = async (url: string): Promise<string> => {
      if (!url || !url.startsWith('data:')) return url;
      try {
        const res = await fetch(url);
        const blob = await res.blob();
        const formData = new FormData();
        formData.append('file', blob, 'stamped_product.png');
        const uploadRes = await apiClient.post('/products/images/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (uploadRes.data?.data?.url) {
          return uploadRes.data.data.url;
        }
      } catch (err) {
        console.warn('Failed to upload base64 image in frontend, falling back to server ingestion', err);
      }
      return url;
    };

    const currentValues = getValues();
    const resolvedDraftStampedUrl = stampedImageUrl ? await uploadBase64IfDataUrl(stampedImageUrl) : null;
    const finalDraftImages = await Promise.all(
      images.map(async (url, index) => {
        if (index === 0 && resolvedDraftStampedUrl) {
          return { url: resolvedDraftStampedUrl, isPrimary: true };
        }
        const cleanUrl = await uploadBase64IfDataUrl(url);
        return { url: cleanUrl, isPrimary: index === 0 };
      })
    );

    const payload: CreateProductData = {
      ...currentValues,
      title: currentTitle,
      productCode: currentCode,
      slug: slugify(currentValues.slug) || slugify(currentTitle),
      categoryId: currentValues.categoryId || (categories.length > 0 ? String(categories[0].id) : '1'),
      description: currentValues.description?.trim() || `Draft product: ${currentTitle}`,
      formats: selectedFormats.length > 0 ? selectedFormats : ['DST'],
      images: finalDraftImages,
      files: files,
      status: 'DRAFT',
    };

    await onSubmit(payload, 'DRAFT');
  };

  // Handler for Submit for Approval (Full validation)
  const handleSubmitForApproval = async (values: ProductFormValues) => {
    let hasError = false;

    if (images.length === 0) {
      setImageError('At least one product image is required.');
      toast.error('At least one product image is required.');
      hasError = true;
    }

    if (files.length === 0) {
      setMachineFilesError('At least one machine file is required.');
      toast.error('At least one machine file is required.');
      hasError = true;
    } else {
      const invalidPriceFile = files.find(
        (f) => f.price === undefined || f.price === null || (f.price as any) === '' || isNaN(Number(f.price)) || Number(f.price) < 0
      );
      if (invalidPriceFile) {
        setMachineFilesError('Price is required and must be a valid non-negative number for every machine file.');
        toast.error('Price is required for every machine file.');
        hasError = true;
      }
    }

    if (hasError) {
      return;
    }

    const uploadBase64IfDataUrl = async (url: string): Promise<string> => {
      if (!url || !url.startsWith('data:')) return url;
      try {
        const res = await fetch(url);
        const blob = await res.blob();
        const formData = new FormData();
        formData.append('file', blob, 'stamped_product.png');
        const uploadRes = await apiClient.post('/products/images/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (uploadRes.data?.data?.url) {
          return uploadRes.data.data.url;
        }
      } catch (err) {
        console.warn('Failed to upload base64 image in frontend, falling back to server ingestion', err);
      }
      return url;
    };

    const resolvedApprovedStampedUrl = stampedImageUrl ? await uploadBase64IfDataUrl(stampedImageUrl) : null;
    const finalApprovedImages = await Promise.all(
      images.map(async (url, index) => {
        if (index === 0 && resolvedApprovedStampedUrl) {
          return { url: resolvedApprovedStampedUrl, isPrimary: true };
        }
        const cleanUrl = await uploadBase64IfDataUrl(url);
        return { url: cleanUrl, isPrimary: index === 0 };
      })
    );

    const payload: CreateProductData = {
      ...values,
      slug: slugify(values.slug) || slugify(values.title),
      formats: selectedFormats,
      images: finalApprovedImages,
      files: files,
      status: 'PENDING_APPROVAL',
    };

    await onSubmit(payload, 'PENDING_APPROVAL');
  };

  return (
    <form onSubmit={handleSubmit(handleSubmitForApproval)} className="space-y-8 animate-fadeIn">
      {/* SECTION 1 — BASIC INFORMATION & STUDIO (2-COLUMN LAYOUT) */}
      <section className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Basic Information & Default Watermark (Col 7) */}
          <div className="lg:col-span-12 xl:col-span-7 space-y-5">
            <div className="space-y-5 rounded-3xl bg-white dark:bg-slate-900/60 p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Section 1 — Basic Information
                  </h3>
                  <p className="text-xs text-slate-400">
                    Provide product title, unique product code, category, pricing and more.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Product Title *"
                    placeholder="e.g. Royal Peacock Embroidery Motif DST"
                    error={errors.title?.message}
                    {...register('title', {
                      onChange: (e) => {
                        const newTitle = e.target.value;
                        const currentCode = getValues('productCode');

                        const newSlug = slugify(newTitle);
                        setValue('slug', newSlug, { shouldValidate: false });

                        if (!currentCode || currentCode.startsWith('ADHI-')) {
                          const newCode = generateProductCode(newTitle);
                          setValue('productCode', newCode, { shouldValidate: true });
                        }
                      },
                    })}
                  />

                  <div className="relative">
                    <FormField
                      label="Product Code *"
                      placeholder="e.g. ADHI-PRD-000123"
                      helperText="Auto generated unique product code"
                      leftIcon={<Hash className="w-4 h-4 text-slate-400" />}
                      error={errors.productCode?.message}
                      {...register('productCode')}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newCode = generateUniqueProductCode();
                        setValue('productCode', newCode, { shouldValidate: true });
                      }}
                      className="absolute right-2.5 top-8 p-1.5 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Regenerate unique product code"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormSelect
                    label="Category *"
                    options={categoryOptions}
                    error={errors.categoryId?.message}
                    {...register('categoryId')}
                  />

                  <FormSelect
                    label="Design Type *"
                    options={designTypeOptions}
                    error={errors.designType?.message}
                    helperText="Embroidery classification (e.g. Neck Design, Border)"
                    {...register('designType')}
                  />
                </div>

                <div>
                  <FormField
                    label="URL Slug"
                    placeholder="Auto-generated from title"
                    helperText="URL-friendly identifier"
                    error={errors.slug?.message}
                    {...register('slug', {
                      onChange: (e) => {
                        const formatted = slugify(e.target.value);
                        setValue('slug', formatted, { shouldValidate: false });
                      },
                    })}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Description *
                    </label>
                  </div>
                  <textarea
                    rows={4}
                    placeholder="Describe the design style, recommended fabric type, thread density, and machine settings..."
                    className={cn(
                      "w-full rounded-xl border bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all",
                      errors.description
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/50"
                        : "border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/50"
                    )}
                    {...register('description')}
                  />
                  {errors.description && (
                    <p className="text-xs font-semibold text-red-500 mt-1">{errors.description.message}</p>
                  )}
                </div>

                {/* Default Watermark Preview & Settings Panel */}
                <div className="pt-2">
                  <DefaultWatermarkPanel
                    imageUrl={
                      images[0] ||
                      initialValues?.primaryImage ||
                      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'
                    }
                    config={watermarkConfig}
                    onChange={setWatermarkConfig}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Note */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-start gap-2.5 text-xs text-indigo-900 dark:text-indigo-200">
              <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <span>
                <strong>Note:</strong> You can edit the auto text (product code), its size, color, position and other properties on the right panel.
              </span>
            </div>
          </div>

          {/* RIGHT COLUMN: Image Text Editor & Live Preview (Col 5) */}
          <div className="lg:col-span-12 xl:col-span-5 sticky top-6">
            <ImageTextEditor
              imageUrl={
                images[0] ||
                initialValues?.primaryImage ||
                'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'
              }
              productCode={watchedProductCode || getValues('productCode')}
              watermarkConfig={watermarkConfig}
              onCompositeGenerated={(compositeUrl) => {
                setStampedImageUrl(compositeUrl);
              }}
            />
          </div>
        </div>
      </section>

      {/* SECTION 2 — TECHNICAL SPECIFICATIONS */}
      <section className="space-y-5 rounded-2xl bg-white dark:bg-slate-900/60 p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <Ruler className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Section 2 — Technical Specifications
            </h3>
            <p className="text-xs text-slate-400">
              Specify stitch count, dimension measurements, color stops, and supported formats.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Stitch Count *"
              type="number"
              placeholder="15400"
              error={errors.stitchCount?.message}
              {...register('stitchCount')}
            />

            <FormField
              label="Color Count *"
              type="number"
              placeholder="6"
              error={errors.colorCount?.message}
              {...register('colorCount')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              label="Width (mm) *"
              type="number"
              placeholder="120"
              error={errors.widthMm?.message}
              {...register('widthMm')}
            />

            <FormField
              label="Height (mm) *"
              type="number"
              placeholder="95"
              error={errors.heightMm?.message}
              {...register('heightMm')}
            />

            <FormField
              label="Stop Count *"
              type="number"
              placeholder="8"
              error={errors.stopCount?.message}
              {...register('stopCount')}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
              Compatible Formats Included
            </label>
            <div className="flex flex-wrap gap-2">
              {MACHINE_FORMATS.map((fmt) => {
                const isSelected = selectedFormats.includes(fmt);
                return (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => toggleFormat(fmt)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    .{fmt}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — PRODUCT IMAGES */}
      <section className="space-y-5 rounded-2xl bg-white dark:bg-slate-900/60 p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Section 3 — Product Images
            </h3>
            <p className="text-xs text-slate-400">
              Upload primary thumbnail and gallery preview images for marketplace display.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Gallery Images List */}
          {images.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((url, idx) => (
                <div 
                  key={idx} 
                  className={cn(
                    'relative group rounded-2xl overflow-hidden border p-3 bg-slate-900/40 space-y-2 transition-all',
                    idx === 0 
                      ? 'border-emerald-500/60 ring-2 ring-emerald-500/20 bg-emerald-950/10' 
                      : 'border-slate-200 dark:border-slate-800'
                  )}
                >
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800">
                    <img src={url} alt={`Product ${idx + 1}`} className="w-full h-full object-contain" />
                    {idx === 0 && (
                      <span className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow flex items-center gap-1">
                        <Star className="w-3 h-3 fill-white" /> Primary Image
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setEditingImage({
                        url,
                        index: idx,
                        fileName: `design_image_${idx + 1}.png`
                      })}
                      className="text-xs text-amber-500 hover:text-amber-400 font-semibold flex items-center gap-1 hover:underline"
                      title="Open Mask Editor to remove text/watermark"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Remove Watermark
                    </button>

                    {idx !== 0 ? (
                      <button
                        type="button"
                        onClick={() => {
                          const newArr = [...images];
                          const selected = newArr.splice(idx, 1)[0];
                          newArr.unshift(selected);
                          setImages(newArr);
                        }}
                        className="text-xs text-indigo-500 hover:text-indigo-400 font-semibold flex items-center gap-1 hover:underline"
                      >
                        <Star className="w-3.5 h-3.5" /> Make Primary
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-500">Primary Image</span>
                    )}

                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="text-xs text-red-500 hover:text-red-400 font-semibold flex items-center gap-1 hover:underline ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Image Error Alert */}
          {imageError && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-red-500 bg-red-50/10 p-3 rounded-xl border border-red-500/20">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{imageError}</span>
            </div>
          )}

          {/* Standardized ImageInput for Adding New Image */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <ImageInput
              label="Add Product Image (JPG, JPEG, PNG, WEBP — Max 5MB)"
              value={newImageUrl}
              onChange={(val) => {
                setNewImageUrl(val);
                if (val && val.trim()) {
                  setImages((prev) => [...prev, val.trim()]);
                  setNewImageUrl('');
                  if (imageError) setImageError(null);
                }
              }}
              directory="products"
              helpText="Select an image file from device (Max 5MB) to upload and add to product gallery"
            />
          </div>
        </div>
      </section>

      {/* SECTION 4 — MACHINE FILES */}
      <section className="space-y-5 rounded-2xl bg-white dark:bg-slate-900/60 p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Section 4 — Machine Files *
              </h3>
              <p className="text-xs text-slate-400">
                Attach downloadable embroidery machine files (.DST, .PES, .EXP, .EMB, .ZIP).
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {files.length} {files.length === 1 ? 'file attached' : 'files attached'}
          </span>
        </div>

        <div className="space-y-4">
          {/* Native Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".dst,.pes,.exp,.jef,.emb,.vp3,.hus,.xxx,.zip"
            className="hidden"
            onChange={(e) => handleDeviceFileSelect(e.target.files)}
          />

          {/* File Dropzone / Picker */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-900/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20",
              machineFilesError
                ? "border-red-500 hover:border-red-600 bg-red-50/10"
                : "border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500"
            )}
          >
            <div className="flex items-center gap-3.5 text-left">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-inner">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Browse Machine Files from Device
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Supports .DST, .PES, .EXP, .JEF, .EMB, .VP3, .HUS, .XXX, .ZIP
                </p>
              </div>
            </div>

            <div className="shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="pointer-events-none"
              >
                <UploadCloud className="w-4 h-4 mr-1.5" /> Select Files
              </Button>
            </div>
          </div>

          {machineFilesError && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-red-500 bg-red-50/10 p-3 rounded-xl border border-red-500/20">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{machineFilesError}</span>
            </div>
          )}

          {/* Attached Files List & Empty State */}
          {files.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 text-slate-400 text-xs font-medium">
              No machine files attached. Click "Select Files" above to attach machine files.
            </div>
          ) : (
            <div className="space-y-3">
              {files.map((file, idx) => {
                const name = file.fileName || file.originalFileName || `file_${idx + 1}`;
                const format = file.format || file.fileFormat || 'DST';
                const isZip = String(format).toUpperCase() === 'ZIP' || name.toLowerCase().endsWith('.zip');
                const displayFormat = isZip ? 'ZIP' : format;
                const size = file.fileSize || file.fileSizeBytes;
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-center gap-3 min-w-[200px] max-w-full">
                      <Badge variant={isZip ? 'warning' : 'primary'} className="font-mono text-xs px-2.5 py-0.5">
                        .{displayFormat}
                      </Badge>
                      <div className="truncate">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 font-mono truncate">
                          {name}
                        </p>
                        {size ? (
                          <span className="text-[11px] text-slate-400">
                            {(size / 1024).toFixed(0)} KB
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto flex-wrap sm:flex-nowrap">
                      {/* Machine / Model Info Input */}
                      <div className="flex-1 sm:w-48">
                        <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                          Machine Info
                        </label>
                        <input
                          type="text"
                          value={file.machineInfo || ''}
                          onChange={(e) => updateFileProp(idx, 'machineInfo', e.target.value)}
                          placeholder="e.g. BERNINA-14x8 / FULL"
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      {/* Individual File Price Input */}
                      <div className="w-32">
                        <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                          File Price (₹) *
                        </label>
                        <div className="flex items-center">
                          <span className="text-xs font-semibold text-slate-400 mr-1 shrink-0">₹</span>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={file.price !== undefined && file.price !== null && (file.price as any) !== '' && !isNaN(Number(file.price)) ? file.price : ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '') {
                                updateFileProp(idx, 'price', '' as any);
                                return;
                              }
                              // Reject negative sign or non-numeric/decimal characters
                              if (/^\d*\.?\d*$/.test(val)) {
                                const parsed = parseFloat(val);
                                updateFileProp(idx, 'price', isNaN(parsed) ? val : parsed);
                              }
                            }}
                            placeholder="25.00"
                            className={cn(
                              "w-full text-xs font-semibold px-2.5 py-2 rounded-lg border bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500",
                              file.price === undefined || file.price === null || (file.price as any) === '' || isNaN(Number(file.price)) || Number(file.price) < 0
                                ? "border-red-500 focus:ring-red-500"
                                : "border-slate-200 dark:border-slate-700"
                            )}
                          />
                        </div>
                      </div>

                      {/* Delete File Button */}
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0"
                        title="Remove file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* BOTTOM ACTIONS BAR */}
      <div className="sticky bottom-4 z-10 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-2xl">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/products')}
          className="w-full sm:w-auto text-slate-600 dark:text-slate-300"
        >
          <X className="w-4 h-4 mr-1.5" />
          Cancel
        </Button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            isLoading={isLoading}
            onClick={handleSaveDraft}
            className="w-full sm:w-auto border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 font-semibold"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white shadow-md font-semibold px-5"
          >
            <Send className="w-4 h-4 mr-2" />
            Submit for Approval
          </Button>
        </div>
      </div>

      {/* Image Mask Editor Modal */}
      {editingImage && (
        <ImageMaskEditor
          isOpen={!!editingImage}
          imageUrl={editingImage.url}
          fileName={editingImage.fileName}
          onClose={() => setEditingImage(null)}
          onSaveCleanedImage={(cleanedUrl) => {
            if (editingImage.index !== undefined && editingImage.index >= 0) {
              setImages((prev) => {
                const updated = [...prev];
                updated[editingImage.index!] = cleanedUrl;
                return updated;
              });
            } else {
              setImages((prev) => [...prev, cleanedUrl]);
            }
            if (imageError) setImageError(null);
          }}
        />
      )}
    </form>
  );
};

