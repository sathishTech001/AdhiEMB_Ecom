export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export type StatusType = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
export type UserStatus = StatusType;
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface SelectOption {
  label: string;
  value: string;
}
