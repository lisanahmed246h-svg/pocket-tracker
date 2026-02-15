// app/types/index.ts

export type AppMode = 'personal' | 'family' | 'mess';

export interface ExpenseItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  category: string;
}

export interface Expense {
  id: string;
  date: string; // ISO date string
  items: ExpenseItem[];
  totalAmount: number;
  note?: string;
}

export interface BudgetCategory {
  name: string;
  limit: number;
  spent: number;
  color: string;
}

export interface MonthData {
  id: string;
  name: string; // User defined name or default month name
  startDate: string;
  endDate: string;
  initialBudget: number;
  remainingBudget: number;
  categories?: BudgetCategory[]; // যদি ক্যাটাগরিতে ভাগ করা হয়
  expenses: Expense[]; // সব খরচ (তারিখ অনুযায়ী)
  totalSpent: number;
  isCompleted: boolean; // মাস শেষ হয়েছে কিনা
  specialEvents?: {
    [date: string]: string; // "2026-02-20": "বন্ধুর জন্মদিন"
  };
}

export interface PersonalData {
  currentMonth: MonthData | null;
  monthHistory: MonthData[]; // আগের মাসগুলোর তালিকা
}

export interface FamilyData {
  groceryList: GroceryItem[];
  bills: BillReminder[];
  members: FamilyMember[];
}

export interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  completed: boolean;
  addedBy: string;
}

export interface BillReminder {
  id: string;
  type: 'electricity' | 'gas' | 'water' | 'internet';
  dueDate: string;
  amount: number;
  paid: boolean;
  notified: boolean;
}

export interface FamilyMember {
  id: string;
  name: string;
  avatar?: string;
}

export interface MessMember {
  id: string;
  name: string;
  meals: number;
  fixedCosts: number;
}

export interface BazarEntry {
  id: string;
  date: string;
  amount: number;
  description: string;
  purchasedBy: string;
}

export interface MessData {
  members: MessMember[];
  bazarEntries: BazarEntry[];
  totalMeals: number;
  mealRate: number;
}

export interface AppData {
  personal: PersonalData;
  family: FamilyData;
  mess: MessData;
}