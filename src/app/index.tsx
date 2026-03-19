/**
 * Welcome Screen Route — thin file per best practices.
 * Imports the actual screen component from @/components/screens.
 */
import { WelcomeScreen } from '@/components/screens/WelcomeScreen';
import { useAppStore } from '@/store/appStore';
import { Redirect } from 'expo-router';

export default function WelcomeRoute() {
  const hasSeenWelcome = useAppStore((s) => s.hasSeenWelcome);

  if (hasSeenWelcome) {
    return <Redirect href="/(tabs)" />;
  }

  return <WelcomeScreen />;
}
