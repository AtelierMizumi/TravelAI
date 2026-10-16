import React, { useState, useEffect } from 'react';
import { Compass, AlertCircle, Sparkles, MapPin, Search } from 'lucide-react';
import { locationService } from '../services/locationService';
import { PlaceCard } from '../components/places/PlaceCard';
import { FilterBar } from '../components/places/FilterBar';
import { SearchBox } from '../components/places/SearchBox';
import { Pagination } from '../components/places/Pagination';
import { PlaceDetailModal } from '../components/places/PlaceDetailModal';
import { Skeleton } from '../components/ui/Skeleton';
import { Button } from '../components/common/Button';

export const PlacesPage = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Pagination State
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedSort, setSelectedSort] = useState('rating,desc');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Modal State
  const [selectedPlace, setSelectedPlace] = useState(null);

  // Fetch Locations
  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await locationService.getLocations({
        keyword: searchKeyword,
        category: selectedCategory,
        province: selectedProvince,
        sort: selectedSort,
        page: currentPage,
        size: 9,
      });

      setPlaces(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      setError(err?.detail || 'Không thể tải danh sách địa danh du lịch. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [searchKeyword, selectedCategory, selectedProvince, selectedSort, currentPage]);

  // Handle Search Input Change
  const handleSearchChange = (val) => {
    setSearchKeyword(val);
    setCurrentPage(0);
  };

  const handleClearSearch = () => {
    setSearchKeyword('');
    setCurrentPage(0);
  };

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setCurrentPage(0);
  };

  const handleProvinceChange = (prov) => {
    setSelectedProvince(prov);
    setCurrentPage(0);
  };

  const handleSortChange = (sort) => {
    setSelectedSort(sort);
    setCurrentPage(0);
  };

  const handleResetFilters = () => {
    setSearchKeyword('');
    setSelectedCategory('');
    setSelectedProvince('');
    setSelectedSort('rating,desc');
    setCurrentPage(0);
  };

  const hasActiveFilters = Boolean(
    searchKeyword || selectedCategory || selectedProvince || selectedSort !== 'rating,desc'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Hero Header Section */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold">
          <Compass className="w-3.5 h-3.5 text-brand-600" />
          <span>Kho dữ liệu du lịch Việt Nam • WBS 1.4.1</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
          Khám phá danh lam thắng cảnh
        </h1>
        <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Tra cứu hệ thống địa danh văn hóa, di sản thiên nhiên và điểm đến du lịch đặc sắc của 63 tỉnh thành Việt Nam.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-4 max-w-5xl mx-auto">
        <SearchBox
          value={searchKeyword}
          onChange={handleSearchChange}
          onClear={handleClearSearch}
        />

        <FilterBar
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategoryChange}
          selectedProvince={selectedProvince}
          onSelectProvince={handleProvinceChange}
          selectedSort={selectedSort}
          onSelectSort={handleSortChange}
          onResetFilters={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      {/* Main Content Area */}
      <div>
        {/* Loading State: Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
                <Skeleton className="h-52 w-full rounded-xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-12 w-full" />
                <div className="flex justify-between pt-2 border-t border-gray-100">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="max-w-md mx-auto p-6 rounded-2xl bg-red-50 border border-red-200 text-center space-y-4 my-10">
            <div className="inline-flex p-3 rounded-xl bg-red-100 text-red-600">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-red-900">Không thể tải dữ liệu</h3>
            <p className="text-sm text-red-700">{error}</p>
            <Button variant="danger" size="sm" onClick={fetchLocations}>
              Thử lại
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && places.length === 0 && (
          <div className="max-w-md mx-auto p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-xs my-8 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Không tìm thấy địa danh phù hợp</h3>
            <p className="text-sm text-gray-500">
              Thử thay đổi từ khóa tìm kiếm hoặc bỏ bớt các tiêu chí lọc tỉnh thành / danh mục.
            </p>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                Xóa toàn bộ bộ lọc
              </Button>
            )}
          </div>
        )}

        {/* Success Grid */}
        {!loading && !error && places.length > 0 && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {places.map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  onSelect={(p) => setSelectedPlace(p)}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalElements={totalElements}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>

      {/* Place Detail Modal */}
      {selectedPlace && (
        <PlaceDetailModal
          place={selectedPlace}
          onClose={() => setSelectedPlace(null)}
        />
      )}
    </div>
  );
};
