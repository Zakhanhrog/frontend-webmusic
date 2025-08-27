import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { submissionService } from "../services/submissionService";
import { useDarkMode } from "../../../hooks/useDarkMode";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import { PlusCircle, Music, Search, Edit, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { useDebounce } from "../../../hooks/useDebounce";
import Pagination from "../../../components/common/Pagination";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://api.muzo.com.vn";

const StatusBadge = ({ status }) => {
  const { currentTheme } = useDarkMode();
  const statusStyles = {
    PENDING:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    APPROVED:
      "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    REJECTED: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    REVIEWING:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  };

  return (
    <span
      className={`px-2.5 py-1 text-xs font-medium rounded-full ${
        statusStyles[status] || "bg-gray-200 text-gray-800"
      }`}
    >
      {status}
    </span>
  );
};

const MySubmissions = () => {
  const { currentTheme } = useDarkMode();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [pageInfo, setPageInfo] = useState({
    pageNumber: 0,
    pageSize: 5,
    totalPages: 0,
    totalElements: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSubmissions = async (page, size, keyword) => {
    try {
      setLoading(true);
      setError(null);
      const response = await submissionService.getMySubmissions(
        page,
        size,
        keyword
      );

      if (response && response.pageInfo && Array.isArray(response.content)) {
        setSubmissions(response.content);
        setPageInfo({
          pageNumber: response.pageInfo.page,
          pageSize: response.pageInfo.size,
          totalPages: response.pageInfo.totalPages,
          totalElements: response.pageInfo.totalElements,
        });
      } else {
        setError("Dữ liệu trả về không hợp lệ.");
        setSubmissions([]);
      }
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
      setError(
        err.response?.data?.message || "Không thể tải danh sách yêu cầu."
      );
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions(0, pageInfo.pageSize, debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pageInfo.totalPages) {
      fetchSubmissions(newPage, pageInfo.pageSize, debouncedSearchTerm);
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

  const openWithdrawModal = (id) => {
    setSelectedSubmissionId(id);
    setIsModalOpen(true);
  };

  const closeWithdrawModal = () => {
    setSelectedSubmissionId(null);
    setIsModalOpen(false);
  };

  const handleWithdrawConfirm = async () => {
    if (!selectedSubmissionId) return;

    setIsDeleting(true);
    try {
      await submissionService.withdrawSubmission(selectedSubmissionId);
      toast.success("Đã rút lại yêu cầu thành công!");
      fetchSubmissions(
        pageInfo.pageNumber,
        pageInfo.pageSize,
        debouncedSearchTerm
      );
      closeWithdrawModal();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Có lỗi xảy ra khi rút lại yêu cầu."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-music-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className={`text-center py-10 ${currentTheme.bgCard} rounded-lg`}>
          <p className="text-red-500">{error}</p>
        </div>
      );
    }

    if (submissions.length === 0) {
      return (
        <div
          className={`text-center py-16 ${currentTheme.bgCard} rounded-xl border ${currentTheme.border}`}
        >
          <Music
            className={`w-16 h-16 mx-auto ${currentTheme.textSecondary}`}
          />
          <h3 className={`mt-4 text-xl font-semibold ${currentTheme.text}`}>
            {searchTerm ? "Không tìm thấy kết quả" : "Không có yêu cầu nào"}
          </h3>
          <p className={`mt-2 text-sm ${currentTheme.textSecondary}`}>
            {searchTerm
              ? "Hãy thử một từ khóa khác."
              : "Bạn chưa gửi yêu cầu đăng bài hát nào."}
          </p>
          {!searchTerm && (
            <Link to="/creator/submission/new" className="mt-6 inline-block">
              <Button>Tạo yêu cầu mới</Button>
            </Link>
          )}
        </div>
      );
    }

    return (
      <div
        className={`overflow-x-auto ${currentTheme.bgCard} rounded-xl border ${currentTheme.border}`}
      >
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className={`${currentTheme.bg}`}>
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
              >
                Bài hát
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
              >
                Ngày gửi
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
              >
                Trạng thái
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
              >
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {submissions.map((submission) => (
              <tr
                key={submission.id}
                className={`hover:${currentTheme.bgHover}`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img
                        className="h-10 w-10 rounded-md object-cover"
                        src={
                          submission.thumbnailPath
                            ? `${API_BASE_URL}${submission.thumbnailPath}`
                            : `https://via.placeholder.com/40`
                        }
                        alt={submission.title}
                      />
                    </div>
                    <div className="ml-4">
                      <Link
                        to={`/creator/my-submissions/${submission.id}`}
                        className="font-medium hover:underline text-music-500 dark:text-music-400"
                      >
                        {submission.title}
                      </Link>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {new Date(submission.submissionDate).toLocaleDateString(
                    "vi-VN"
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={submission.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-4">
                    {submission.status === "PENDING" ? (
                      <>
                        <Link
                          to={`/creator/submission/edit/${submission.id}`}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openWithdrawModal(submission.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <span className={`text-xs ${currentTheme.textSecondary}`}>
                        Đã xử lý
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${currentTheme.text}`}>
            Yêu cầu đăng bài hát
          </h1>
          <p className={`mt-2 ${currentTheme.textSecondary}`}>
            Quản lý các bài hát bạn đã gửi.
          </p>
        </div>
        <Link to="/creator/submission/new">
          <Button className="flex items-center space-x-2">
            <PlusCircle className="w-5 h-5" />
            <span>Tạo yêu cầu mới</span>
          </Button>
        </Link>
      </div>

      <div className="flex justify-end">
        <div className="w-full md:w-1/3">
          <Input
            placeholder="Tìm kiếm theo tên bài hát..."
            icon={<Search size={18} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {renderContent()}

      {!loading && pageInfo.totalPages > 1 && (
        <div className="flex items-center justify-between w-full mt-2 flex-col md:flex-row gap-4 md:gap-0">
          <p className={`text-sm ${currentTheme.textSecondary}`}>
            Hiển thị {from} - {to} trên {pageInfo.totalElements} yêu cầu
          </p>
          <Pagination
            currentPage={pageInfo.pageNumber}
            totalPages={pageInfo.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={closeWithdrawModal}
        onConfirm={handleWithdrawConfirm}
        title="Xác nhận Rút lại Yêu cầu"
        message="Bạn có chắc chắn muốn rút lại yêu cầu này không? Hành động này không thể hoàn tác."
        confirmText="Đồng ý Rút lại"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default MySubmissions;
