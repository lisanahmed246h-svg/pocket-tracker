// app/components/FamilyMode.tsx

'use client';

import { useState, useEffect } from 'react';
import { Plus, ShoppingCart, Bell, Zap, Flame, Droplets, Wifi, Check, X } from 'lucide-react';
import { FamilyData, GroceryItem, BillReminder } from '@/app/types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface FamilyModeProps {
  data: FamilyData;
  onUpdate: (data: FamilyData) => void;
}

export default function FamilyMode({ data, onUpdate }: FamilyModeProps) {
  const [showAddGrocery, setShowAddGrocery] = useState(false);
  const [showAddBill, setShowAddBill] = useState(false);
  const [newGrocery, setNewGrocery] = useState({ name: '', quantity: 1, unit: 'pcs' });
  const [newBill, setNewBill] = useState({
    type: 'electricity' as const,
    dueDate: '',
    amount: 0,
  });

  // Check for upcoming bills and trigger notifications
  useEffect(() => {
    const checkBills = () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      data.bills.forEach((bill) => {
        if (!bill.paid && !bill.notified) {
          const dueDate = new Date(bill.dueDate);
          const timeDiff = dueDate.getTime() - tomorrow.getTime();
          const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

          if (daysDiff <= 0) {
            // Bill is due tomorrow or today
            if (Notification.permission === 'granted') {
              new Notification(`Bill Reminder: ${bill.type}`, {
                body: `Your ${bill.type} bill of ৳${bill.amount} is due tomorrow!`,
                icon: '/favicon.ico',
              });
            }

            // Mark as notified
            markBillNotified(bill.id);
          }
        }
      });
    };

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    checkBills();
    const interval = setInterval(checkBills, 3600000); // Check every hour

    return () => clearInterval(interval);
  }, [data.bills]);

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

  const markBillNotified = (billId: string) => {
    onUpdate({
      ...data,
      bills: data.bills.map((b) => (b.id === billId ? { ...b, notified: true } : b)),
    });
  };

  const addGroceryItem = () => {
    if (!newGrocery.name) return;

    const item: GroceryItem = {
      id: Date.now().toString(),
      name: newGrocery.name,
      quantity: newGrocery.quantity,
      unit: newGrocery.unit,
      completed: false,
      addedBy: 'User', // In a real app, this would be the current user
    };

    onUpdate({
      ...data,
      groceryList: [...data.groceryList, item],
    });

    setNewGrocery({ name: '', quantity: 1, unit: 'pcs' });
    setShowAddGrocery(false);
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

    onUpdate({
      ...data,
      bills: [...data.bills, bill],
    });

    setNewBill({ type: 'electricity', dueDate: '', amount: 0 });
    setShowAddBill(false);
  };

  const toggleGroceryItem = (itemId: string) => {
    onUpdate({
      ...data,
      groceryList: data.groceryList.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      ),
    });
  };

  const toggleBillPaid = (billId: string) => {
    onUpdate({
      ...data,
      bills: data.bills.map((bill) =>
        bill.id === billId ? { ...bill, paid: !bill.paid } : bill
      ),
    });
  };

  const cardClasses = twMerge(
    clsx(
      'bg-white dark:bg-gray-900 rounded-2xl p-6',
      'border border-gray-200 dark:border-gray-800',
      'shadow-sm hover:shadow-md transition-shadow'
    )
  );

  // Get upcoming bills
  const upcomingBills = data.bills
    .filter((bill) => !bill.paid)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowAddGrocery(!showAddGrocery)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Add Grocery Item
        </button>
        <button
          onClick={() => setShowAddBill(!showAddBill)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors"
        >
          <Bell size={18} />
          Add Bill Reminder
        </button>
      </div>

      {/* Add Grocery Form */}
      {showAddGrocery && (
        <div className={cardClasses}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Grocery Item</h3>
            <button onClick={() => setShowAddGrocery(false)}>
              <X size={20} className="text-gray-500 hover:text-gray-700" />
            </button>
          </div>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Item Name"
              value={newGrocery.name}
              onChange={(e) => setNewGrocery({ ...newGrocery, name: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800"
            />
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Quantity"
                value={newGrocery.quantity}
                onChange={(e) => setNewGrocery({ ...newGrocery, quantity: Number(e.target.value) })}
                className="w-24 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800"
                min="1"
              />
              <select
                value={newGrocery.unit}
                onChange={(e) => setNewGrocery({ ...newGrocery, unit: e.target.value })}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800"
              >
                <option value="pcs">Pieces</option>
                <option value="kg">Kilograms</option>
                <option value="g">Grams</option>
                <option value="l">Liters</option>
                <option value="pack">Pack</option>
              </select>
            </div>
            <button
              onClick={addGroceryItem}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
            >
              Add Item
            </button>
          </div>
        </div>
      )}

      {/* Add Bill Form */}
      {showAddBill && (
        <div className={cardClasses}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Bill Reminder</h3>
            <button onClick={() => setShowAddBill(false)}>
              <X size={20} className="text-gray-500 hover:text-gray-700" />
            </button>
          </div>
          <div className="space-y-3">
            <select
              value={newBill.type}
              onChange={(e) => setNewBill({ ...newBill, type: e.target.value as any })}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800"
            >
              <option value="electricity">Electricity</option>
              <option value="gas">Gas</option>
              <option value="water">Water</option>
              <option value="internet">Internet</option>
            </select>
            <input
              type="date"
              value={newBill.dueDate}
              onChange={(e) => setNewBill({ ...newBill, dueDate: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800"
            />
            <input
              type="number"
              placeholder="Amount"
              value={newBill.amount || ''}
              onChange={(e) => setNewBill({ ...newBill, amount: Number(e.target.value) })}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800"
            />
            <button
              onClick={addBill}
              className="w-full px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700"
            >
              Add Reminder
            </button>
          </div>
        </div>
      )}

      {/* Upcoming Bills Alert */}
      {upcomingBills.length > 0 && (
        <div className={cardClasses}>
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Bills</h3>
          </div>
          <div className="space-y-2">
            {upcomingBills.slice(0, 3).map((bill) => {
              const dueDate = new Date(bill.dueDate);
              const today = new Date();
              const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

              return (
                <div
                  key={bill.id}
                  className={clsx(
                    'flex items-center justify-between p-3 rounded-xl',
                    daysUntil <= 1
                      ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                      : 'bg-gray-50 dark:bg-gray-800'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={clsx(
                      'p-2 rounded-lg',
                      daysUntil <= 1 ? 'bg-red-100 dark:bg-red-900/40' : 'bg-gray-200 dark:bg-gray-700'
                    )}>
                      {getBillIcon(bill.type)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">
                        {bill.type} Bill
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Due: {dueDate.toLocaleDateString()} {daysUntil <= 0 ? '(Today)' : daysUntil === 1 ? '(Tomorrow)' : `(${daysUntil} days)`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-900 dark:text-white">৳{bill.amount}</span>
                    <button
                      onClick={() => toggleBillPaid(bill.id)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Check size={18} className="text-green-600" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grocery List */}
      <div className={cardClasses}>
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Grocery List</h3>
          <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
            {data.groceryList.filter((item) => !item.completed).length} items left
          </span>
        </div>
        <div className="space-y-2">
          {data.groceryList.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">
              No items in grocery list
            </p>
          ) : (
            data.groceryList.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleGroceryItem(item.id)}
                className={clsx(
                  'flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors',
                  'hover:bg-gray-50 dark:hover:bg-gray-800',
                  item.completed && 'opacity-50'
                )}
              >
                <div className={clsx(
                  'w-5 h-5 rounded border-2 flex items-center justify-center',
                  item.completed
                    ? 'bg-green-500 border-green-500'
                    : 'border-gray-300 dark:border-gray-600'
                )}>
                  {item.completed && <Check size={14} className="text-white" />}
                </div>
                <div className="flex-1">
                  <p className={clsx(
                    'font-medium text-gray-900 dark:text-white',
                    item.completed && 'line-through'
                  )}>
                    {item.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {item.quantity} {item.unit}
                  </p>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  Added by {item.addedBy}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}