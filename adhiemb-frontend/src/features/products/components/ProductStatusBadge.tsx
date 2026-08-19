import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { ProductStatus } from '../types/product.types';
import { CheckCircle2, Clock, AlertTriangle, Archive, FileText } from 'lucide-react';

interface ProductStatusBadgeProps {
  status: ProductStatus;
  className?: string;
}

export const ProductStatusBadge: React.FC<ProductStatusBadgeProps> = ({ status, className }) => {
  switch (status) {
    case 'APPROVED':
      return (
        <Badge variant="success" className={`gap-1 ${className}`}>
          <CheckCircle2 className="w-3 h-3" />
          Approved
        </Badge>
      );
    case 'PENDING_APPROVAL':
      return (
        <Badge variant="warning" className={`gap-1 ${className}`}>
          <Clock className="w-3 h-3" />
          Pending Approval
        </Badge>
      );
    case 'REJECTED':
      return (
        <Badge variant="danger" className={`gap-1 ${className}`}>
          <AlertTriangle className="w-3 h-3" />
          Rejected
        </Badge>
      );
    case 'ARCHIVED':
      return (
        <Badge variant="default" className={`gap-1 bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 ${className}`}>
          <Archive className="w-3 h-3" />
          Archived
        </Badge>
      );
    case 'DRAFT':
    default:
      return (
        <Badge variant="default" className={`gap-1 ${className}`}>
          <FileText className="w-3 h-3" />
          Draft
        </Badge>
      );
  }
};
