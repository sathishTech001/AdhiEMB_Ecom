import { UserStatus } from '@/types/common.types';
import { Badge } from '@/components/ui/Badge';

export function UserStatusBadge({ status }: { status: UserStatus }) {
  switch (status) {
    case 'ACTIVE':
      return <Badge variant="success">Active</Badge>;
    case 'INACTIVE':
      return <Badge variant="default">Inactive</Badge>;
    case 'BLOCKED':
      return <Badge variant="danger">Blocked</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}
