/**
 * Registration Wizard Route — thin file.
 */
import { useLocalSearchParams } from 'expo-router';
import { RegistrationWizard } from '@/components/sections/RegistrationWizard';

export default function RegistrationWizardRoute() {
  const { id } = useLocalSearchParams();
  return <RegistrationWizard eventId={id as string} />;
}
