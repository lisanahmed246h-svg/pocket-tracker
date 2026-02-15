// app/components/Sidebar.tsx

'use client';

import { Home, Users, UtensilsCrossed, Calendar } from 'lucide-react';
import { AppMode } from '@/app/types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

export default function Sidebar({ currentMode, onModeChange }: SidebarProps) {
  const pathname = usePathname();
  
  const modes: { id: AppMode; label: string; icon: typeof Home; href: string }[] = [
    { id: 'personal', label: 'ব্যক্তিগত', icon: Home, href: '/personal' },
    { id: 'family', label: 'পরিবার', icon: Users, href: '/family' },
    { id: 'mess', label: 'মেস', icon: UtensilsCrossed, href: '/mess' },
  ];

  const buttonClasses = (isActive: boolean, isHref?: boolean) =>
    twMerge(
      clsx(
        'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
        'hover:bg-gray-100 dark:hover:bg-gray-800',
        isActive && 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
        isHref && 'cursor-pointer'
      )
    );

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4 overflow-y-auto">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold">PT</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Pocket Tracker</h1>
      </div>

      {/* Mode Navigation */}
      <nav className="space-y-1">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isActive = pathname?.startsWith(mode.href);
          
          return (
            <Link
              key={mode.id}
              href={mode.href}
              onClick={() => onModeChange(mode.id)}
              className={buttonClasses(isActive, true)}
            >
              <Icon size={20} />
              <span className="font-medium">{mode.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}