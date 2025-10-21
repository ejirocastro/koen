/**
 * SettingsModal Component
 *
 * Main modal for user settings and preferences.
 * Features tabbed navigation for different setting categories.
 */
'use client';

import { useState } from 'react';
import NotificationSettings from './NotificationSettings';
import TradingSettings from './TradingSettings';
import AlertSettings from './AlertSettings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'notifications' | 'trading' | 'alerts';

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('notifications');

  if (!isOpen) return null;

  const tabs = [
    { id: 'notifications' as SettingsTab, label: 'Notifications', icon: '🔔' },
    { id: 'trading' as SettingsTab, label: 'Trading', icon: '⚙️' },
    { id: 'alerts' as SettingsTab, label: 'Alerts', icon: '⚠️' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-[#1E2329] border border-[#2B3139] rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#2B3139]">
            <h2 className="text-xl font-bold text-white">Settings</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#2B3139] rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-[#848E9C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[#2B3139] px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'text-emerald-500 border-emerald-500'
                    : 'text-[#848E9C] border-transparent hover:text-white'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
            {activeTab === 'notifications' && <NotificationSettings />}
            {activeTab === 'trading' && <TradingSettings />}
            {activeTab === 'alerts' && <AlertSettings />}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-[#2B3139]">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#2B3139] hover:bg-[#343840] text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
