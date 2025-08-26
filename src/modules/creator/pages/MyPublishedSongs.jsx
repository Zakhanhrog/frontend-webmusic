import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../../../hooks/useDarkMode";
import { creatorService } from "../services/creatorService.js";
import { toast } from "react-toastify";
import { format } from "date-fns";
import Input from "../../../components/common/Input";
import { Search } from "lucide-react";
import Pagination from "../../../components/common/Pagination";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

const MyPublishedSongs = () => {
  const { currentTheme } = useDarkMode();
  const navigate = useNavigate();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    size: 5,
    totalPages: 0,
    totalElements: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchSongs = async () => {
      setLoading(true);
      try {
        const response = await creatorService.getMyPublishedSongs(
          pageInfo.page,
          pageInfo.size,
          searchTerm
        );
        if (response.success) {
          setSongs(response.data.content);
          setPageInfo({
            ...pageInfo,
            totalPages: response.data.pageInfo.totalPages,
            totalElements: response.data.pageInfo.totalElements,
          });
        } else {
          toast.error("Không thể tải danh sách bài hát.");
        }
      } catch (error) {
        toast.error("Lỗi khi tải dữ liệu. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    const debounceFetch = setTimeout(() => {
      fetchSongs();
    }, 500);

    return () => clearTimeout(debounceFetch);
  }, [pageInfo.page, pageInfo.size, searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPageInfo((prev) => ({ ...prev, page: 0 }));
  };

  const handlePageChange = (newPage) => {
    setPageInfo((prev) => ({ ...prev, page: newPage }));
  };

  const from =
    pageInfo.totalElements > 0 ? pageInfo.page * pageInfo.size + 1 : 0;
  const to = Math.min(
    (pageInfo.page + 1) * pageInfo.size,
    pageInfo.totalElements
  );

  const handleRowClick = (songId) => {
    navigate(`/song/${songId}`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className={`text-3xl font-bold ${currentTheme.text}`}>
          Thư viện bài hát
        </h1>
        <p className={`${currentTheme.textSecondary}`}>
          Quản lý các bài hát đã được xuất bản của bạn.
        </p>
      </div>
      <div className="flex justify-between items-center mb-4">
        <div className="w-full max-w-sm">
          <Input
            placeholder="Tìm kiếm theo tên bài hát..."
            value={searchTerm}
            onChange={handleSearchChange}
            icon={Search}
          />
        </div>
      </div>

      <div
        className={`rounded-xl border ${currentTheme.border} ${currentTheme.bgCard} overflow-hidden`}
      >
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200 dark:divide-gray-700 table-fixed">
            <thead className={`${currentTheme.bg}`}>
              <tr>
                {/* 👇 SỬA Ở ĐÂY: Bỏ đi w-[40%] */}
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                >
                  Tên bài hát
                </th>
                {/* 👇 SỬA Ở ĐÂY: Bỏ đi w-[25%] */}
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                >
                  Ca sĩ
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider"
                >
                  Lượt nghe
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider"
                >
                  Lượt thích
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                >
                  Ngày đăng
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                >
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center p-8">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-music-500"></div>
                    </div>
                  </td>
                </tr>
              ) : songs.length > 0 ? (
                songs.map((song) => (
                  <tr
                    key={song.id}
                    className={`hover:${currentTheme.bgHover} cursor-pointer transition-colors`}
                    onClick={() => handleRowClick(song.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap overflow-hidden">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            src={`${API_BASE_URL}${song.thumbnailPath}`}
                            alt={song.title}
                            className="w-10 h-10 rounded-md object-cover"
                          />
                        </div>
                        <div className="ml-4 overflow-hidden">
                          <span className="font-medium truncate block">
                            {song.title}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap truncate">
                      {song.singers.map((s) => s.name).join(", ")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {song.listenCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {song.likeCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(song.createdAt), "dd/MM/yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          song.isPremium
                            ? "bg-yellow-500/20 text-yellow-500"
                            : "bg-green-500/20 text-green-500"
                        }`}
                      >
                        {song.isPremium ? "PREMIUM" : "MIỄN PHÍ"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center p-8">
                    Không tìm thấy bài hát nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {!loading && pageInfo.totalPages > 1 && (
        <div className="flex items-center justify-between w-full mt-2 flex-col md:flex-row gap-4 md:gap-0">
          <p className={`text-sm ${currentTheme.textSecondary}`}>
            Hiển thị {from} - {to} trên {pageInfo.totalElements} bài hát
          </p>
          <Pagination
            currentPage={pageInfo.page}
            totalPages={pageInfo.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default MyPublishedSongs;
