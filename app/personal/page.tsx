// app/personal/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useAppData } from '@/app/hooks/useLocalStorage';
import { Plus, Wallet, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { PersonalData, MonthData } from '@/app/types';

export default function PersonalHome() {
  const router = useRouter();
  const { modeData, updateModeData } = useAppData('personal');
  // Type assertion: personal mode এ আমরা জানি এটি PersonalData টাইপ
  const personalData = modeData as PersonalData;
  
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

  const { currentMonth, monthHistory = [] } = personalData;

  // চেক করা হচ্ছে বর্তমান মাস শেষ হয়েছে কিনা
  const isCurrentMonthExpired = currentMonth 
    ? new Date(currentMonth.endDate) < new Date() 
    : false;

  // নতুন মাস শুরু করার বাটন
  const handleStartNewMonth = () => {
    router.push('/personal/start');
  };

  // একটি মাসের কার্ড কম্পোনেন্ট
  const MonthCard = ({ month, isActive = false }: { month: MonthData; isActive?: boolean }) => {
    const startDate = new Date(month.startDate);
    const endDate = new Date(month.endDate);
    const spentPercentage = (month.totalSpent / month.initialBudget) * 100;
    
    return (
      <Link
        href={`/personal/calendar?monthId=${month.id}`}
        className={twMerge(
          'block p-5 rounded-2xl border transition-all hover:shadow-lg',
          isActive 
            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'
        )}
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{month.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {startDate.toLocaleDateString('bn-BD')} - {endDate.toLocaleDateString('bn-BD')}
            </p>
          </div>
          {isActive && (
            <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs rounded-full">
              চলমান
            </span>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">ব্যয়</span>
            <span className="font-medium text-gray-900 dark:text-white">৳{month.totalSpent}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">বাজেট</span>
            <span className="font-medium text-gray-900 dark:text-white">৳{month.initialBudget}</span>
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
          {month.categories && month.categories.length > 0 && (
            <div className="flex items-center gap-1 mt-2">
              {month.categories.slice(0, 4).map((cat) => (
                <div
                  key={cat.name}
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: cat.color }}
                  title={cat.name}
                />
              ))}
              {month.categories.length > 4 && (
                <MoreHorizontal size={12} className="text-gray-400" />
              )}
            </div>
          )}
        </div>
      </Link>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* হেডার */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            ব্যক্তিগত ট্র্যাকার
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            আপনার মাসিক বাজেট ও খরচ পরিচালনা করুন
          </p>
        </div>
        <button
          onClick={handleStartNewMonth}
          disabled={!!(currentMonth && !isCurrentMonthExpired)}
          className={twMerge(
            'flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium transition-all',
            'hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          title={currentMonth && !isCurrentMonthExpired ? 'বর্তমান মাস শেষ না হওয়া পর্যন্ত নতুন মাস শুরু করা যাবে না' : ''}
        >
          <Plus size={20} />
          নতুন মাস শুরু
        </button>
      </div>

      {/* চলমান মাস */}
      {currentMonth && !isCurrentMonthExpired && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            চলমান মাস
          </h2>
          <MonthCard month={currentMonth} isActive={true} />
        </div>
      )}

      {/* আগের মাসগুলোর ইতিহাস */}
      {monthHistory.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            আগের মাসসমূহ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {monthHistory.map((month) => (
              <MonthCard key={month.id} month={month} />
            ))}
          </div>
        </div>
      )}

      {/* যদি কোনো মাস না থাকে */}
      {!currentMonth && monthHistory.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            এখনো কোনো মাস শুরু করেননি
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            আপনার প্রথম মাস শুরু করতে &quot;নতুন মাস শুরু&quot; বাটনে ক্লিক করুন
          </p>
          <button
            onClick={handleStartNewMonth}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
          >
            <Plus size={20} />
            প্রথম মাস শুরু করুন
          </button>
        </div>
      )}
    </div>
  );
}