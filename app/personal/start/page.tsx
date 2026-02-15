// app/personal/start/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppData } from '@/app/hooks/useLocalStorage';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { PersonalData, MonthData, BudgetCategory } from '@/app/types';

const DEFAULT_CATEGORIES: Omit<BudgetCategory, 'spent'>[] = [
  { name: 'খাবার', limit: 0, color: '#3B82F6' },
  { name: 'পরিবহন', limit: 0, color: '#10B981' },
  { name: 'বাসা ভাড়া', limit: 0, color: '#F59E0B' },
  { name: 'শপিং', limit: 0, color: '#8B5CF6' },
  { name: 'বিনোদন', limit: 0, color: '#EC4899' },
  { name: 'অন্যান্য', limit: 0, color: '#6B7280' },
];

export default function StartMonth() {
  const router = useRouter();
  const { modeData, updateModeData } = useAppData('personal');
  // Type assertion
  const personalData = modeData as PersonalData;
  
  const [isMounted, setIsMounted] = useState(false);

  // ফর্ম স্টেট
  const [monthName, setMonthName] = useState('');
  const [totalBudget, setTotalBudget] = useState<number>(0);
  const [distributeByCategory, setDistributeByCategory] = useState(false);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setIsMounted(true);
    
    // ডিফল্ট মাসের নাম সেট করা (চলতি মাস)
    const today = new Date();
    const defaultName = today.toLocaleDateString('bn-BD', { month: 'long', year: 'numeric' });
    setMonthName(defaultName);
  }, []);

  // ক্যাটাগরির বরাদ্দ আপডেট
  const handleCategoryChange = (index: number, value: number) => {
    const newCategories = [...categories];
    newCategories[index].limit = value;
    setCategories(newCategories);
  };

  // ফর্ম জমা দেওয়া
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ভ্যালিডেশন
    const newErrors: Record<string, string> = {};
    
    if (!monthName.trim()) {
      newErrors.monthName = 'মাসের নাম দিন';
    }
    
    if (totalBudget <= 0) {
      newErrors.totalBudget = 'বৈধ বাজেট দিন';
    }

    if (distributeByCategory) {
      const totalCategoryBudget = categories.reduce((sum, cat) => sum + cat.limit, 0);
      if (totalCategoryBudget > totalBudget) {
        newErrors.categories = 'ক্যাটাগরির মোট বরাদ্দ মোট বাজেটের বেশি হতে পারবে না';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // নতুন মাস তৈরি
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 30);

    const newMonth: MonthData = {
      id: Date.now().toString(),
      name: monthName,
      startDate: today.toISOString(),
      endDate: endDate.toISOString(),
      initialBudget: totalBudget,
      remainingBudget: totalBudget,
      expenses: [],
      totalSpent: 0,
      isCompleted: false,
      specialEvents: {},
    };

    // যদি ক্যাটাগরিতে ভাগ করা হয়
    if (distributeByCategory) {
      newMonth.categories = categories.map(cat => ({
        ...cat,
        spent: 0,
      }));
    }

    // আপডেট লোকাল স্টোরেজ
    const updatedPersonal = {
      ...personalData,
      currentMonth: newMonth,
      monthHistory: [...(personalData.monthHistory || []), newMonth],
    };

    updateModeData(updatedPersonal);

    // ক্যালেন্ডার পৃষ্ঠায় রিডিরেক্ট
    router.push(`/personal/calendar?monthId=${newMonth.id}`);
  };

  if (!isMounted) {
    return <div className="p-8 text-center">লোড হচ্ছে...</div>;
  }

  const cardClasses = twMerge(
    'bg-white dark:bg-gray-900 rounded-2xl p-6',
    'border border-gray-200 dark:border-gray-800',
    'shadow-sm'
  );

  const inputClasses = twMerge(
    'w-full px-4 py-2.5 rounded-xl',
    'border border-gray-200 dark:border-gray-700',
    'bg-white dark:bg-gray-800',
    'focus:outline-none focus:ring-2 focus:ring-blue-500/50'
  );

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* ব্যাক বাটন */}
      <Link
        href="/personal"
        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
      >
        <ArrowLeft size={20} />
        ফিরে যান
      </Link>

      <div className={cardClasses}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          নতুন মাস শুরু করুন
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* মাসের নাম */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              মাসের নাম <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={monthName}
              onChange={(e) => setMonthName(e.target.value)}
              className={inputClasses}
              placeholder="যেমন: ফেব্রুয়ারি ২০২৬"
            />
            {errors.monthName && (
              <p className="text-sm text-red-500 mt-1">{errors.monthName}</p>
            )}
          </div>

          {/* মোট বাজেট */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              মোট বাজেট (টাকা) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={totalBudget || ''}
              onChange={(e) => setTotalBudget(Number(e.target.value))}
              className={inputClasses}
              placeholder="যেমন: 30000"
              min="0"
            />
            {errors.totalBudget && (
              <p className="text-sm text-red-500 mt-1">{errors.totalBudget}</p>
            )}
          </div>

          {/* ক্যাটাগরিতে ভাগ করার অপশন */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="distribute"
              checked={distributeByCategory}
              onChange={(e) => setDistributeByCategory(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600"
            />
            <label htmlFor="distribute" className="text-sm text-gray-700 dark:text-gray-300">
              বাজেট ক্যাটাগরিতে ভাগ করুন (ঐচ্ছিক)
            </label>
          </div>

          {/* ক্যাটাগরি লিস্ট (শুধু চেক করলে দেখাবে) */}
          {distributeByCategory && (
            <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <h3 className="font-medium text-gray-900 dark:text-white">
                ক্যাটাগরি অনুযায়ী বরাদ্দ
              </h3>
              
              {categories.map((category, index) => (
                <div key={category.name} className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-24">
                    {category.name}
                  </span>
                  <input
                    type="number"
                    value={category.limit || ''}
                    onChange={(e) => handleCategoryChange(index, Number(e.target.value))}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                    placeholder="বরাদ্দ"
                    min="0"
                  />
                </div>
              ))}

              {/* মোট ক্যাটাগরি বাজেট */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-sm font-medium">
                  <span>মোট বরাদ্দ</span>
                  <span className={clsx(
                    categories.reduce((sum, cat) => sum + cat.limit, 0) > totalBudget
                      ? 'text-red-500'
                      : 'text-green-600'
                  )}>
                    ৳{categories.reduce((sum, cat) => sum + cat.limit, 0)} / ৳{totalBudget}
                  </span>
                </div>
              </div>

              {errors.categories && (
                <p className="text-sm text-red-500">{errors.categories}</p>
              )}
            </div>
          )}

          {/* সাবমিট বাটন */}
          <button
            type="submit"
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            মাস শুরু করুন
          </button>
        </form>
      </div>
    </div>
  );
}