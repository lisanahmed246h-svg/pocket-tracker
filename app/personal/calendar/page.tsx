import { Suspense } from 'react';
import CalendarContent from './CalendarContent';

export default function CalendarPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">ক্যালেন্ডার লোড হচ্ছে...</div>}>
      <CalendarContent />
    </Suspense>
  );
}