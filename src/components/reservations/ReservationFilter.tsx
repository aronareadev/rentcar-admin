'use client';

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button, Input, Select } from '@/src/components/ui';
import { ReservationFilter as FilterType, ReservationStatus, PaymentStatus } from '@/src/types/reservation';

interface ReservationFilterProps {
  onFilterChange: (filter: FilterType) => void;
  initialFilter?: FilterType;
}

export function ReservationFilter({ onFilterChange, initialFilter = {} }: ReservationFilterProps) {
  const [filter, setFilter] = useState<FilterType>(initialFilter);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof FilterType, value: any) => {
    const newFilter = { ...filter, [key]: value };
    setFilter(newFilter);
    onFilterChange(newFilter);
  };

  const handleSearchChange = (value: string) => {
    const newFilter = { ...filter, search: value, page: 1 };
    setFilter(newFilter);
    onFilterChange(newFilter);
  };

  const clearFilters = () => {
    const clearedFilter = { page: 1, limit: filter.limit };
    setFilter(clearedFilter);
    onFilterChange(clearedFilter);
  };

  const hasActiveFilters = filter.status?.length || filter.payment_status?.length || 
                          filter.start_date || filter.end_date || filter.vehicle_id;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      {/* 검색바 */}
      <div className="flex items-center space-x-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="고객명, 이메일, 예약번호로 검색..."
            value={filter.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2"
        >
          <Filter className="h-4 w-4" />
          <span>필터</span>
          {hasActiveFilters && (
            <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              !
            </span>
          )}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* 확장 필터 */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t border-gray-200">
          {/* 예약 상태 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              예약 상태
            </label>
            <Select
              value={filter.status?.join(',') || ''}
              onChange={(value) => 
                handleFilterChange('status', value ? value.split(',') as ReservationStatus[] : [])
              }
              placeholder="상태 선택"
            >
              <option value="">전체</option>
              <option value="pending">승인 대기</option>
              <option value="confirmed">예약 확정</option>
              <option value="active">대여중</option>
              <option value="completed">반납 완료</option>
              <option value="cancelled">취소됨</option>
            </Select>
          </div>

          {/* 결제 상태 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              결제 상태
            </label>
            <Select
              value={filter.payment_status?.join(',') || ''}
              onChange={(value) => 
                handleFilterChange('payment_status', value ? value.split(',') as PaymentStatus[] : [])
              }
              placeholder="결제 상태"
            >
              <option value="">전체</option>
              <option value="pending">결제 대기</option>
              <option value="paid">결제 완료</option>
              <option value="refunded">환불 완료</option>
            </Select>
          </div>

          {/* 시작일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              대여 시작일 (이후)
            </label>
            <Input
              type="date"
              value={filter.start_date || ''}
              onChange={(e) => handleFilterChange('start_date', e.target.value)}
            />
          </div>

          {/* 종료일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              대여 종료일 (이전)
            </label>
            <Input
              type="date"
              value={filter.end_date || ''}
              onChange={(e) => handleFilterChange('end_date', e.target.value)}
            />
          </div>

          {/* 정렬 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              정렬
            </label>
            <Select
              value={`${filter.sort_by || 'created_at'}_${filter.sort_order || 'desc'}`}
              onChange={(value) => {
                const [sort_by, sort_order] = value.split('_');
                handleFilterChange('sort_by', sort_by);
                handleFilterChange('sort_order', sort_order);
              }}
            >
              <option value="created_at_desc">신청일 (최신순)</option>
              <option value="created_at_asc">신청일 (오래된순)</option>
              <option value="start_date_desc">대여일 (최신순)</option>
              <option value="start_date_asc">대여일 (오래된순)</option>
              <option value="total_amount_desc">금액 (높은순)</option>
              <option value="total_amount_asc">금액 (낮은순)</option>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}

