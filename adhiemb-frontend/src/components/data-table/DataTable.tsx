import { ReactNode } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Pagination } from '../ui/Pagination';
import { EmptyState } from '../ui/EmptyState';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyStateIcon?: ReactNode;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  
  // Sort props
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  
  // Pagination props
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  totalElements?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  isLoading = false,
  emptyStateIcon,
  emptyStateTitle = 'No data available',
  emptyStateDescription,
  
  sortColumn,
  sortDirection,
  onSort,
  
  currentPage,
  totalPages,
  pageSize,
  totalElements,
  onPageChange,
  onPageSizeChange
}: DataTableProps<T>) {
  
  const handleSort = (columnKey: string) => {
    if (onSort) {
      onSort(columnKey);
    }
  };

  const renderSortIcon = (columnKey: string) => {
    if (sortColumn !== columnKey) return <ChevronsUpDown className="ml-1 h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />;
    return sortDirection === 'asc' 
      ? <ChevronUp className="ml-1 h-4 w-4 text-primary-500" />
      : <ChevronDown className="ml-1 h-4 w-4 text-primary-500" />;
  };

  return (
    <div className="w-full space-y-4">
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 glass-card">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50/50 text-xs font-semibold uppercase text-slate-700 dark:bg-slate-800/50 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800">
            <tr>
              {columns.map((column) => (
                <th 
                  key={column.key} 
                  className={cn(
                    "px-6 py-4 whitespace-nowrap",
                    column.sortable && "cursor-pointer group select-none hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center">
                    {column.label}
                    {column.sortable && renderSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`} className="animate-pulse">
                  {columns.map((_column, colIndex) => (
                    <td key={`skeleton-${rowIndex}-${colIndex}`} className="px-6 py-4">
                      <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12">
                  <EmptyState
                    icon={emptyStateIcon || <ChevronsUpDown className="h-8 w-8" />}
                    title={emptyStateTitle}
                    description={emptyStateDescription}
                  />
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr 
                  key={row.id || rowIndex} 
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  {columns.map((column) => (
                    <td key={`${row.id || rowIndex}-${column.key}`} className="px-6 py-4 whitespace-nowrap">
                      {column.render 
                        ? column.render(row) 
                        : (row as any)[column.key] as ReactNode}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && data.length > 0 && onPageChange && onPageSizeChange && currentPage !== undefined && totalPages !== undefined && pageSize !== undefined && totalElements !== undefined && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalElements={totalElements}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}
