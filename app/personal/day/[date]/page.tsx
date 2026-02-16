// app/personal/day/[date]/page.tsx
import { Suspense } from 'react';
import DayContent from './DayContent';

export default function DayPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">পৃষ্ঠা লোড হচ্ছে...</div>}>
      <DayContent />
    </Suspense>
  );
}