import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDarkMode } from "../../../hooks/useDarkMode";
import { adminService } from "../services/adminService";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import FileUpload from "../../../components/common/FileUpload";
import MultiSelect from "../../../components/common/MultiSelect";
import { toast } from "react-toastify";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://api.muzo.com.vn";

const EditSongAdmin = () => {
  const { songId } = useParams();
  const navigate = useNavigate();
  const { currentTheme } = useDarkMode();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    lyrics: "",
    singerIds: [],
    tagIds: [],
    isPremium: false,
  });

  const [audioFile, setAudioFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [existingFiles, setExistingFiles] = useState({
    audio: null,
    thumbnail: null,
  });

  const [availableSingers, setAvailableSingers] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!songId) {
        setError("ID bài hát không hợp lệ.");
        setPageLoading(false);
        return;
      }
      setPageLoading(true);
      try {
        const [singersRes, tagsRes, songRes] = await Promise.all([
          adminService.getAllApprovedSingers(),
          adminService.getAllTags(),
          adminService.getSongByIdForAdmin(songId),
        ]);

        if (singersRes.success && Array.isArray(singersRes.data)) {
          setAvailableSingers(
            singersRes.data.map((s) => ({ id: s.id, name: s.name }))
          );
        }
        if (tagsRes.success && Array.isArray(tagsRes.data)) {
          setAvailableTags(
            tagsRes.data.map((t) => ({ id: t.id, name: t.name }))
          );
        }

        if (songRes.success && songRes.data) {
          const songData = songRes.data;
          setFormData({
            title: songData.title || "",
            description: songData.description || "",
            lyrics: songData.lyrics || "",
            singerIds: songData.singers.map((s) => s.id),
            tagIds: songData.tags.map((t) => t.id),
            isPremium: songData.isPremium || false,
          });
          setExistingFiles({
            audio: songData.filePath,
            thumbnail: songData.thumbnailPath,
          });
        } else {
          toast.error(songRes.message || "Không tìm thấy bài hát.");
          navigate("/admin/songs");
        }
      } catch (err) {
        toast.error("Không thể tải dữ liệu bài hát.");
        console.error(err);
        navigate("/admin/songs");
      } finally {
        setPageLoading(false);
      }
    };
    fetchData();
  }, [songId, navigate]);

  const handleChange = (e) =>
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.type === "checkbox" ? e.target.checked : e.target.value,
    });

  const handleSelectionChange = (field, ids) => {
    setFormData((prev) => ({ ...prev, [field]: ids }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const updateData = {
      title: formData.title,
      description: formData.description,
      lyrics: formData.lyrics,
      singerIds: formData.singerIds,
      tagIds: formData.tagIds,
      isPremium: formData.isPremium,
    };

    try {
      await adminService.updateSongByAdmin(
        songId,
        updateData,
        audioFile,
        thumbnailFile
      );
      toast.success("Cập nhật bài hát thành công!");
      navigate("/admin/songs");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Đã có lỗi xảy ra khi cập nhật."
      );
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-music-500"></div>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className={`text-3xl font-bold ${currentTheme.text}`}>
          Chỉnh sửa bài hát (Admin)
        </h1>
        <p className={`${currentTheme.textSecondary}`}>
          Cập nhật thông tin chi tiết cho bài hát.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div
          className={`p-8 rounded-xl border ${currentTheme.border} ${currentTheme.bgCard} space-y-6`}
        >
          <h2 className="text-xl font-semibold">Thông tin cơ bản</h2>
          <Input
            name="title"
            label="Tên bài hát "
            value={formData.title}
            onChange={handleChange}
            required
          />
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
            >
              Mô tả
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Giới thiệu ngắn về bài hát..."
              value={formData.description}
              onChange={handleChange}
              className={`w-full p-2 border rounded-lg ${currentTheme.bg} ${currentTheme.border} focus:border-music-500 focus:ring-music-500`}
            />
          </div>
          <div>
            <label
              htmlFor="lyrics"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
            >
              Lời bài hát (LRC Format)
            </label>
            <textarea
              id="lyrics"
              name="lyrics"
              rows={10}
              placeholder="Dán lời bài hát tại đây..."
              value={formData.lyrics}
              onChange={handleChange}
              className={`w-full p-2 border rounded-lg ${currentTheme.bg} ${currentTheme.border} focus:border-music-500 focus:ring-music-500 font-mono`}
            />
          </div>
        </div>

        <div
          className={`p-8 rounded-xl border ${currentTheme.border} ${currentTheme.bgCard} space-y-6`}
        >
          <h2 className="text-xl font-semibold">Ca sĩ & Thể loại</h2>
          <MultiSelect
            label="Ca sĩ * (Chỉ hiển thị ca sĩ đã duyệt)"
            options={availableSingers}
            selected={formData.singerIds}
            onChange={(ids) => handleSelectionChange("singerIds", ids)}
            placeholder="Chọn ca sĩ..."
          />
          <MultiSelect
            label="Thể loại"
            options={availableTags}
            selected={formData.tagIds}
            onChange={(ids) => handleSelectionChange("tagIds", ids)}
            placeholder="Chọn thể loại..."
          />
        </div>

        <div
          className={`p-8 rounded-xl border ${currentTheme.border} ${currentTheme.bgCard} space-y-6`}
        >
          <h2 className="text-xl font-semibold">
            Tệp tin (Chỉ chọn nếu muốn thay đổi)
          </h2>
          <FileUpload
            label="File audio"
            accept="audio/*"
            onFileChange={setAudioFile}
            fileName={existingFiles.audio?.split("/").pop()}
          />
          <FileUpload
            label="Ảnh bìa"
            accept="image/*"
            onFileChange={setThumbnailFile}
            previewType="image"
            existingFileUrl={
              existingFiles.thumbnail
                ? `${API_BASE_URL}${existingFiles.thumbnail}`
                : null
            }
            fileName={existingFiles.thumbnail?.split("/").pop()}
          />
        </div>

        <div
          className={`p-8 rounded-xl border ${currentTheme.border} ${currentTheme.bgCard}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <label
                htmlFor="isPremium"
                className="font-medium text-slate-900 dark:text-slate-100"
              >
                Bài hát Premium
              </label>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Chỉ người dùng Premium mới có thể nghe.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="isPremium"
                name="isPremium"
                checked={formData.isPremium}
                onChange={handleChange}
                className="sr-only peer"
                color="blue"
              />
              <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-cyan-300 dark:peer-focus:ring-cyan-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all duration-300 dark:border-slate-600 peer-checked:bg-gradient-to-r peer-checked:from-cyan-500 peer-checked:to-blue-600"></div>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/admin/songs")}
          >
            Hủy
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Đang cập nhật..." : "Lưu thay đổi"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditSongAdmin;
