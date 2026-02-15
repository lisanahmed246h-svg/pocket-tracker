// app/personal/calendar/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppData } from '@/app/hooks/useLocalStorage';
import { ArrowLeft, Gift } from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { PersonalData, MonthData } from '@/app/types';

export default function CalendarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const monthId = searchParams.get('monthId');
  
  const { modeData } = useAppData('personal');
  // Type assertion: personal mode এ আমরা জানি এটি PersonalData টাইপ
  const personalData = modeData as PersonalData;
  
  const [month, setMonth] = useState<MonthData | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // মাস খুঁজে বের করা
    if (monthId && personalData) {
      // প্রথমে currentMonth চেক
      if (personalData.currentMonth?.id === monthId) {
        setMonth(personalData.currentMonth);
      } else {
        // তারপর history তে খোঁজা
        const historyMonth = personalData.monthHistory?.find((m) => m.id === monthId);
        if (historyMonth) {
          setMonth(historyMonth);
        } else {
          // না পেলে হোম পৃষ্ঠায় ফিরে যাওয়া
          router.push('/personal');
        }
      }
    }
  }, [monthId, personalData, router]);

  // পরবর্তী ৩০ দিন জেনারেট করা
  const getNext30Days = () => {
    if (!month) return [];
    
    const days = [];
    const startDate = new Date(month.startDate);
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    
    return days;
  };

  // নির্দিষ্ট তারিখের খরচ বের করা
  const getExpensesForDate = (date: Date) => {
    if (!month) return [];
    
    const dateStr = date.toISOString().split('T')[0];
    return month.expenses.filter((expense) => 
      expense.date.split('T')[0] === dateStr
    );
  };

  if (!isMounted || !month) {
    return <div className="p-8 text-center">লোড হচ্ছে...</div>;
  }

  const next30Days = getNext30Days();
  const startDate = new Date(month.startDate);
  const endDate = new Date(month.endDate);
  const daysLeft = Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const spentPercentage = (month.totalSpent / month.initialBudget) * 100;

  const cardClasses = twMerge(
    'bg-white dark:bg-gray-900 rounded-2xl p-6',
    'border border-gray-200 dark:border-gray-800',
    'shadow-sm'
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* হেডার */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/personal"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
        >
          <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {month.name}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {startDate.toLocaleDateString('bn-BD')} - {endDate.toLocaleDateString('bn-BD')}
          </p>
        </div>
      </div>

      {/* সারাংশ কার্ড */}
      <div className={twMerge(cardClasses, 'mb-6')}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">মোট বাজেট</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">৳{month.initialBudget}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">ব্যয় হয়েছে</p>
            <p className="text-xl font-bold text-blue-600">৳{month.totalSpent}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">অবশিষ্ট</p>
            <p className="text-xl font-bold text-green-600">৳{month.remainingBudget}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">বাকি দিন</p>
            <p className="text-xl font-bold text-orange-600">{daysLeft} দিন</p>
          </div>
        </div>

        {/* প্রোগ্রেস বার */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>অগ্রগতি</span>
            <span>{spentPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={clsx(
                'h-full rounded-full',
                spentPercentage > 100 ? 'bg-red-500' : 'bg-blue-500'
              )}
              style={{ width: `${Math.min(spentPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* ক্যাটাগরি সেকশন (যদি থাকে) */}
      {month.categories && month.categories.length > 0 && (
        <div className={twMerge(cardClasses, 'mb-6')}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            ক্যাটাগরি অনুযায়ী বাজেট
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {month.categories.map((cat) => {
              const percentage = (cat.spent / cat.limit) * 100;
              return (
                <div key={cat.name} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-sm font-medium">{cat.name}</span>
                    </div>
                    <span className="text-sm">৳{cat.spent} / ৳{cat.limit}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ৩০ দিনের ক্যালেন্ডার */}
      <div className={cardClasses}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          পরবর্তী ৩০ দিন
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {next30Days.map((date, index) => {
            const dateStr = date.toISOString().split('T')[0];
            const dayExpenses = getExpensesForDate(date);
            const totalSpent = dayExpenses.reduce((sum, e) => sum + e.totalAmount, 0);
            const specialEvent = month.specialEvents?.[dateStr];
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <Link
                key={index}
                href={`/personal/day/${dateStr}?monthId=${month.id}`}
                className={clsx(
                  'block p-3 rounded-xl border transition-all',
                  'hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800',
                  isToday && 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
                  dayExpenses.length > 0 
                    ? 'border-green-200 dark:border-green-800' 
                    : 'border-gray-200 dark:border-gray-700'
                )}
              >
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {date.toLocaleDateString('bn-BD', { weekday: 'short' })}
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {date.getDate()}
                </div>
                
                {specialEvent && (
                  <div className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 mb-1">
                    <Gift size={12} />
                    <span className="truncate">{specialEvent}</span>
                  </div>
                )}
                
                {totalSpent > 0 && (
                  <div className="text-xs font-medium text-green-600 dark:text-green-400">
                    ৳{totalSpent}
                  </div>
                )}
                
                {dayExpenses.length > 0 && (
                  <div className="flex -space-x-1 mt-1">
                    {dayExpenses.slice(0, 3).map((expense, i) => (
                      <div
                        key={i}
                        className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-[10px] border-2 border-white dark:border-gray-900"
                        title={expense.note || 'খরচ'}
                      >
                        {expense.items?.length || 1}
                      </div>
                    ))}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}