// app/family/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useAppData } from '@/app/hooks/useLocalStorage';
import { ShoppingCart, Bell, Users, Plus } from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { FamilyData } from '@/app/types';

export default function FamilyHome() {
  const { modeData, updateModeData } = useAppData('family');
  const familyData = modeData as FamilyData;
  
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Get upcoming bills
  const upcomingBills = familyData.bills
    ?.filter((bill) => !bill.paid)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3) || [];

  // Get pending grocery items
  const pendingGrocery = familyData.groceryList
    ?.filter((item) => !item.completed)
    .slice(0, 5) || [];

  const cardClasses = twMerge(
    'bg-white dark:bg-gray-900 rounded-2xl p-6',
    'border border-gray-200 dark:border-gray-800',
    'shadow-sm hover:shadow-md transition-shadow'
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          পরিবার মোড
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          পরিবারের বিল ও কেনাকাটার তালিকা পরিচালনা করুন
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Link
          href="/family/grocery"
          className={twMerge(cardClasses, 'hover:border-blue-300 dark:hover:border-blue-700')}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              কেনাকাটার তালিকা
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            {pendingGrocery.length} টি আইটেম বাকি
          </p>
          <div className="flex items-center text-sm text-blue-600">
            দেখুন
            <Plus size={16} className="ml-1" />
          </div>
        </Link>

        <Link
          href="/family/bills"
          className={twMerge(cardClasses, 'hover:border-blue-300 dark:hover:border-blue-700')}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Bell className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              বিল রিমাইন্ডার
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            {upcomingBills.length} টি বিল আসন্ন
          </p>
          <div className="flex items-center text-sm text-blue-600">
            দেখুন
            <Plus size={16} className="ml-1" />
          </div>
        </Link>
      </div>

      {/* Upcoming Bills Preview */}
      {upcomingBills.length > 0 && (
        <div className={cardClasses}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            আসন্ন বিলসমূহ
          </h3>
          <div className="space-y-3">
            {upcomingBills.map((bill) => {
              const dueDate = new Date(bill.dueDate);
              const today = new Date();
              const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
              
              return (
                <div
                  key={bill.id}
                  className={clsx(
                    'flex items-center justify-between p-3 rounded-xl',
                    daysUntil <= 2
                      ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                      : 'bg-gray-50 dark:bg-gray-800'
                  )}
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">
                      {bill.type} বিল
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      শেষ তারিখ: {dueDate.toLocaleDateString('bn-BD')}
                    </p>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">৳{bill.amount}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Family Members */}
      <div className={twMerge(cardClasses, 'mt-6')}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            পরিবারের সদস্য
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {familyData.members?.map((member) => (
            <div
              key={member.id}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm"
            >
              {member.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}