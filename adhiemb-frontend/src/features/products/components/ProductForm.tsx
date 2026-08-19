import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  FileText, 
  Ruler, 
  UploadCloud, 
  Image as ImageIcon, 
  Check, 
  Plus, 
  Trash2, 
  Send, 
  Save,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/forms/FormField';
import { FormSelect } from '@/components/forms/FormSelect';
import { Badge } from '@/components/ui/Badge';
import { ImageInput } from '@/components/ui/ImageInput';
import { cn } from '@/lib/utils';
import { useCategoriesQuery } from '@/features/categories/hooks/useCategories';
import { MachineFormat, ProductDetail, CreateProductData, ProductFile } from '../types/product.types';

const MACHINE_FORMATS: MachineFormat[] = ['DST', 'PES', 'EXP', 'JEF', 'EMB', 'VP3', 'HUS', 'XXX'];

const productSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  price: z.coerce.number().min(0, 'Price must be 0 or greater'),
  discountPrice: z.coerce.number().optional(),
  categoryId: z.string().min(1, 'Please select a category'),
  stitchCount: z.coerce.number().min(1, 'Stitch count must be at least 1'),
  widthMm: z.coerce.number().min(1, 'Width must be greater than 0'),
  heightMm: z.coerce.number().min(1, 'Height must be greater than 0'),
  colorCount: z.coerce.number().min(1, 'Color count must be at least 1'),
  stopCount: z.coerce.number().min(1, 'Stop count must be at least 1'),
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
  const [activeTab, setActiveTab] = useState<'basic' | 'specs' | 'files'>('basic');
  const [selectedFormats, setSelectedFormats] = useState<MachineFormat[]>(
    initialValues?.formats || ['DST', 'PES', 'EXP', 'JEF', 'EMB']
  );
  const [images, setImages] = useState<string[]>(
    initialValues?.images?.map(img => typeof img === 'string' ? img : img.url) || 
    (initialValues?.primaryImage ? [initialValues.primaryImage] : [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'
    ])
  );
  const [newImageUrl, setNewImageUrl] = useState('');
  const [files, setFiles] = useState<ProductFile[]>(initialValues?.files || [
    { fileName: 'design_dst.dst', fileUrl: '#', format: 'DST', fileSize: 245000 },
    { fileName: 'design_pes.pes', fileUrl: '#', format: 'PES', fileSize: 210000 },
  ]);
  const [newFileName, setNewFileName] = useState('');
  const [newFileFormat, setNewFileFormat] = useState<MachineFormat>('DST');

  const { data: categories = [] } = useCategoriesQuery();

  const categoryOptions = [
    { label: 'Select Category...', value: '' },
    ...categories.map((c) => ({ label: c.name, value: String(c.id) })),
  ];

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: initialValues?.title || '',
      slug: initialValues?.slug || '',
      description: initialValues?.description || '',
      price: initialValues?.price || 0,
      discountPrice: initialValues?.discountPrice || undefined,
      categoryId: initialValues?.categoryId ? String(initialValues.categoryId) : '',
      stitchCount: initialValues?.stitchCount || 12500,
      widthMm: initialValues?.widthMm || 120,
      heightMm: initialValues?.heightMm || 95,
      colorCount: initialValues?.colorCount || 6,
      stopCount: initialValues?.stopCount || 8,
    },
  });

  const toggleFormat = (format: MachineFormat) => {
    if (selectedFormats.includes(format)) {
      setSelectedFormats(selectedFormats.filter((f) => f !== format));
    } else {
      setSelectedFormats([...selectedFormats, format]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const addFile = () => {
    if (newFileName.trim()) {
      setFiles([
        ...files,
        {
          fileName: newFileName.trim(),
          fileUrl: '#',
          format: newFileFormat,
          fileSize: 180000,
        },
      ]);
      setNewFileName('');
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (values: ProductFormValues, targetStatus: 'DRAFT' | 'PENDING_APPROVAL') => {
    const payload: CreateProductData = {
      ...values,
      slug: values.slug || values.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      formats: selectedFormats,
      images: images.map((url, index) => ({ url, isPrimary: index === 0 })),
      files: files,
      status: targetStatus,
    };

    await onSubmit(payload, targetStatus);
  };

  const tabs = [
    { id: 'basic', label: '1. Basic Info', icon: FileText },
    { id: 'specs', label: '2. Specifications', icon: Ruler },
    { id: 'files', label: '3. Machine Files & Media', icon: UploadCloud },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Form Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-2 sm:space-x-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-all duration-200 ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Basic Info */}
      {activeTab === 'basic' && (
        <div className="space-y-5 animate-fadeIn">
          <FormField
            label="Product Title *"
            placeholder="e.g. Royal Peacock Embroidery Motif DST"
            error={errors.title?.message}
            {...register('title')}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              label="Category *"
              options={categoryOptions}
              error={errors.categoryId?.message}
              {...register('categoryId')}
            />

            <FormField
              label="URL Slug"
              placeholder="auto-generated from title"
              error={errors.slug?.message}
              {...register('slug')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Price ($) *"
              type="number"
              step="0.01"
              placeholder="19.99"
              error={errors.price?.message}
              {...register('price')}
            />

            <FormField
              label="Discount Price ($)"
              type="number"
              step="0.01"
              placeholder="12.99 (Optional promotional price)"
              error={errors.discountPrice?.message}
              {...register('discountPrice')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description *
            </label>
            <textarea
              rows={5}
              placeholder="Describe the design style, recommended fabric type, thread density, and recommended machine settings..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Specifications */}
      {activeTab === 'specs' && (
        <div className="space-y-5 animate-fadeIn">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800 text-xs text-indigo-700 dark:text-indigo-300">
            <p className="font-semibold text-sm mb-1">Technical Specs Guidance (All Lengths & Widths Allowed)</p>
            Specify exact stitch count, width (mm), and height (mm). All length and width dimensions are fully supported without restriction (Only image data size &le; 5MB is enforced).
          </div>

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
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Compatible Formats Included *
            </label>
            <div className="flex flex-wrap gap-2">
              {MACHINE_FORMATS.map((fmt) => {
                const isSelected = selectedFormats.includes(fmt);
                return (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => toggleFormat(fmt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
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
      )}

      {/* Tab 3: Files & Images */}
      {activeTab === 'files' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Images Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-indigo-500" />
              Product Design Gallery & Media
            </h4>

            {/* Gallery Images List */}
            {images.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
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

                    <div className="flex items-center justify-between gap-2 pt-1">
                      {idx !== 0 ? (
                        <button
                          type="button"
                          onClick={() => {
                            // Swap image to index 0 (Primary)
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
                        <span className="text-xs font-semibold text-emerald-500">Default Catalog Image</span>
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

            {/* Standardized ImageInput for Adding New Image */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
              <ImageInput
                label="Add New Product Image"
                value={newImageUrl}
                onChange={(val) => {
                  setNewImageUrl(val);
                  if (val.trim()) {
                    setImages([...images, val.trim()]);
                    setNewImageUrl('');
                  }
                }}
                directory="products"
                helpText="Choose a file from device or enter image URL to add to product gallery"
              />
            </div>
          </div>

          {/* Digital Embroidery Files Section */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-indigo-500" />
              Machine Files (.DST, .PES, etc.)
            </h4>

            <div className="space-y-2 mb-4">
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="primary" className="font-mono">.{file.format}</Badge>
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {file.fileName}
                    </span>
                    {file.fileSize && (
                      <span className="text-xs text-slate-400">
                        ({(file.fileSize / 1024).toFixed(0)} KB)
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="File Name e.g. design_tajima.dst"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm"
              />
              <select
                value={newFileFormat}
                onChange={(e) => setNewFileFormat(e.target.value as MachineFormat)}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-semibold"
              >
                {MACHINE_FORMATS.map((f) => (
                  <option key={f} value={f}>.{f}</option>
                ))}
              </select>
              <Button type="button" variant="outline" onClick={addFile}>
                <Plus className="w-4 h-4 mr-1" /> Add File
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="flex gap-2 text-xs text-slate-500">
          <button
            type="button"
            onClick={async () => {
              const valid = await trigger();
              if (valid) setActiveTab('basic');
            }}
            className="hover:underline"
          >
            Basic Info
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={async () => {
              const valid = await trigger();
              if (valid) setActiveTab('specs');
            }}
            className="hover:underline"
          >
            Specs
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => setActiveTab('files')}
            className="hover:underline"
          >
            Files
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            isLoading={isLoading}
            onClick={handleSubmit((data) => handleFormSubmit(data, 'DRAFT'))}
            className="w-full sm:w-auto"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>

          <Button
            type="button"
            isLoading={isLoading}
            onClick={handleSubmit((data) => handleFormSubmit(data, 'PENDING_APPROVAL'))}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Send className="w-4 h-4 mr-2" />
            Submit for Approval
          </Button>
        </div>
      </div>
    </div>
  );
};
