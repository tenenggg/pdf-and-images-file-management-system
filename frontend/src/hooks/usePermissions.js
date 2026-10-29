import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { getCapabilitiesForRole } from '../utils/permissions';

export function usePermissions() {
  const { role, isAuthenticated } = useAuth();

  return useMemo(() => {
    if (!isAuthenticated || !role) {
      return getCapabilitiesForRole('user');
    }
    return getCapabilitiesForRole(role);
  }, [role, isAuthenticated]);
}
