'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Search, 
  User, 
  Settings,
  LogOut,
  ChevronDown,
  MessageSquare,
  Calendar,
  Car
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  time: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: '새로운 예약',
    message: '김철수님이 K5 차량을 예약했습니다.',
    type: 'info',
    time: '2분 전',
    read: false,
  },
  {
    id: '2',
    title: '차량 점검 필요',
    message: '차량번호 12가3456 정기점검 기한이 임박했습니다.',
    type: 'warning',
    time: '1시간 전',
    read: false,
  },
  {
    id: '3',
    title: '상담 완료',
    message: '문의번호 CS-2024-001 상담이 완료되었습니다.',
    type: 'success',
    time: '2시간 전',
    read: true,
  },
];

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = mockNotifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <MessageSquare size={16} className="text-blue-500" />;
      case 'warning':
        return <Car size={16} className="text-yellow-500" />;
      case 'success':
        return <Calendar size={16} className="text-green-500" />;
      case 'error':
        return <Bell size={16} className="text-red-500" />;
      default:
        return <Bell size={16} className="text-gray-500" />;
    }
  };

  return (
    <header 
      className={cn(className)} 
      style={{ 
        padding: '1.25rem 2rem',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #1e293b'
      }}
    >
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg transition-all"
              style={{ 
                paddingLeft: '2.5rem', 
                paddingRight: '1rem', 
                paddingTop: '0.625rem', 
                paddingBottom: '0.625rem',
                backgroundColor: '#f9fafb',
                border: '1px solid #e2e8f0',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#1e293b';
                e.target.style.boxShadow = '0 0 0 2px rgba(30, 41, 59, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center" style={{ gap: '1.5rem' }}>
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={{ 
                position: 'relative',
                color: '#64748b',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.625rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f1f5f9';
                e.currentTarget.style.color = '#1e293b';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#64748b';
              }}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  backgroundColor: '#1e293b',
                  color: 'white',
                  fontSize: '0.75rem',
                  borderRadius: '50%',
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                >
                  <div style={{ padding: '1.25rem', borderBottom: '1px solid #e5e7eb' }}>
                    <h3 className="text-lg font-semibold text-gray-900">알림</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto admin-scrollbar">
                    {mockNotifications.length === 0 ? (
                      <div style={{ padding: '1.25rem', textAlign: 'center', color: '#6b7280' }}>
                        새로운 알림이 없습니다.
                      </div>
                    ) : (
                      mockNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={cn(
                            'border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors',
                            !notification.read && 'bg-blue-50'
                          )}
                          style={{ padding: '1.25rem' }}
                        >
                          <div className="flex items-start" style={{ gap: '0.75rem' }}>
                            <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                {notification.time}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div style={{ padding: '1.25rem', borderTop: '1px solid #e5e7eb' }}>
                    <button className="w-full text-sm text-center text-admin-primary hover:text-blue-700 font-medium">
                      모든 알림 보기
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem',
                color: '#475569',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f1f5f9';
                e.currentTarget.style.color = '#1e293b';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#475569';
              }}
            >
              <div style={{
                width: '28px',
                height: '28px',
                backgroundColor: '#1e293b',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <User style={{ color: 'white' }} size={14} />
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>관리자</span>
              <ChevronDown size={14} />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                >
                  <div style={{ padding: '1.25rem', borderBottom: '1px solid #e5e7eb' }}>
                    <p className="text-sm font-medium text-gray-900">관리자</p>
                    <p className="text-sm text-gray-600">admin@example.com</p>
                  </div>
                  <div style={{ padding: '0.5rem 0' }}>
                    <button className="flex items-center w-full text-sm text-gray-700 hover:bg-gray-100 transition-colors" style={{ padding: '0.75rem 1.25rem', gap: '0.75rem' }}>
                      <User size={16} />
                      프로필 설정
                    </button>
                    <button className="flex items-center w-full text-sm text-gray-700 hover:bg-gray-100 transition-colors" style={{ padding: '0.75rem 1.25rem', gap: '0.75rem' }}>
                      <Settings size={16} />
                      계정 설정
                    </button>
                    <hr style={{ margin: '0.5rem 0' }} />
                    <button className="flex items-center w-full text-sm text-red-600 hover:bg-red-50 transition-colors" style={{ padding: '0.75rem 1.25rem', gap: '0.75rem' }}>
                      <LogOut size={16} />
                      로그아웃
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Click outside to close menus */}
      {(showNotifications || showUserMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowNotifications(false);
            setShowUserMenu(false);
          }}
        />
      )}
    </header>
  );
}
