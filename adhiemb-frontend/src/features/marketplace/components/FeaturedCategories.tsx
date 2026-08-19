import { Link } from 'react-router-dom';
import { 
  Flower2, 
  Shapes, 
  Rabbit, 
  Palette, 
  Spline, 
  Type, 
  Layers, 
  Folder, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { usePublicCategoryTreeQuery } from '@/features/categories/hooks/useCategories';

const defaultCategories = [
  { name: 'Floral Designs', icon: Flower2, count: '240+ Designs', color: 'text-pink-500', bg: 'bg-pink-100 dark:bg-pink-900/30' },
  { name: 'Geometric Patterns', icon: Shapes, count: '185+ Designs', color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
  { name: 'Animal Motifs', icon: Rabbit, count: '320+ Designs', color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  { name: 'Abstract Art', icon: Palette, count: '150+ Designs', color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  { name: 'Border Designs', icon: Spline, count: '410+ Designs', color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  { name: 'Monograms', icon: Type, count: '560+ Designs', color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
];

export const FeaturedCategories = () => {
  const { data: apiCategories = [], isLoading } = usePublicCategoryTreeQuery();

  const categoriesToRender = apiCategories.length > 0
    ? apiCategories.slice(0, 6)
    : [];

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              Curated Collections
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Popular Categories</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-xl">
              Discover digitised embroidery patterns grouped into high-demand machine categories.
            </p>
          </div>

          <Link
            to="/designs"
            className="inline-flex items-center text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
          >
            Explore All Categories <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(categoriesToRender.length > 0 ? categoriesToRender : defaultCategories).map((cat: any, idx) => {
              const name = cat.name || 'Category';
              const count = cat.productCount !== undefined ? `${cat.productCount} Designs` : (cat.count || '200+ Designs');
              const IconComponent = cat.icon ? Folder : (defaultCategories[idx % defaultCategories.length].icon || Layers);
              const colorClass = defaultCategories[idx % defaultCategories.length].color;
              const bgClass = defaultCategories[idx % defaultCategories.length].bg;

              return (
                <Link
                  key={cat.id || name}
                  to={`/designs?category=${cat.id || ''}`}
                  className="group bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-800 hover:-translate-y-1 flex items-center gap-5"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bgClass} ${colorClass} transition-transform group-hover:scale-110 shrink-0`}>
                    {cat.imageUrl ? (
                      <img src={cat.imageUrl} alt={name} className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      <IconComponent className="w-7 h-7" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                      {name}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 font-medium">
                      {count}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
