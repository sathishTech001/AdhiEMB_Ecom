import { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  FolderTree, 
  Plus, 
  ChevronRight, 
  ChevronDown, 
  Edit3, 
  Trash2, 
  Folder, 
  MoreVertical
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { FormField } from '@/components/forms/FormField';
import { FormSelect } from '@/components/forms/FormSelect';
import { SearchInput } from '@/components/ui/SearchInput';
import { Badge } from '@/components/ui/Badge';
import { Dropdown } from '@/components/ui/Dropdown';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ImageInput } from '@/components/ui/ImageInput';
import { 
  useCategoriesQuery, 
  useCategoryTreeQuery, 
  useCreateCategory, 
  useUpdateCategory, 
  useDeleteCategory 
} from '../hooks/useCategories';
import { Category, CategoryTree } from '../types/category.types';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  imageUrl: z.string().optional(),
  parentId: z.string().optional().nullable(),
  sortOrder: z.coerce.number().default(0),
  isActive: z.boolean().default(true),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export function CategoryListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Record<string | number, boolean>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  const { data: flatCategories = [], isLoading: isFlatLoading } = useCategoriesQuery();
  const { data: treeCategories = [], isLoading: isTreeLoading } = useCategoryTreeQuery();
  
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      icon: '',
      imageUrl: '',
      parentId: '',
      sortOrder: 0,
      isActive: true,
    },
  });

  const toggleExpand = (id: string | number) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleOpenAddModal = (parentId?: string | number) => {
    setEditingCategory(null);
    reset({
      name: '',
      slug: '',
      description: '',
      icon: '',
      imageUrl: '',
      parentId: parentId ? String(parentId) : '',
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
      parentId: category.parentId ? String(category.parentId) : '',
      sortOrder: category.sortOrder || 0,
      isActive: category.isActive ?? true,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (values: CategoryFormValues) => {
    const payload = {
      ...values,
      parentId: values.parentId ? values.parentId : null,
      slug: values.slug || values.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
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

  // Filter tree categories based on search
  const filteredTree = useMemo(() => {
    if (!searchTerm.trim()) return treeCategories;
    
    const filterNodes = (nodes: CategoryTree[]): CategoryTree[] => {
      return nodes.reduce<CategoryTree[]>((acc, node) => {
        const matchesName = node.name.toLowerCase().includes(searchTerm.toLowerCase());
        const filteredChildren = node.children ? filterNodes(node.children) : [];
        
        if (matchesName || filteredChildren.length > 0) {
          acc.push({
            ...node,
            children: filteredChildren,
          });
        }
        return acc;
      }, []);
    };

    return filterNodes(treeCategories);
  }, [treeCategories, searchTerm]);

  // Options for Parent Select
  const parentOptions = useMemo(() => {
    const options = [{ label: 'None (Top Level Category)', value: '' }];
    flatCategories.forEach((cat) => {
      if (editingCategory && String(cat.id) === String(editingCategory.id)) return;
      options.push({
        label: cat.name,
        value: String(cat.id),
      });
    });
    return options;
  }, [flatCategories, editingCategory]);

  const isLoading = isFlatLoading || isTreeLoading;

  const renderTreeNode = (node: CategoryTree, depth = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes[node.id] || Boolean(searchTerm.trim());

    return (
      <div key={node.id} className="select-none">
        <div 
          className={`group flex items-center justify-between py-3 px-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all duration-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-700/50 mb-1.5`}
          style={{ paddingLeft: `${Math.max(16, depth * 28 + 16)}px` }}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {hasChildren ? (
              <button
                onClick={() => toggleExpand(node.id)}
                className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            ) : (
              <span className="w-6 h-6 flex items-center justify-center text-slate-300 dark:text-slate-600">
                <Folder className="w-3.5 h-3.5" />
              </span>
            )}

            {node.imageUrl ? (
              <img 
                src={node.imageUrl} 
                alt={node.name} 
                className="w-9 h-9 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
              />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-semibold text-sm">
                {node.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {node.name}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                  /{node.slug}
                </span>
                {node.isActive ? (
                  <Badge variant="success" className="text-[10px] px-1.5 py-0">Active</Badge>
                ) : (
                  <Badge variant="default" className="text-[10px] px-1.5 py-0">Inactive</Badge>
                )}
              </div>
              {node.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">
                  {node.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                Order: {node.sortOrder}
              </span>
              {node.productCount !== undefined && (
                <span className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 px-2 py-1 rounded-md font-medium">
                  {node.productCount} {node.productCount === 1 ? 'Design' : 'Designs'}
                </span>
              )}
            </div>

            <Dropdown
              trigger={
                <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              }
              items={[
                {
                  key: 'add-sub',
                  label: 'Add Sub-category',
                  onClick: () => handleOpenAddModal(node.id),
                  icon: <Plus className="w-4 h-4 text-indigo-500" />,
                },
                {
                  key: 'edit',
                  label: 'Edit Category',
                  onClick: () => handleOpenEditModal(node),
                  icon: <Edit3 className="w-4 h-4 text-blue-500" />,
                },
                {
                  key: 'delete',
                  label: 'Delete Category',
                  onClick: () => setDeletingId(node.id),
                  danger: true,
                  icon: <Trash2 className="w-4 h-4 text-red-500" />,
                },
              ]}
            />
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="border-l-2 border-slate-100 dark:border-slate-800 ml-4 pl-2">
            {node.children!.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

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
            Embroidery Categories & Hierarchy
          </h1>
          <p className="text-indigo-100/80 text-sm mt-1 max-w-xl">
            Organize digital embroidery designs into logical parent and sub-categories for easy marketplace discovery.
          </p>
        </div>

        <Button
          onClick={() => handleOpenAddModal()}
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

        {/* Tree Container */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Spinner size="lg" />
            <p className="text-slate-500 text-sm mt-4">Loading category tree structure...</p>
          </div>
        ) : filteredTree.length === 0 ? (
          <EmptyState
            icon={<FolderTree className="w-8 h-8" />}
            title="No Categories Found"
            description={searchTerm ? `No categories match "${searchTerm}"` : 'Get started by adding your first category.'}
            actionLabel="Add Category"
            onAction={() => handleOpenAddModal()}
          />
        ) : (
          <div className="space-y-1">
            {filteredTree.map((node) => renderTreeNode(node))}
          </div>
        )}
      </Card>

      {/* Create / Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create New Category'}
        size="lg"
      >
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <FormField
            label="Category Name *"
            placeholder="e.g. Floral Designs, Border Patterns"
            error={errors.name?.message}
            {...register('name')}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Slug (URL identifier)"
              placeholder="auto-generated if empty"
              error={errors.slug?.message}
              {...register('slug')}
            />

            <FormSelect
              label="Parent Category"
              options={parentOptions}
              error={errors.parentId?.message}
              {...register('parentId')}
            />
          </div>

          <div className="space-y-4">
            <FormField
              label="Icon Name (Lucide icon code)"
              placeholder="e.g. Flower2, Shapes, Sparkles"
              error={errors.icon?.message}
              {...register('icon')}
            />

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
                  helpText="Select file to upload or enter image URL"
                />
              )}
            />
          </div>

          <FormField
            label="Description"
            placeholder="Brief details about this category..."
            error={errors.description?.message}
            {...register('description')}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <FormField
              label="Sort Order"
              type="number"
              error={errors.sortOrder?.message}
              {...register('sortOrder')}
            />

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="isActive"
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                {...register('isActive')}
              />
              <label htmlFor="isActive" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Is Category Active
              </label>
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
        message="Are you sure you want to delete this category? Subcategories or assigned products may be affected."
        confirmLabel="Delete Category"
        isDanger
        isLoading={deleteCategoryMutation.isPending}
      />
    </div>
  );
}
