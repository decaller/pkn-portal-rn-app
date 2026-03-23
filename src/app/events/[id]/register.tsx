/**
 * Registration Wizard Route — thin file.
 */
import { useLocalSearchParams } from 'expo-router';
import { RegistrationWizard } from '@/components/sections/RegistrationWizard';

export default function RegistrationWizardRoute() {
  const { id, step, regId } = useLocalSearchParams();
  return (
    <RegistrationWizard 
      eventId={id as string} 
      regId={regId as string}
      initialStep={step ? parseInt(step as string, 10) : 1}
    />
  );
}
