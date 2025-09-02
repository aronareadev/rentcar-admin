'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Car, 
  Calendar, 
  MessageSquare, 
  Users, 
  BarChart3, 
  Settings, 
  Menu, 
  X,
  ChevronDown,
  LogOut,
  Bell,
  Package
} from 'lucide-react';

interface SidebarItem {
  title: string;
  href?: string;
  icon: React.ComponentType<any>;
  children?: {
    title: string;
    href: string;
  }[];
}

const sidebarItems: SidebarItem[] = [
  {
    title: '대시보드',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: '차량 관리',
    icon: Car,
    children: [
      { title: '차량 목록', href: '/admin/vehicles' },
      { title: '차량 등록', href: '/admin/vehicles/new' },
      { title: '차량 현황', href: '/admin/vehicles/status' },
      { title: '차량모델 관리', href: '/admin/vehicles/models' },
      { title: '차량모델 일괄등록', href: '/admin/vehicles/models/bulk' },
    ],
  },
  {
    title: '예약 관리',
    icon: Calendar,
    children: [
      { title: '예약 목록', href: '/admin/reservations' },
      { title: '예약 캘린더', href: '/admin/reservations/calendar' },
      { title: '대기 목록', href: '/admin/reservations/pending' },
    ],
  },
  {
    title: '상담 관리',
    icon: MessageSquare,
    children: [
      { title: '상담 목록', href: '/admin/consultations' },
      { title: '대기 상담', href: '/admin/consultations/pending' },
      { title: '자동 응답', href: '/admin/consultations/auto-response' },
    ],
  },
  {
    title: '고객 관리',
    href: '/admin/customers',
    icon: Users,
  },
  {
    title: '통계 및 분석',
    icon: BarChart3,
    children: [
      { title: '매출 통계', href: '/admin/statistics/sales' },
      { title: '차량 이용률', href: '/admin/statistics/vehicles' },
      { title: '고객 분석', href: '/admin/statistics/customers' },
    ],
  },
  {
    title: '시스템 설정',
    icon: Settings,
    children: [
      { title: '사이트 설정', href: '/admin/settings/site' },
      { title: '요금 설정', href: '/admin/settings/pricing' },
      { title: '알림 설정', href: '/admin/settings/notifications' },
      { title: '관리자 계정', href: '/admin/settings/users' },
    ],
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isItemActive = (item: SidebarItem) => {
    if (item.href) {
      return pathname === item.href;
    }
    if (item.children) {
      return item.children.some(child => pathname === child.href);
    }
    return false;
  };

  const isChildActive = (href: string) => {
    return pathname === href;
  };

  return (
    <motion.aside
      initial={{ width: 256 }}
      animate={{ width: isCollapsed ? 64 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={`flex flex-col h-screen sticky top-0 ${className || ''}`}
      style={{ 
        background: 'linear-gradient(180deg, #0f1629 0%, #1a1f3a 50%, #0e1624 100%)',
        borderRight: '1px solid #1e3a5f'
      }}
    >
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '1.25rem',
        borderBottom: '1px solid #1e3a5f'
      }}>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h1 
                className="chroma-text-ocean"
                style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  margin: 0,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent',
                  backgroundImage: 'linear-gradient(90deg, #00c2ff, #1a7fff 35%, #0040ff 60%, #001c7a)',
                  backgroundSize: '200% 100%',
                  backgroundPosition: '0% 50%',
                  animation: 'chromaSweep 3s linear infinite reverse'
                }}
              >Ever RentCar</h1>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{ 
            padding: '0.5rem', 
            color: '#94a3b8', 
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '0.5rem',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#1e3a5f';
            e.currentTarget.style.color = '#f8fafc';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#94a3b8';
          }}
        >
          {isCollapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 admin-scrollbar overflow-y-auto" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {sidebarItems.map((item, index) => (
          <div key={item.title}>
            {item.href ? (
              // Single item
              <Link
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.625rem',
                  borderRadius: '0.5rem',
                  transition: 'all 0.2s ease',
                  textDecoration: 'none',
                  color: isItemActive(item) ? '#f8fafc' : '#94a3b8',
                  backgroundColor: isItemActive(item) ? '#3b82f6' : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (!isItemActive(item)) {
                    e.currentTarget.style.backgroundColor = '#1e3a5f';
                    e.currentTarget.style.color = '#f1f5f9';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isItemActive(item)) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#94a3b8';
                  }
                }}
              >
                <item.icon size={20} className="flex-shrink-0" />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ 
                        marginLeft: '0.75rem', 
                        fontWeight: '500', 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden'
                      }}
                    >
                      {item.title}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            ) : (
              // Expandable item
              <div>
                <button
                  onClick={() => !isCollapsed && toggleExpanded(item.title)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '0.625rem',
                    borderRadius: '0.5rem',
                    transition: 'all 0.2s ease',
                    border: 'none',
                    cursor: 'pointer',
                    color: isItemActive(item) ? '#f8fafc' : '#94a3b8',
                    backgroundColor: isItemActive(item) ? '#3b82f6' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!isItemActive(item)) {
                      e.currentTarget.style.backgroundColor = '#1e3a5f';
                      e.currentTarget.style.color = '#f1f5f9';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isItemActive(item)) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#94a3b8';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <item.icon size={20} style={{ flexShrink: 0 }} />
                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          style={{ 
                            marginLeft: '0.75rem', 
                            fontWeight: '500', 
                            whiteSpace: 'nowrap', 
                            overflow: 'hidden'
                          }}
                        >
                          {item.title}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown
                          size={16}
                          className={`transition-transform ${
                            expandedItems.includes(item.title) ? 'rotate-180' : ''
                          }`}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>

                {/* Submenu */}
                <AnimatePresence>
                  {!isCollapsed && expandedItems.includes(item.title) && item.children && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                      style={{ marginLeft: '2rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.125rem' }}
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            padding: '0.375rem 0.625rem',
                            borderRadius: '0.5rem',
                            transition: 'all 0.2s ease',
                            textDecoration: 'none',
                            color: isChildActive(child.href) ? '#f8fafc' : '#cbd5e1',
                            backgroundColor: isChildActive(child.href) ? '#1e40af' : 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            if (!isChildActive(child.href)) {
                              e.currentTarget.style.backgroundColor = '#2a4a6b';
                              e.currentTarget.style.color = '#f1f5f9';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isChildActive(child.href)) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = '#cbd5e1';
                            }
                          }}
                        >
                          {child.title}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ 
        borderTop: '1px solid #1e3a5f', 
        padding: '1.25rem' 
      }}>
        <button 
          style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            transition: 'all 0.2s ease',
            border: 'none',
            cursor: 'pointer',
            color: '#94a3b8',
            backgroundColor: 'transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#1e3a5f';
            e.currentTarget.style.color = '#f1f5f9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#94a3b8';
          }}
        >
          <LogOut size={20} style={{ flexShrink: 0 }} />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                style={{ 
                  marginLeft: '0.75rem', 
                  fontWeight: '500', 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden'
                }}
              >
                로그아웃
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}