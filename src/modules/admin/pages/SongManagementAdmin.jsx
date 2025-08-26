import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDarkMode } from "../../../hooks/useDarkMode";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import { useDebounce } from "../../../hooks/useDebounce";
import {
  PlusCircle,
  Edit,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Search,
} from "lucide-react";
import { adminService } from "../services/adminService";
import { toast } from "react-toastify";
import Pagination from "../../../components/common/Pagination";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://api.muzo.com.vn";

const StatusBadge = ({ status }) => {
  const statusStyles = {
    PENDING:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
    APPROVED:
      "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    REJECTED: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    HIDDEN: "bg-gray-100 text-gray-800 dark:bg-gray-700/40 dark:text-gray-400",
  };
  return (
    <span
      className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
        statusStyles[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status}
    </span>
  );
};

const PremiumBadge = ({ isPremium }) => {
  if (isPremium) {
    return (
      <span className="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
        PREMIUM
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300">
      FREE
    </span>
  );
};

const SongManagementAdmin = () => {
  const { currentTheme } = useDarkMode();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageInfo, setPageInfo] = useState({
    pageNumber: 0,
    pageSize: 5,
    totalPages: 0,
    totalElements: 0,
  });
  const [processingId, setProcessingId] = useState(null);

  // --- BẮT ĐẦU SỬA ĐỔI: Thêm state cho tìm kiếm ---
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms delay
  // --- KẾT THÚC SỬA ĐỔI ---

  const fetchSongs = async (page, size, search = "") => {
    // Thêm search vào hàm
    try {
      setLoading(true);
      const response = await adminService.getSongs(page, size, search); // Truyền search vào service
      if (response.success && response.data && response.data.pageInfo) {
        setSongs(
          Array.isArray(response.data.content) ? response.data.content : []
        );
        setPageInfo({
          pageNumber: response.data.pageInfo.page,
          pageSize: response.data.pageInfo.size,
          totalPages: response.data.pageInfo.totalPages,
          totalElements: response.data.pageInfo.totalElements,
        });
      } else {
        setSongs([]);
        toast.error(response.message || "Không thể tải danh sách bài hát.");
      }
    } catch (err) {
      toast.error("Đã xảy ra lỗi khi tải danh sách bài hát.");
    } finally {
      setLoading(false);
    }
  };

  // Effect để fetch dữ liệu lần đầu và khi tìm kiếm
  useEffect(() => {
    // Khi tìm kiếm, luôn quay về trang đầu tiên
    fetchSongs(0, pageInfo.pageSize, debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  // Effect để fetch dữ liệu khi chuyển trang
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pageInfo.totalPages) {
      fetchSongs(newPage, pageInfo.pageSize, debouncedSearchTerm);
    }
  };

  const handleToggleVisibility = async (songId) => {
    setProcessingId(songId);
    try {
      const response = await adminService.toggleSongVisibility(songId);
      if (response.success) {
        toast.success(response.message);
        setSongs(songs.map((s) => (s.id === songId ? response.data : s)));
      } else {
        toast.error(response.message || "Thay đổi trạng thái thất bại.");
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi thay đổi trạng thái bài hát.");
    } finally {
      setProcessingId(null);
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
            Quản lý bài hát
          </h1>
          <p className={`mt-2 ${currentTheme.textSecondary}`}>
            Thêm, sửa, và quản lý các bài hát trong hệ thống.
          </p>
        </div>
        <Link to="/admin/songs/new">
          <Button className="flex items-center space-x-2 w-full md:w-auto">
            <PlusCircle className="w-5 h-5" />
            <span>Thêm bài hát</span>
          </Button>
        </Link>
      </div>

      {/* --- BẮT ĐẦU SỬA ĐỔI: Thêm ô tìm kiếm --- */}
      <div className="flex justify-end">
        <div className="w-full md:w-1/3">
          <Input
            id="search-song"
            placeholder="Tìm theo tên bài hát, ca sĩ..."
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
                Bài hát
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Ca sĩ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Loại bài hát
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading && (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  Đang tải...
                </td>
              </tr>
            )}
            {!loading && songs.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  Không có bài hát nào phù hợp.
                </td>
              </tr>
            )}
            {!loading &&
              songs.map((song) => (
                <tr key={song.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                    {song.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-lg object-cover"
                          src={
                            song.thumbnailPath
                              ? `${API_BASE_URL}${song.thumbnailPath}`
                              : `https://ui-avatars.com/api/?name=${song.title.replace(
                                  /\s/g,
                                  "+"
                                )}&background=random`
                          }
                          alt={song.title}
                        />
                      </div>
                      <div className="ml-4">
                        <Link
                          to={`/song/${song.id}`}
                          className="font-medium hover:underline"
                        >
                          {song.title}
                        </Link>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {song.singers?.map((s) => s.name).join(", ") || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <PremiumBadge isPremium={song.isPremium} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={song.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                    {(song.status === "APPROVED" ||
                      song.status === "HIDDEN") && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleVisibility(song.id)}
                        disabled={processingId === song.id}
                        data-tooltip-id="global-tooltip"
                        data-tooltip-content={
                          song.status === "APPROVED"
                            ? "Ẩn bài hát"
                            : "Hiện bài hát"
                        }
                      >
                        {song.status === "APPROVED" ? (
                          <EyeOff className="w-5 h-5 text-yellow-500" />
                        ) : (
                          <Eye className="w-5 h-5 text-green-500" />
                        )}
                      </Button>
                    )}
                    <Link to={`/admin/songs/edit/${song.id}`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        data-tooltip-id="global-tooltip"
                        data-tooltip-content="Chỉnh sửa"
                      >
                        <Edit className="w-5 h-5 text-blue-500" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {!loading && pageInfo.totalPages > 1 && (
        <div className="flex items-center justify-between w-full mt-4 flex-col md:flex-row gap-4 md:gap-0">
          <p className={`text-sm ${currentTheme.textSecondary}`}>
            Hiển thị {from} - {to} trên {pageInfo.totalElements} bài hát
          </p>
          <Pagination
            currentPage={pageInfo.pageNumber}
            totalPages={pageInfo.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default SongManagementAdmin;
