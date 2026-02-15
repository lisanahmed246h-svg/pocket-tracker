// app/components/MessMode.tsx

'use client';

import { useState } from 'react';
import { Plus, Users, ShoppingBag, Calculator, X } from 'lucide-react';
import { MessData, MessMember, BazarEntry } from '../types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface MessModeProps {
  data: MessData;
  onUpdate: (data: MessData) => void;
}

export default function MessMode({ data, onUpdate }: MessModeProps) {
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddBazar, setShowAddBazar] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', fixedCosts: 0 });
  const [newBazar, setNewBazar] = useState({ amount: 0, description: '', purchasedBy: '' });

  // Calculate total bazar and meal rate
  const totalBazar = data.bazarEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const totalMeals = data.members.reduce((sum, member) => sum + member.meals, 0);
  const mealRate = totalMeals > 0 ? totalBazar / totalMeals : 0;

  // Calculate individual balances
  const memberBalances = data.members.map((member) => {
    const mealCost = mealRate * member.meals;
    const totalCost = mealCost + member.fixedCosts;
    return {
      ...member,
      mealCost,
      totalCost,
    };
  });

  const addMember = () => {
    if (!newMember.name) return;

    const member: MessMember = {
      id: Date.now().toString(),
      name: newMember.name,
      meals: 0,
      fixedCosts: newMember.fixedCosts,
    };

    onUpdate({
      ...data,
      members: [...data.members, member],
    });

    setNewMember({ name: '', fixedCosts: 0 });
    setShowAddMember(false);
  };

  const addBazar = () => {
    if (!newBazar.description || !newBazar.amount || !newBazar.purchasedBy) return;

    const bazar: BazarEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      amount: newBazar.amount,
      description: newBazar.description,
      purchasedBy: newBazar.purchasedBy,
    };

    onUpdate({
      ...data,
      bazarEntries: [...data.bazarEntries, bazar],
    });

    setNewBazar({ amount: 0, description: '', purchasedBy: '' });
    setShowAddBazar(false);
  };

  const updateMemberMeals = (memberId: string, meals: number) => {
    onUpdate({
      ...data,
      members: data.members.map((m) =>
        m.id === memberId ? { ...m, meals: Math.max(0, meals) } : m
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

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={cardClasses}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Bazar</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ৳{totalBazar.toFixed(2)}
          </p>
        </div>

        <div className={cardClasses}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Meals</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalMeals}</p>
        </div>

        <div className={cardClasses}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Calculator className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Meal Rate</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ৳{mealRate.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowAddMember(!showAddMember)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Add Member
        </button>
        <button
          onClick={() => setShowAddBazar(!showAddBazar)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
        >
          <Plus size={18} />
          Add Bazar
        </button>
      </div>

      {/* Add Member Form */}
      {showAddMember && (
        <div className={cardClasses}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Member</h3>
            <button onClick={() => setShowAddMember(false)}>
              <X size={20} className="text-gray-500 hover:text-gray-700" />
            </button>
          </div>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Member Name"
              value={newMember.name}
              onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
            />
            <input
              type="number"
              placeholder="Fixed Costs (Rent/Utility)"
              value={newMember.fixedCosts || ''}
              onChange={(e) => setNewMember({ ...newMember, fixedCosts: Number(e.target.value) })}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
            />
            <button
              onClick={addMember}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
            >
              Add Member
            </button>
          </div>
        </div>
      )}

      {/* Add Bazar Form */}
      {showAddBazar && (
        <div className={cardClasses}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Bazar Entry</h3>
            <button onClick={() => setShowAddBazar(false)}>
              <X size={20} className="text-gray-500 hover:text-gray-700" />
            </button>
          </div>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Description"
              value={newBazar.description}
              onChange={(e) => setNewBazar({ ...newBazar, description: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800"
            />
            <input
              type="number"
              placeholder="Amount"
              value={newBazar.amount || ''}
              onChange={(e) => setNewBazar({ ...newBazar, amount: Number(e.target.value) })}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800"
            />
            <select
              value={newBazar.purchasedBy}
              onChange={(e) => setNewBazar({ ...newBazar, purchasedBy: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800"
            >
              <option value="">Select Purchaser</option>
              {data.members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
            <button
              onClick={addBazar}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700"
            >
              Add Entry
            </button>
          </div>
        </div>
      )}

      {/* Members List with Meal Counts */}
      <div className={cardClasses}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Members & Balances</h3>
        <div className="space-y-3">
          {memberBalances.map((member) => (
            <div key={member.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-900 dark:text-white">{member.name}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Fixed: ৳{member.fixedCosts}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={member.meals}
                  onChange={(e) => updateMemberMeals(member.id, Number(e.target.value))}
                  className="w-20 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700"
                  min="0"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">meals</span>
                <span className="ml-auto font-medium text-gray-900 dark:text-white">
                  ৳{member.totalCost.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Bazar Entries */}
      <div className={cardClasses}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Bazar Entries</h3>
        <div className="space-y-2">
          {data.bazarEntries.slice(-5).reverse().map((entry) => {
            const purchaser = data.members.find((m) => m.id === entry.purchasedBy);
            return (
              <div key={entry.id} className="flex justify-between items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{entry.description}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(entry.date).toLocaleDateString()} • {purchaser?.name}
                  </p>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">৳{entry.amount}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}