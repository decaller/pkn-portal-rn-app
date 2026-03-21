/**
 * Dashboard Tab Route — thin file.
 */
import { GuestDashboard } from '@/components/screens/GuestDashboard';
import { AuthenticatedDashboard } from '@/components/screens/AuthenticatedDashboard';
import { useAuthStore } from '@/store/authStore';

export default function DashboardRoute() {
  const { isAuthenticated } = useAuthStore();
  
  return isAuthenticated ? <AuthenticatedDashboard /> : <GuestDashboard />;
}
