'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function GroceryPage() {
  return (
    <div className="p-6">
      <Link href="/family" className="flex items-center gap-2 text-blue-600 mb-4">
        <ArrowLeft size={20} />
        ফিরে যান
      </Link>
      <h1 className="text-2xl font-bold">কেনাকাটার তালিকা</h1>
      <p className="text-gray-500 mt-4">শীঘ্রই আসছে...</p>
    </div>
  );
}