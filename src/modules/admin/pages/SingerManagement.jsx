import React, { useState, useEffect } from "react";
import { useDarkMode } from "../../../hooks/useDarkMode";
import Button from "../../../components/common/Button";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import Input from "../../../components/common/Input"; // Thêm Input component
import { useDebounce } from "../../../hooks/useDebounce"; // Thêm useDebounce
import {
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Search,
} from "lucide-react"; // Thêm Search icon
import { adminService } from "../services/adminService";
import CreateSingerModal from "../components/CreateSingerModal";
import UpdateSingerModal from "../components/UpdateSingerModal";
import Pagination from "../../../components/common/Pagination";
import { toast } from "react-toastify";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://api.muzo.com.vn";

const SingerManagement = () => {
  const { currentTheme } = useDarkMode();
  const [singers, setSingers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSinger, setSelectedSinger] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pageInfo, setPageInfo] = useState({
    pageNumber: 0,
    pageSize: 5,
    totalPages: 0,
    totalElements: 0,
  });

  // --- BẮT ĐẦU SỬA ĐỔI: Thêm state cho tìm kiếm ---
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  // --- KẾT THÚC SỬA ĐỔI ---

  const fetchSingers = async (page, size, search = "") => {
    // Thêm search vào hàm
    try {
      setLoading(true);
      const response = await adminService.getSingers(page, size, search, 'APPROVED'); // Chỉ lấy ca sĩ đã được duyệt
      if (response.success && response.data) {
        setSingers(
          Array.isArray(response.data.content) ? response.data.content : []
        );
        setPageInfo({
          pageNumber: response.data.pageInfo.page,
          pageSize: response.data.pageInfo.size,
          totalPages: response.data.pageInfo.totalPages,
          totalElements: response.data.pageInfo.totalElements,
        });
      } else {
        setSingers([]);
        toast.error(response.message || "Không thể tải danh sách ca sĩ.");
      }
    } catch (err) {
      toast.error("Đã xảy ra lỗi khi tải danh sách ca sĩ.");
    } finally {
      setLoading(false);
    }
  };

  // Effect để fetch dữ liệu lần đầu và khi tìm kiếm
  useEffect(() => {
    fetchSingers(0, pageInfo.pageSize, debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    toast.success("Thêm ca sĩ mới thành công!");
    fetchSingers(0, pageInfo.pageSize, debouncedSearchTerm); // Fetch lại với từ khóa hiện tại
  };

  const handleUpdateSuccess = (updatedSinger) => {
    setIsUpdateModalOpen(false);
    setSingers((prev) =>
      prev.map((s) => (s.id === updatedSinger.id ? updatedSinger : s))
    );
  };

  const handleDeleteClick = (singer) => {
    setSelectedSinger(singer);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedSinger) return;
    setIsProcessing(true);
    try {
      const response = await adminService.deleteSingerByAdmin(
        selectedSinger.id
      );
      if (response.success) {
        toast.success(response.message || "Xóa ca sĩ thành công!");
        // Fetch lại dữ liệu trang hiện tại để cập nhật tổng số phần tử
        fetchSingers(
          pageInfo.pageNumber,
          pageInfo.pageSize,
          debouncedSearchTerm
        );
        setIsDeleteModalOpen(false);
      } else {
        toast.error(response.message || "Xóa ca sĩ thất bại.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Đã có lỗi xảy ra khi xóa ca sĩ."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pageInfo.totalPages) {
      fetchSingers(newPage, pageInfo.pageSize, debouncedSearchTerm);
    }
  };

  const from =
    pageInfo.totalElements > 0
      ? pageInfo.pageNumber * pageInfo.pageSize + 1
      : 0;
  const to = Math.min(
    (pageInfo.pageNumber + 1) * pageInfo.pageSize,
    pageInfo.totalElements
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${currentTheme.text}`}>
            Quản lý ca sĩ đã duyệt
          </h1>
          <p className={`mt-2 ${currentTheme.textSecondary}`}>
            Thêm, sửa, và quản lý các ca sĩ đã được duyệt trong hệ thống.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 w-full md:w-auto"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Thêm ca sĩ</span>
        </Button>
      </div>

      {/* --- BẮT ĐẦU SỬA ĐỔI: Thêm ô tìm kiếm --- */}
      <div className="flex justify-end">
        <div className="w-full md:w-1/3">
          <Input
            id="search-singer"
            placeholder="Tìm ca sĩ đã duyệt theo tên hoặc email..."
            icon={<Search size={18} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      {/* --- KẾT THÚC SỬA ĐỔI --- */}

      <div
        className={`overflow-x-auto ${currentTheme.bgCard} rounded-xl border ${currentTheme.border}`}
      >
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className={`${currentTheme.bg}`}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Ca sĩ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading && (
              <tr>
                <td colSpan="4" className="text-center py-4">
                  Đang tải...
                </td>
              </tr>
            )}
            {!loading && singers.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-4">
                  Không có ca sĩ đã duyệt nào phù hợp.
                </td>
              </tr>
            )}
            {!loading &&
              singers.map((singer) => (
                <tr key={singer.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                    {singer.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={
                            singer.avatarPath
                              ? `${API_BASE_URL}${singer.avatarPath}`
                              : `https://ui-avatars.com/api/?name=${singer.name.replace(
                                  /\s/g,
                                  "+"
                                )}`
                          }
                          alt={singer.name}
                        />
                      </div>
                      <div className="ml-4 font-medium">{singer.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {singer.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedSinger(singer);
                        setIsUpdateModalOpen(true);
                      }}
                    >
                      <Edit className="w-5 h-5 text-blue-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(singer)}
                    >
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {!loading && pageInfo.totalPages > 1 && (
        <div className="flex items-center justify-between w-full mt-2 flex-col md:flex-row gap-4 md:gap-0">
          <p className={`text-sm ${currentTheme.textSecondary}`}>
            Hiển thị {from} - {to} trên {pageInfo.totalElements} ca sĩ đã duyệt
          </p>
          <Pagination
            currentPage={pageInfo.pageNumber}
            totalPages={pageInfo.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      <CreateSingerModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <UpdateSingerModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        singer={selectedSinger}
        onSingerUpdated={handleUpdateSuccess}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={`Xác nhận xóa ca sĩ`}
        message={`Bạn có chắc chắn muốn xóa ca sĩ "${selectedSinger?.name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        variant="danger"
        isLoading={isProcessing}
      />
    </div>
  );
};

export default SingerManagement;
