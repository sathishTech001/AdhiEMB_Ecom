import { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  FolderTree, 
  Plus, 
  Edit3, 
  Trash2 
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { FormField } from '@/components/forms/FormField';
import { SearchInput } from '@/components/ui/SearchInput';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ImageInput } from '@/components/ui/ImageInput';
import { 
  useCategoriesQuery, 
  useCreateCategory, 
  useUpdateCategory, 
  useDeleteCategory 
} from '../hooks/useCategories';
import { Category } from '../types/category.types';

const categorySchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  slug: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  imageUrl: z.string().optional(),
  sortOrder: z.coerce.number().default(0),
  isActive: z.boolean().default(true),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

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

export function CategoryListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  const { data: flatCategories = [], isLoading } = useCategoriesQuery();
  
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      icon: '',
      imageUrl: '',
      sortOrder: 0,
      isActive: true,
    },
  });

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    reset({
      name: '',
      slug: '',
      description: '',
      icon: '',
      imageUrl: '',
      sortOrder: 0,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (category: Category) => {
    setEditingCategory(category);
    reset({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || '',
      imageUrl: category.imageUrl || '',
      sortOrder: category.sortOrder || 0,
      isActive: category.isActive ?? true,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (values: CategoryFormValues) => {
    const payload = {
      ...values,
      slug: slugify(values.slug) || slugify(values.name),
    };

    if (editingCategory) {
      await updateCategoryMutation.mutateAsync({ id: editingCategory.id, data: payload });
    } else {
      await createCategoryMutation.mutateAsync(payload);
    }
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (deletingId) {
      await deleteCategoryMutation.mutateAsync(deletingId);
      setDeletingId(null);
    }
  };

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return flatCategories;
    return flatCategories.filter(
      (c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [flatCategories, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-2xl p-6 text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-indigo-200 text-sm font-medium mb-1">
            <FolderTree className="w-4 h-4" />
            Category Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Embroidery Design Categories
          </h1>
          <p className="text-indigo-100/80 text-sm mt-1 max-w-xl">
            Manage top-level marketplace categories (e.g. Floral Designs, Border & Lace, Monograms) for product discovery.
          </p>
        </div>

        <Button
          onClick={handleOpenAddModal}
          className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-lg shadow-emerald-500/20 shrink-0 self-start md:self-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Main Content Card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="w-full sm:w-80">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search categories by name..."
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Total Categories: {flatCategories.length}
            </span>
          </div>
        </div>

        {/* Categories Table / List */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Spinner size="lg" />
            <p className="text-slate-500 text-sm mt-4">Loading categories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <EmptyState
            icon={<FolderTree className="w-8 h-8" />}
            title="No Categories Found"
            description={searchTerm ? `No categories match "${searchTerm}"` : 'Get started by adding your first category.'}
            actionLabel="Add Category"
            onAction={handleOpenAddModal}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/30">
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Slug</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4 text-center">Order</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredCategories.map((cat) => (
                  <tr
                    key={cat.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {cat.imageUrl ? (
                          <img
                            src={cat.imageUrl}
                            alt={cat.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0">
                            {cat.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {cat.name}
                          </div>
                          {cat.icon && (
                            <span className="text-[11px] text-slate-400 font-mono">
                              icon: {cat.icon}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-indigo-600 dark:text-indigo-400">
                      /{cat.slug}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      {cat.description || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {cat.sortOrder}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {cat.isActive ? (
                        <Badge variant="success" className="text-[11px]">Active</Badge>
                      ) : (
                        <Badge variant="default" className="text-[11px]">Inactive</Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(cat)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                          title="Edit Category"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingId(cat.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create / Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create New Category'}
        size="4xl"
      >
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Form Details (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <FormField
                label="Category Name *"
                placeholder="e.g. Floral Designs, Border & Lace"
                error={errors.name?.message}
                {...register('name', {
                  onChange: (e) => {
                    const generated = slugify(e.target.value);
                    setValue('slug', generated, { shouldValidate: true });
                  },
                })}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label="Slug (URL identifier)"
                  placeholder="Auto-generated from category name"
                  error={errors.slug?.message}
                  {...register('slug', {
                    onChange: (e) => {
                      const formatted = slugify(e.target.value);
                      setValue('slug', formatted, { shouldValidate: false });
                    },
                  })}
                />

                <FormField
                  label="Category Icon (Optional)"
                  placeholder="e.g. Flower2, Sparkles, Shapes"
                  helperText="Optional icon identifier."
                  error={errors.icon?.message}
                  {...register('icon')}
                />
              </div>

              <FormField
                label="Description"
                placeholder="Brief details about this category..."
                error={errors.description?.message}
                {...register('description')}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-1">
                <FormField
                  label="Display Order"
                  type="number"
                  helperText="Lower numbers appear first."
                  error={errors.sortOrder?.message}
                  {...register('sortOrder')}
                />

                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="isActive"
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                    {...register('isActive')}
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    Is Category Active
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Media Uploader (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-3 bg-slate-50/60 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <div>
                <Controller
                  name="imageUrl"
                  control={control}
                  render={({ field }) => (
                    <ImageInput
                      label="Category Image / Thumbnail"
                      value={field.value}
                      onChange={field.onChange}
                      directory="categories"
                      error={errors.imageUrl?.message}
                      helpText="Select an image from device or URL"
                    />
                  )}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting || createCategoryMutation.isPending || updateCategoryMutation.isPending}
            >
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Category"
        message="Are you sure you want to delete this category? Associated products may be affected."
        confirmLabel="Delete Category"
        isDanger
        isLoading={deleteCategoryMutation.isPending}
      />
    </div>
  );
}

