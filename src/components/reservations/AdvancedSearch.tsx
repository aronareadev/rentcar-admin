'use client';

import { useState } from 'react';
import { Search, X, Calendar, DollarSign, Filter } from 'lucide-react';
import { Button, Input, Select, Card, CardContent } from '@/src/components/ui';
import { ReservationFilter as FilterType } from '@/src/types/reservation';

interface AdvancedSearchProps {
  onSearch: (filter: FilterType) => void;
  onClear: () => void;
}

export function AdvancedSearch({ onSearch, onClear }: AdvancedSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchForm, setSearchForm] = useState<FilterType>({});

  const handleInputChange = (key: keyof FilterType, value: any) => {
    setSearchForm(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSearch = () => {
    onSearch({ ...searchForm, page: 1 });
  };

  const handleClear = () => {
    setSearchForm({});
    onClear();
  };

  const hasActiveFilters = Object.keys(searchForm).some(key => {
    const value = searchForm[key as keyof FilterType];
    return value && (Array.isArray(value) ? value.length > 0 : true);
  });

  return (
    <Card>
      <CardContent className="p-4">
        {/* 기본 검색바 */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="고객명, 이메일, 예약번호, 차량 브랜드로 검색..."
              value={searchForm.search || ''}
              onChange={(e) => handleInputChange('search', e.target.value)}
              className="pl-10"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>고급 검색</span>
            {hasActiveFilters && (
              <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                !
              </span>
            )}
          </Button>
          <Button onClick={handleSearch}>
            검색
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={handleClear}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* 고급 검색 필터 */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            {/* 첫 번째 행: 상태 필터 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  예약 상태
                </label>
                <Select
                  value={searchForm.status?.join(',') || ''}
                  onChange={(value) => 
                    handleInputChange('status', value ? value.split(',') : [])
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  결제 상태
                </label>
                <Select
                  value={searchForm.payment_status?.join(',') || ''}
                  onChange={(value) => 
                    handleInputChange('payment_status', value ? value.split(',') : [])
                  }
                  placeholder="결제 상태"
                >
                  <option value="">전체</option>
                  <option value="pending">결제 대기</option>
                  <option value="paid">결제 완료</option>
                  <option value="refunded">환불 완료</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  정렬 방식
                </label>
                <Select
                  value={`${searchForm.sort_by || 'created_at'}_${searchForm.sort_order || 'desc'}`}
                  onChange={(value) => {
                    const [sort_by, sort_order] = value.split('_');
                    handleInputChange('sort_by', sort_by);
                    handleInputChange('sort_order', sort_order);
                  }}
                >
                  <option value="created_at_desc">신청일 (최신순)</option>
                  <option value="created_at_asc">신청일 (오래된순)</option>
                  <option value="start_date_desc">대여일 (최신순)</option>
                  <option value="start_date_asc">대여일 (오래된순)</option>
                  <option value="total_amount_desc">금액 (높은순)</option>
                  <option value="total_amount_asc">금액 (낮은순)</option>
                  <option value="updated_at_desc">수정일 (최신순)</option>
                </Select>
              </div>
            </div>

            {/* 두 번째 행: 날짜 필터 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  대여 시작일 (이후)
                </label>
                <Input
                  type="date"
                  value={searchForm.start_date || ''}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  대여 종료일 (이전)
                </label>
                <Input
                  type="date"
                  value={searchForm.end_date || ''}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                />
              </div>
            </div>

            {/* 세 번째 행: 차량 및 기타 필터 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  특정 차량
                </label>
                <Input
                  type="text"
                  placeholder="차량 ID 입력"
                  value={searchForm.vehicle_id || ''}
                  onChange={(e) => handleInputChange('vehicle_id', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  페이지당 표시 수
                </label>
                <Select
                  value={searchForm.limit?.toString() || '20'}
                  onChange={(value) => handleInputChange('limit', parseInt(value))}
                >
                  <option value="10">10개</option>
                  <option value="20">20개</option>
                  <option value="50">50개</option>
                  <option value="100">100개</option>
                </Select>
              </div>
            </div>

            {/* 액션 버튼들 */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                {hasActiveFilters ? '필터가 적용되었습니다' : '모든 조건을 선택적으로 설정할 수 있습니다'}
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={handleClear}>
                  초기화
                </Button>
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4 mr-2" />
                  검색 실행
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

