export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  users: {
    all: ['users'] as const,
    list: (filters: any) => ['users', 'list', filters] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
  },
  roles: {
    all: ['roles'] as const,
    list: (filters: any) => ['roles', 'list', filters] as const,
    detail: (id: string) => ['roles', 'detail', id] as const,
  },
  menus: {
    tree: ['menus', 'tree'] as const,
    myMenus: ['menus', 'my-menus'] as const,
  },
  permissions: {
    all: ['permissions'] as const,
    grouped: ['permissions', 'grouped'] as const,
  }
};
