import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../api/settings.api';
import { UpdateSettingData } from '../types/setting.types';

export const SETTING_KEYS = {
  all: ['settings'] as const,
  group: (group: string) => [...SETTING_KEYS.all, 'group', group] as const,
};

export function useSettingsGroup(group: string) {
  return useQuery({
    queryKey: SETTING_KEYS.group(group),
    queryFn: () => settingsApi.getGroup(group),
  });
}

export function useUpdateSettingsGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ group, data }: { group: string; data: UpdateSettingData }) =>
      settingsApi.updateGroup(group, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: SETTING_KEYS.group(variables.group) });
      queryClient.invalidateQueries({ queryKey: SETTING_KEYS.all });
    },
  });
}
