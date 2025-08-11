'use client';

import { motion } from 'framer-motion';
import { 
  Calendar, 
  Car, 
  MessageSquare, 
  Users, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/src/components/ui';
import { formatCurrency, formatNumber, getStatusColor, getStatusText } from '@/src/lib/utils';
import { mockDashboardStats } from '@/src/data/mockData';

export default function AdminDashboard() {
  const { todayStats, vehicleStats, revenueStats, recentReservations, pendingConsultations } = mockDashboardStats;

  const statsCards = [
    {
      title: '신규 예약',
      value: todayStats.newReservations,
      icon: Calendar,
      color: '#2563eb',
      bgColor: '#dbeafe',
      change: '+5.2%',
      isPositive: true,
    },
    {
      title: '진행중 렌탈',
      value: todayStats.activeRentals,
      icon: Car,
      color: '#16a34a',
      bgColor: '#dcfce7',
      change: '+2.1%',
      isPositive: true,
    },
    {
      title: '반납 예정',
      value: todayStats.returnsToday,
      icon: CheckCircle,
      color: '#9333ea',
      bgColor: '#e9d5ff',
      change: '-1.3%',
      isPositive: false,
    },
    {
      title: '대기중 상담',
      value: todayStats.pendingConsultations,
      icon: MessageSquare,
      color: '#ca8a04',
      bgColor: '#fef3c7',
      change: '+3.8%',
      isPositive: true,
    },
  ];

  return (
    <div style={{ 
      padding: '2rem', 
      backgroundColor: '#f8fafc', 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem'
    }}>
      {/* Page Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '2rem',
        backgroundColor: '#ffffff',
        borderRadius: '0.75rem',
        border: '1px solid #1e293b',
        boxShadow: '0 1px 3px 0 rgba(30, 41, 59, 0.1)'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '1.875rem', 
            fontWeight: '700', 
            color: '#0f172a', 
            margin: 0,
            marginBottom: '0.5rem'
          }}>대시보드</h1>
          <p style={{ 
            color: '#64748b', 
            margin: 0,
            fontSize: '1rem'
          }}>렌트카 운영 현황을 한눈에 확인하세요</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button variant="outline" size="sm">
            보고서 다운로드
          </Button>
          <Button size="sm">
            새 예약 등록
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '1.5rem'
      }}>
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card variant="bordered" hover>
              <CardContent>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#64748b', margin: '0 0 0.75rem 0' }}>{stat.title}</p>
                    <p style={{ fontSize: '2.25rem', fontWeight: '700', color: '#0f172a', margin: '0 0 1rem 0' }}>
                      {formatNumber(stat.value)}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {stat.isPositive ? (
                        <TrendingUp color="#16a34a" size={16} />
                      ) : (
                        <TrendingDown color="#dc2626" size={16} />
                      )}
                      <span style={{ 
                        fontSize: '0.875rem', 
                        marginLeft: '0.5rem', 
                        color: stat.isPositive ? '#16a34a' : '#dc2626',
                        fontWeight: '600'
                      }}>
                        {stat.change}
                      </span>
                      <span style={{ fontSize: '0.875rem', color: '#64748b', marginLeft: '0.5rem' }}>전일 대비</span>
                    </div>
                  </div>
                  <div style={{ 
                    padding: '1.25rem', 
                    borderRadius: '0.75rem', 
                    backgroundColor: stat.bgColor,
                    border: `1px solid ${stat.color}20`
                  }}>
                    <stat.icon color={stat.color} size={28} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card variant="bordered">
            <CardHeader>
              <CardTitle style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>매출 현황</span>
                <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}>
                  <TrendingUp color="#16a34a" style={{ marginRight: '0.25rem' }} size={16} />
                  <span style={{ color: '#16a34a', fontWeight: '600' }}>+{revenueStats.growth}%</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '1.5rem', 
                    backgroundColor: '#f8fafc',
                    borderRadius: '0.75rem',
                    border: '1px solid #e2e8f0'
                  }}>
                    <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0 0 0.5rem 0', fontWeight: '500' }}>오늘</p>
                    <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
                      {formatCurrency(revenueStats.today)}
                    </p>
                  </div>
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '1.5rem', 
                    backgroundColor: '#fef7ff',
                    borderRadius: '0.75rem',
                    border: '1px solid #e879f9'
                  }}>
                    <p style={{ fontSize: '0.875rem', color: '#a855f7', margin: '0 0 0.5rem 0', fontWeight: '500' }}>이번 주</p>
                    <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
                      {formatCurrency(revenueStats.thisWeek)}
                    </p>
                  </div>
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '1.5rem', 
                    backgroundColor: '#f0f9ff',
                    borderRadius: '0.75rem',
                    border: '1px solid #38bdf8'
                  }}>
                    <p style={{ fontSize: '0.875rem', color: '#0284c7', margin: '0 0 0.5rem 0', fontWeight: '500' }}>이번 달</p>
                    <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
                      {formatCurrency(revenueStats.thisMonth)}
                    </p>
                  </div>
                </div>
                
                {/* Simple chart placeholder */}
                <div style={{ 
                  height: '16rem', 
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1), rgba(34, 197, 94, 0.1))', 
                  borderRadius: '0.75rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginTop: '1.5rem',
                  padding: '2rem',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <TrendingUp size={48} color="#6366f1" style={{ marginBottom: '1rem' }} />
                    <p style={{ color: '#64748b', margin: 0, fontSize: '1rem', fontWeight: '500' }}>매출 차트</p>
                    <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>Chart.js 연동 예정</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Vehicle Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card variant="bordered">
              <CardHeader>
                <CardTitle style={{ color: '#1e293b' }}>차량 현황</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {Object.entries(vehicleStats).map(([status, count]) => (
                    <div key={status} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      backgroundColor: '#f8fafc',
                      borderRadius: '0.5rem',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ 
                          width: '0.75rem', 
                          height: '0.75rem', 
                          borderRadius: '50%', 
                          marginRight: '0.75rem',
                          backgroundColor: status === 'available' ? '#22c55e' :
                                         status === 'rented' ? '#3b82f6' :
                                         status === 'maintenance' ? '#f59e0b' : '#6b7280'
                        }} />
                        <span style={{ fontSize: '0.875rem', color: '#475569', fontWeight: '500' }}>{getStatusText(status)}</span>
                      </div>
                      <span style={{ fontWeight: '700', color: '#1e293b' }}>{count}대</span>
                    </div>
                  ))}
                  <div style={{ 
                    paddingTop: '1rem', 
                    marginTop: '1rem',
                    borderTop: '2px solid #e2e8f0',
                    backgroundColor: '#f1f5f9',
                    padding: '1rem',
                    borderRadius: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>총 차량</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a' }}>{Object.values(vehicleStats).reduce((a, b) => a + b, 0)}대</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.65 }}
          >
            <Card variant="bordered">
              <CardHeader>
                <CardTitle style={{ color: '#1e293b' }}>빠른 작업</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <Button variant="outline" fullWidth leftIcon={<Car size={16} />}>
                    차량 등록
                  </Button>
                  <Button variant="outline" fullWidth leftIcon={<Calendar size={16} />}>
                    예약 추가
                  </Button>
                  <Button variant="outline" fullWidth leftIcon={<MessageSquare size={16} />}>
                    상담 관리
                  </Button>
                  <Button variant="outline" fullWidth leftIcon={<Users size={16} />}>
                    고객 관리
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Today's Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Card variant="bordered">
              <CardHeader>
                <CardTitle style={{ color: '#1e293b' }}>오늘의 할 일</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '0.75rem',
                    backgroundColor: '#fef3c7',
                    borderRadius: '0.5rem',
                    border: '1px solid #fbbf24'
                  }}>
                    <AlertCircle size={16} color="#d97706" style={{ marginRight: '0.5rem' }} />
                    <span style={{ fontSize: '0.875rem', color: '#92400e' }}>차량 3대 점검 필요</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '0.75rem',
                    backgroundColor: '#dcfce7',
                    borderRadius: '0.5rem',
                    border: '1px solid #22c55e'
                  }}>
                    <CheckCircle size={16} color="#16a34a" style={{ marginRight: '0.5rem' }} />
                    <span style={{ fontSize: '0.875rem', color: '#15803d' }}>8건 반납 예정</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '0.75rem',
                    backgroundColor: '#dbeafe',
                    borderRadius: '0.5rem',
                    border: '1px solid #3b82f6'
                  }}>
                    <Clock size={16} color="#2563eb" style={{ marginRight: '0.5rem' }} />
                    <span style={{ fontSize: '0.875rem', color: '#1d4ed8' }}>5건 상담 대기중</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Recent Reservations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>최근 예약</span>
                <Button variant="ghost" size="sm" rightIcon={<ArrowUpRight size={16} />}>
                  전체보기
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {recentReservations.slice(0, 5).map((reservation) => (
                  <div key={reservation.id} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '1rem', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '0.75rem',
                    backgroundColor: '#fafafa'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h4 style={{ fontWeight: '500', color: '#111827', margin: 0 }}>{reservation.customer.name}</h4>
                        <span style={{ 
                          padding: '0.125rem 0.5rem', 
                          fontSize: '0.75rem', 
                          borderRadius: '9999px', 
                          border: '1px solid',
                          backgroundColor: reservation.status === 'active' ? '#dcfce7' : '#dbeafe',
                          color: reservation.status === 'active' ? '#166534' : '#1e40af',
                          borderColor: reservation.status === 'active' ? '#bbf7d0' : '#bfdbfe'
                        }}>
                          {getStatusText(reservation.status)}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem', margin: 0 }}>
                        {reservation.vehicle.brand} {reservation.vehicle.model} ({reservation.vehicle.vehicleNumber})
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem', margin: 0 }}>
                        {reservation.startDate.toLocaleDateString()} - {reservation.endDate.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pending Consultations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>대기중 상담</span>
                <Button variant="ghost" size="sm" rightIcon={<ArrowUpRight size={16} />}>
                  전체보기
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {pendingConsultations.slice(0, 5).map((consultation) => (
                  <div key={consultation.id} style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    padding: '1rem', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '0.75rem',
                    backgroundColor: '#fafafa'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h4 style={{ fontWeight: '500', color: '#111827', margin: 0 }}>{consultation.customerName}</h4>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {consultation.priority === 'urgent' && (
                            <AlertCircle color="#ef4444" style={{ marginRight: '0.25rem' }} size={16} />
                          )}
                          <span style={{ 
                            padding: '0.125rem 0.5rem', 
                            fontSize: '0.75rem', 
                            borderRadius: '9999px', 
                            border: '1px solid',
                            backgroundColor: consultation.priority === 'urgent' ? '#fecaca' : '#dbeafe',
                            color: consultation.priority === 'urgent' ? '#dc2626' : '#1e40af',
                            borderColor: consultation.priority === 'urgent' ? '#fca5a5' : '#bfdbfe'
                          }}>
                            {getStatusText(consultation.priority)}
                          </span>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem', margin: 0 }}>{consultation.subject}</p>
                      <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.75rem', fontSize: '0.75rem', color: '#9ca3af' }}>
                        <Clock size={12} style={{ marginRight: '0.25rem' }} />
                        {consultation.createdAt.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}