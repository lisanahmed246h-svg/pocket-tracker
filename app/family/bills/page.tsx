// app/family/bills/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useAppData } from '@/app/hooks/useLocalStorage';
import { ArrowLeft, Bell, Zap, Flame, Droplets, Wifi, Check, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { FamilyData, BillReminder } from '@/app/types';

export default function BillsPage() {
  const { modeData, updateModeData } = useAppData('family');
  const familyData = modeData as FamilyData;
  
  const [showAddBill, setShowAddBill] = useState(false);
  const [newBill, setNewBill] = useState({
    type: 'electricity' as const,
    dueDate: '',
    amount: 0,
  });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const getBillIcon = (type: string) => {
    switch (type) {
      case 'electricity':
        return <Zap className="w-4 h-4" />;
      case 'gas':
        return <Flame className="w-4 h-4" />;
      case 'water':
        return <Droplets className="w-4 h-4" />;
      case 'internet':
        return <Wifi className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const addBill = () => {
    if (!newBill.dueDate || !newBill.amount) return;

    const bill: BillReminder = {
      id: Date.now().toString(),
      type: newBill.type,
      dueDate: newBill.dueDate,
      amount: newBill.amount,
      paid: false,
      notified: false,
    };

    updateModeData({
      ...familyData,
      bills: [...familyData.bills, bill],
    });

    setNewBill({ type: 'electricity', dueDate: '', amount: 0 });
    setShowAddBill(false);
  };

  const toggleBillPaid = (billId: string) => {
    updateModeData({
      ...familyData,
      bills: familyData.bills.map((bill) =>
        bill.id === billId ? { ...bill, paid: !bill.paid } : bill
      ),
    });
  };

  if (!isMounted) {
    return <div className="p-8 text-center">লোড হচ্ছে...</div>;
  }

  const cardClasses = twMerge(
    'bg-white dark:bg-gray-900 rounded-2xl p-6',
    'border border-gray-200 dark:border-gray-800',
    'shadow-sm'
  );

  // Sort bills by due date
  const sortedBills = [...familyData.bills].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  const upcomingBills = sortedBills.filter((bill) => !bill.paid);
  const paidBills = sortedBills.filter((bill) => bill.paid);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/family"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
        >
          <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            বিল রিমাইন্ডার
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            পরিবারের বিলসমূহ পরিচালনা করুন
          </p>
        </div>
      </div>

      {/* Add Bill Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowAddBill(!showAddBill)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
        >
          <Plus size={18} />
          নতুন বিল যোগ করুন
        </button>
      </div>

      {/* Add Bill Form */}
      {showAddBill && (
        <div className={twMerge(cardClasses, 'mb-6')}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              নতুন বিল রিমাইন্ডার
            </h3>
            <button onClick={() => setShowAddBill(false)}>
              <X size={20} className="text-gray-500 hover:text-gray-700" />
            </button>
          </div>
          <div className="space-y-3">
            <select
              value={newBill.type}
              onChange={(e) => setNewBill({ ...newBill, type: e.target.value as any })}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <option value="electricity">বিদ্যুৎ বিল</option>
              <option value="gas">গ্যাস বিল</option>
              <option value="water">পানি বিল</option>
              <option value="internet">ইন্টারনেট বিল</option>
            </select>
            <input
              type="date"
              value={newBill.dueDate}
              onChange={(e) => setNewBill({ ...newBill, dueDate: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
            <input
              type="number"
              placeholder="পরিমাণ (টাকা)"
              value={newBill.amount || ''}
              onChange={(e) => setNewBill({ ...newBill, amount: Number(e.target.value) })}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
            <button
              onClick={addBill}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
            >
              সংরক্ষণ করুন
            </button>
          </div>
        </div>
      )}

      {/* Upcoming Bills */}
      <div className={cardClasses}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          আসন্ন বিলসমূহ
        </h3>
        {upcomingBills.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            কোনো আসন্ন বিল নেই
          </p>
        ) : (
          <div className="space-y-3">
            {upcomingBills.map((bill) => {
              const dueDate = new Date(bill.dueDate);
              const today = new Date();
              const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
              const isUrgent = daysUntil <= 2;

              return (
                <div
                  key={bill.id}
                  className={clsx(
                    'flex items-center justify-between p-3 rounded-xl',
                    isUrgent
                      ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                      : 'bg-gray-50 dark:bg-gray-800'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={clsx(
                      'p-2 rounded-lg',
                      isUrgent ? 'bg-red-100 dark:bg-red-900/40' : 'bg-gray-200 dark:bg-gray-700'
                    )}>
                      {getBillIcon(bill.type)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">
                        {bill.type} বিল
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        শেষ তারিখ: {dueDate.toLocaleDateString('bn-BD')} 
                        {daysUntil <= 0 ? ' (আজ)' : daysUntil === 1 ? ' (আগামীকাল)' : ` (${daysUntil} দিন বাকি)`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-900 dark:text-white">৳{bill.amount}</span>
                    <button
                      onClick={() => toggleBillPaid(bill.id)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="পরিশোধ করা হয়েছে"
                    >
                      <Check size={18} className="text-green-600" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Paid Bills */}
      {paidBills.length > 0 && (
        <div className={twMerge(cardClasses, 'mt-6')}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            পরিশোধিত বিলসমূহ
          </h3>
          <div className="space-y-2">
            {paidBills.map((bill) => (
              <div
                key={bill.id}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg opacity-60"
              >
                <div className="flex items-center gap-2">
                  {getBillIcon(bill.type)}
                  <span className="text-sm text-gray-900 dark:text-white capitalize">
                    {bill.type}
                  </span>
                </div>
                <span className="text-sm text-gray-500 line-through">৳{bill.amount}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}