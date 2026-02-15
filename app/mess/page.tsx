// app/mess/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useAppData } from '@/app/hooks/useLocalStorage';
import { Users, ShoppingBag, UtensilsCrossed, Plus } from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MessData } from '@/app/types';

export default function MessHome() {
  const { modeData, updateModeData } = useAppData('mess');
  const messData = modeData as MessData;
  
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Calculate total bazar and meal rate
  const totalBazar = messData.bazarEntries?.reduce((sum, entry) => sum + entry.amount, 0) || 0;
  const totalMeals = messData.members?.reduce((sum, member) => sum + member.meals, 0) || 0;
  const mealRate = totalMeals > 0 ? totalBazar / totalMeals : 0;

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
          মেস মোড
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          মেসের খাবার ও খরচ হিসাব করুন
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={cardClasses}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট বাজার</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">৳{totalBazar}</p>
        </div>

        <div className={cardClasses}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট মিল</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalMeals}</p>
        </div>

        <div className={cardClasses}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <UtensilsCrossed className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">মিল রেট</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">৳{mealRate.toFixed(2)}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/mess/members"
          className={twMerge(cardClasses, 'hover:border-blue-300 dark:hover:border-blue-700')}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
              <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">সদস্য管理</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            {messData.members?.length || 0} জন সদস্য
          </p>
          <div className="flex items-center text-sm text-blue-600">
            দেখুন
            <Plus size={16} className="ml-1" />
          </div>
        </Link>

        <Link
          href="/mess/bazar"
          className={twMerge(cardClasses, 'hover:border-blue-300 dark:hover:border-blue-700')}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">বাজার খরচ</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            {messData.bazarEntries?.length || 0} টি এন্ট্রি
          </p>
          <div className="flex items-center text-sm text-blue-600">
            দেখুন
            <Plus size={16} className="ml-1" />
          </div>
        </Link>

        <Link
          href="/mess/meals"
          className={twMerge(cardClasses, 'hover:border-blue-300 dark:hover:border-blue-700')}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <UtensilsCrossed className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">মিল হিসাব</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            মোট {totalMeals} মিল
          </p>
          <div className="flex items-center text-sm text-blue-600">
            দেখুন
            <Plus size={16} className="ml-1" />
          </div>
        </Link>
      </div>
    </div>
  );
}