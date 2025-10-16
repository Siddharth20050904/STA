// app/verify/page.tsx
import { Suspense } from 'react';
import VerifyContent from './VerifyContent'; // A component that uses useSearchParams()

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading verification details...</div>}>
      <VerifyContent />
    </Suspense>
  );
}