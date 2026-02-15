// app/personal/day/[date]/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useAppData } from '@/app/hooks/useLocalStorage';
import { ArrowLeft, Plus, Trash2, Gift } from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { PersonalData, MonthData, Expense, ExpenseItem } from '@/app/types';

export default function DayPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const date = params.date as string;
  const monthId = searchParams.get('monthId');
  
  const { modeData, updateModeData } = useAppData('personal');
  // Type assertion: personal mode এ আমরা জানি এটি PersonalData টাইপ
  const personalData = modeData as PersonalData;
  
  const [month, setMonth] = useState<MonthData | null>(null);
  const [dayExpenses, setDayExpenses] = useState<Expense[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  
  // নতুন আইটেম ফর্ম স্টেট
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 1,
    unit: 'পিস',
    price: 0,
    category: '',
  });
  const [specialEvent, setSpecialEvent] = useState('');

  useEffect(() => {
    setIsMounted(true);
    
    // মাস খুঁজে বের করা
    if (monthId && personalData) {
      let foundMonth: MonthData | null = null;
      if (personalData.currentMonth?.id === monthId) {
        foundMonth = personalData.currentMonth;
      } else {
        foundMonth = personalData.monthHistory?.find((m) => m.id === monthId) || null;
      }
      
      if (foundMonth) {
        setMonth(foundMonth);
        
        // এই তারিখের খরচ গুলো বের করা
        const expenses = foundMonth.expenses.filter((exp) => 
          exp.date.split('T')[0] === date
        );
        setDayExpenses(expenses);
        
        // স্পেশাল ইভেন্ট থাকলে সেট করা
        if (foundMonth.specialEvents?.[date]) {
          setSpecialEvent(foundMonth.specialEvents[date]);
        }
      } else {
        router.push('/personal');
      }
    }
  }, [monthId, date, personalData, router]);

  // নতুন আইটেম যোগ করা
  const addExpenseItem = () => {
    if (!month || !newItem.name || newItem.price <= 0 || !newItem.category) return;

    const item: ExpenseItem = {
      id: Date.now().toString() + Math.random(),
      name: newItem.name,
      quantity: newItem.quantity,
      unit: newItem.unit,
      price: newItem.price,
      category: newItem.category,
    };

    // খরচের আইটেমগুলো আগে থেকে আছে কিনা চেক করা
    const existingExpense = dayExpenses.find(e => 
      e.date.split('T')[0] === date && e.note === 'দৈনিক খরচ'
    );

    let updatedExpenses = [...month.expenses];
    const totalItemPrice = item.price * item.quantity;

    if (existingExpense) {
      // আগের খরচ আপডেট
      existingExpense.items.push(item);
      existingExpense.totalAmount += totalItemPrice;
    } else {
      // নতুন খরচ তৈরি
      const newExpense: Expense = {
        id: Date.now().toString(),
        date: new Date(date).toISOString(),
        items: [item],
        totalAmount: totalItemPrice,
        note: 'দৈনিক খরচ',
      };
      updatedExpenses.push(newExpense);
      setDayExpenses([...dayExpenses, newExpense]);
    }

    // মাসের মোট খরচ ও অবশিষ্ট বাজেট আপডেট
    const updatedMonth = {
      ...month,
      expenses: updatedExpenses,
      totalSpent: month.totalSpent + totalItemPrice,
      remainingBudget: month.remainingBudget - totalItemPrice,
    };

    // ক্যাটাগরি বাজেট আপডেট (যদি থাকে)
    if (updatedMonth.categories) {
      updatedMonth.categories = updatedMonth.categories.map((cat) => {
        if (cat.name === newItem.category) {
          return {
            ...cat,
            spent: cat.spent + totalItemPrice,
          };
        }
        return cat;
      });
    }

    // লোকাল স্টোরেজ আপডেট
    updatePersonalData(updatedMonth);

    // ফর্ম রিসেট
    setNewItem({
      name: '',
      quantity: 1,
      unit: 'পিস',
      price: 0,
      category: '',
    });
    setShowAddForm(false);
  };

  // স্পেশাল ইভেন্ট সেভ করা
  const saveSpecialEvent = () => {
    if (!month || !specialEvent.trim()) return;

    const updatedMonth = {
      ...month,
      specialEvents: {
        ...month.specialEvents,
        [date]: specialEvent,
      },
    };

    updatePersonalData(updatedMonth);
  };

  // পার্সোনাল ডেটা আপডেট
  const updatePersonalData = (updatedMonth: MonthData) => {
    if (!personalData) return;

    if (personalData.currentMonth?.id === monthId) {
      updateModeData({
        ...personalData,
        currentMonth: updatedMonth,
      });
    } else {
      const updatedHistory = personalData.monthHistory?.map((m) =>
        m.id === monthId ? updatedMonth : m
      ) || [];
      updateModeData({
        ...personalData,
        monthHistory: updatedHistory,
      });
    }
    setMonth(updatedMonth);
  };

  if (!isMounted || !month) {
    return <div className="p-8 text-center">লোড হচ্ছে...</div>;
  }

  const formattedDate = new Date(date).toLocaleDateString('bn-BD', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const cardClasses = twMerge(
    'bg-white dark:bg-gray-900 rounded-2xl p-6',
    'border border-gray-200 dark:border-gray-800',
    'shadow-sm'
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* হেডার */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={`/personal/calendar?monthId=${monthId}`}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
        >
          <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {formattedDate}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {month.name}
          </p>
        </div>
      </div>

      {/* স্পেশাল ইভেন্ট */}
      <div className={twMerge(cardClasses, 'mb-6')}>
        <div className="flex items-center gap-2 mb-3">
          <Gift size={18} className="text-purple-500" />
          <h3 className="font-medium text-gray-900 dark:text-white">বিশেষ ইভেন্ট</h3>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={specialEvent}
            onChange={(e) => setSpecialEvent(e.target.value)}
            placeholder="যেমন: বন্ধুর জন্মদিন"
            className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          />
          <button
            onClick={saveSpecialEvent}
            className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700"
          >
            সংরক্ষণ
          </button>
        </div>
      </div>

      {/* খরচের তালিকা */}
      <div className={cardClasses}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            আজকের খরচ
          </h3>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            <Plus size={16} />
            নতুন আইটেম
          </button>
        </div>

        {/* নতুন আইটেম ফর্ম */}
        {showAddForm && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              নতুন খরচের আইটেম
            </h4>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="আইটেমের নাম"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                />
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                >
                  <option value="">ক্যাটাগরি</option>
                  {month.categories ? (
                    month.categories.map((cat) => (
                      <option key={cat.name} value={cat.name}>{cat.name}</option>
                    ))
                  ) : (
                    <>
                      <option value="খাবার">খাবার</option>
                      <option value="পরিবহন">পরিবহন</option>
                      <option value="বাসা ভাড়া">বাসা ভাড়া</option>
                      <option value="শপিং">শপিং</option>
                      <option value="বিনোদন">বিনোদন</option>
                      <option value="অন্যান্য">অন্যান্য</option>
                    </>
                  )}
                </select>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  placeholder="পরিমাণ"
                  value={newItem.quantity || ''}
                  onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                  min="0"
                />
                <select
                  value={newItem.unit}
                  onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                >
                  <option value="পিস">পিস</option>
                  <option value="কেজি">কেজি</option>
                  <option value="গ্রাম">গ্রাম</option>
                  <option value="লিটার">লিটার</option>
                  <option value="প্যাকেট">প্যাকেট</option>
                </select>
                <input
                  type="number"
                  placeholder="দাম"
                  value={newItem.price || ''}
                  onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                  min="0"
                />
              </div>

              <button
                onClick={addExpenseItem}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                আইটেম যোগ করুন
              </button>
            </div>
          </div>
        )}

        {/* খরচের টেবিল */}
        {dayExpenses.length > 0 ? (
          <div className="space-y-4">
            {dayExpenses.map((expense) => (
              <div key={expense.id}>
                {expense.items.map((item, idx) => (
                  <div
                    key={item.id}
                    className={clsx(
                      'flex items-center justify-between p-3',
                      idx !== expense.items.length - 1 && 'border-b border-gray-100 dark:border-gray-800'
                    )}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                          {item.category}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {item.quantity} {item.unit} × ৳{item.price}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-medium text-gray-900 dark:text-white">
                        ৳{(item.price * item.quantity).toFixed(0)}
                      </span>
                      <button className="text-red-500 hover:text-red-700">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {/* মোট খরচ */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between font-bold">
                <span>মোট</span>
                <span className="text-blue-600">
                  ৳{dayExpenses.reduce((sum, e) => sum + e.totalAmount, 0)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            আজকের জন্য কোনো খরচ নেই
          </p>
        )}
      </div>

      {/* ব্যালেন্স তথ্য */}
      <div className={twMerge(cardClasses, 'mt-6')}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">মাসের বাকি বাজেট</p>
            <p className="text-xl font-bold text-green-600">৳{month.remainingBudget}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">আজকের মোট খরচ</p>
            <p className="text-xl font-bold text-blue-600">
              ৳{dayExpenses.reduce((sum, e) => sum + e.totalAmount, 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}