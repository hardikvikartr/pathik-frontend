import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { TOAST_MESSAGES } from '../utils/messages';

export function usePermission() {
  const { user } = useAuth();

  const hasPermission = (permission: string) => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;
    return user.permissions?.includes(permission) || user.permissions?.includes('*') || false;
  };

  const checkPermission = (permission: string, callback?: () => void) => {
    if (hasPermission(permission)) {
      if (callback) callback();
      return true;
    } else {
      toast.error(TOAST_MESSAGES.auth.permissionDenied);
      return false;
    }
  };

  return { hasPermission, checkPermission };
}
