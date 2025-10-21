/**
 * Sidebar Navigation Component
 *
 * Responsive sidebar for the Kōen dashboard with collapsible functionality.
 * Displays navigation menu items with active state highlighting.
 *
 * Features:
 * - Desktop: Collapsible sidebar with toggle button
 * - Mobile: Full-width overlay sidebar with backdrop
 * - Active route highlighting
 * - Badge support for notification counts (dynamic data)
 */
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useWallet, useUserLoansWithHealth, useAllLiquidatableLoans } from '@/lib/hooks';

/**
 * Props for the Sidebar component
 */
interface SidebarProps {
  collapsed: boolean;      // Whether sidebar is collapsed (desktop only)
  onToggle: () => void;     // Callback to toggle collapsed state
  onClose?: () => void;     // Callback to close sidebar (mobile only)
}

/**
 * Navigation item structure
 */
interface NavItem {
  label: string;            // Display text for the nav item
  icon: React.ReactNode;    // Icon component to display
  href: string;             // Route path for navigation
  badge?: number;           // Optional badge count (e.g., for notifications)
}

export default function Sidebar({ collapsed, onToggle, onClose }: SidebarProps) {
  // Get current pathname to highlight active navigation item
  const pathname = usePathname();

  // Get wallet address for fetching user-specific data
  const { address } = useWallet();

  // Fetch user's loans to count active loans
  const { loans } = useUserLoansWithHealth(address);
  const activeLoanCount = loans?.filter(loan => loan.status === 'active').length || 0;

  // Fetch liquidatable loans to count loans at risk across the platform
  // Reduced from 50 to 20 to minimize API calls
  const { data: liquidatableLoans } = useAllLiquidatableLoans(20);
  const liquidatableCount = liquidatableLoans?.length || 0;

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      href: '/dashboard',
    },
    {
      label: 'Marketplace',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      href: '/dashboard/marketplace',
    },
    {
      label: 'My Loans',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      href: '/dashboard/loans',
      badge: activeLoanCount > 0 ? activeLoanCount : undefined,
    },
    {
      label: 'Create Offer',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      href: '/dashboard/create',
    },
    {
      label: 'Liquidation',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      href: '/dashboard/liquidation',
      badge: liquidatableCount > 0 ? liquidatableCount : undefined,
    },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <aside
      className={`fixed left-0 top-14 h-[calc(100vh-3.5rem)] bg-[#0B0E11] border-r border-[#1E2329] transition-all duration-300 z-40 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      <div className="h-full flex flex-col">
        {/* Navigation */}
        <nav className="flex-1 py-2">
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors relative group ${
                      active
                        ? 'bg-[#1E2329] text-emerald-500'
                        : 'text-[#848E9C] hover:bg-[#1E2329] hover:text-white'
                    }`}
                  >
                    {/* Active Indicator */}
                    {active && (
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-500"></div>
                    )}

                    {/* Icon */}
                    <div className={`flex-shrink-0 ${collapsed ? 'mx-auto' : ''}`}>
                      {item.icon}
                    </div>

                    {/* Label */}
                    {!collapsed && (
                      <span className="text-sm font-medium flex-1">{item.label}</span>
                    )}

                    {/* Badge */}
                    {!collapsed && item.badge && (
                      <span className="px-1.5 py-0.5 bg-[#F6465D] text-white text-xs font-semibold rounded">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Section - Account Info */}
        {!collapsed && (
          <div className="p-4 border-t border-[#1E2329]">
            {/* Balances */}
            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#848E9C]">Total Assets</span>
                <span className="text-white font-semibold tabular-nums">$15,750.00</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#848E9C]">Available</span>
                <span className="text-white font-semibold tabular-nums">$10,500.00</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#848E9C]">Locked</span>
                <span className="text-white font-semibold tabular-nums">$5,250.00</span>
              </div>
            </div>

            {/* Reputation */}
            <div className="p-2.5 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-yellow-500 font-semibold">Gold Tier</span>
                <span className="text-xs text-[#848E9C]">APR</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-yellow-500 rounded-full"></div>
                  <div className="w-1 h-1 bg-yellow-500 rounded-full"></div>
                  <div className="w-1 h-1 bg-yellow-500 rounded-full"></div>
                  <div className="w-1 h-1 bg-[#2B3139] rounded-full"></div>
                  <div className="w-1 h-1 bg-[#2B3139] rounded-full"></div>
                </div>
                <span className="text-sm text-emerald-500 font-semibold tabular-nums">4.9%</span>
              </div>
            </div>
          </div>
        )}

        {/* Collapsed Account Icon */}
        {collapsed && (
          <div className="p-4 border-t border-[#1E2329] flex justify-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-black text-xs font-bold">
              K
            </div>
          </div>
        )}

        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className="absolute -right-3 top-6 w-6 h-6 bg-[#1E2329] hover:bg-[#2B3139] border border-[#2B3139] rounded-full flex items-center justify-center transition-colors"
        >
          <svg
            className={`w-3 h-3 text-[#848E9C] transition-transform ${collapsed ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
