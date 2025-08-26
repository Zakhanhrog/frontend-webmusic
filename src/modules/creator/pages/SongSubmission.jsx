// File: src/modules/creator/pages/SongSubmission.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDarkMode } from "../../../hooks/useDarkMode";
import { submissionService } from "../services/submissionService";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import FileUpload from "../../../components/common/FileUpload";
import MultiSelect from "../../../components/common/MultiSelect";
import { toast } from "react-toastify";
import { PlusCircle, Trash2 } from "lucide-react";
import CreateSingerModal from "../../admin/components/CreateSingerModal";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://api.muzo.com.vn";

const NewSingerInput = ({ singer, index, onUpdate, onRemove }) => {
  const [avatarPreview, setAvatarPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onUpdate(index, "avatarFile", file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
      <label className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center bg-slate-200 dark:bg-slate-600 cursor-pointer overflow-hidden text-slate-400 hover:opacity-80 transition-opacity">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        {avatarPreview ? (
          <img
            src={avatarPreview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-xs">Ảnh</span>
        )}
      </label>
      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input
          placeholder="Tên ca sĩ *"
          value={singer.name}
          onChange={(e) => onUpdate(index, "name", e.target.value)}
          className="!mb-0"
          required
        />
        <Input
          placeholder="Email *"
          type="email"
          value={singer.email}
          onChange={(e) => onUpdate(index, "email", e.target.value)}
          className="!mb-0"
          required
        />
      </div>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={() => onRemove(index)}
        className="text-red-500 flex-shrink-0"
      >
        <Trash2 size={18} />
      </Button>
    </div>
  );
};

const SongSubmission = () => {
  const { submissionId } = useParams();
  const isEditMode = Boolean(submissionId);
  const navigate = useNavigate();
  const { currentTheme } = useDarkMode();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    lyrics: "",
    existingSingerIds: [],
    tagIds: [],
    isPremium: false,
  });

  const [existingFiles, setExistingFiles] = useState({
    audio: null,
    thumbnail: null,
  });
  const [audioFile, setAudioFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState(null);

  const [newSingers, setNewSingers] = useState([]);
  const [isCreateSingerModalOpen, setIsCreateSingerModalOpen] = useState(false);

  const [availableSingers, setAvailableSingers] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const fetchFormOptions = async () => {
    try {
      const formOptions = await submissionService.fetchFormData();
      setAvailableSingers(
        Array.isArray(formOptions?.singers)
          ? formOptions.singers.map((s) => ({
              id: s.id,
              name: s.name,
              status: s.status,
            }))
          : []
      );
      setAvailableTags(
        Array.isArray(formOptions?.tags)
          ? formOptions.tags.map((t) => ({ id: t.id, name: t.name }))
          : []
      );
    } catch (error) {
      toast.error("Không thể tải lại danh sách ca sĩ/thể loại.");
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setPageLoading(true);
      try {
        await fetchFormOptions();

        if (isEditMode) {
          const submissionResponse = await submissionService.getSubmissionById(
            submissionId
          );
          const subData = submissionResponse.data;
          if (subData) {
            const existing = subData.singers.filter(
              (s) => s.status === "APPROVED"
            );
            const pending = subData.singers.filter(
              (s) => s.status === "PENDING" && s.creatorId === subData.creatorId
            );

            setFormData({
              title: subData.title || "",
              description: subData.description || "",
              lyrics: subData.lyrics || "",
              existingSingerIds: existing.map((s) => s.id),
              tagIds: subData.tags.map((t) => t.id),
              isPremium: subData.isPremium || false,
            });
            setNewSingers(
              pending.map((s) => ({ ...s, clientId: s.id, avatarFile: null }))
            );
            setExistingFiles({
              audio: subData.filePath,
              thumbnail: subData.thumbnailPath,
            });
            if (subData.thumbnailPath)
              setThumbnailPreviewUrl(`${API_BASE_URL}${subData.thumbnailPath}`);
          } else {
            toast.error("Không tìm thấy yêu cầu.");
            navigate("/creator/my-submissions");
          }
        }
      } catch (error) {
        toast.error("Không thể tải dữ liệu. Vui lòng thử lại.");
      } finally {
        setPageLoading(false);
      }
    };
    loadInitialData();
  }, [submissionId, isEditMode, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAudioFileChange = (file) => {
    setAudioFile(file);
    setAudioPreviewUrl(file ? URL.createObjectURL(file) : null);
  };
  const handleThumbnailFileChange = (file) => {
    setThumbnailFile(file);
    setThumbnailPreviewUrl(
      file
        ? URL.createObjectURL(file)
        : existingFiles.thumbnail
        ? `${API_BASE_URL}${existingFiles.thumbnail}`
        : null
    );
  };

  const handleAddNewSinger = () =>
    setNewSingers([
      ...newSingers,
      { clientId: `new-${Date.now()}`, name: "", email: "", avatarFile: null },
    ]);
  const handleRemoveNewSinger = (index) =>
    setNewSingers(newSingers.filter((_, i) => i !== index));
  const handleNewSingerChange = (index, key, value) => {
    const updatedSingers = [...newSingers];
    updatedSingers[index][key] = value;
    setNewSingers(updatedSingers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim())
      return toast.error("Vui lòng nhập tên bài hát.");
    if (
      formData.existingSingerIds.length === 0 &&
      newSingers.every((s) => !s.name.trim() || !s.email.trim())
    ) {
      return toast.error("Vui lòng chọn hoặc thêm ít nhất một ca sĩ hợp lệ.");
    }
    if (!isEditMode && !audioFile)
      return toast.error("Vui lòng chọn file audio.");

    setLoading(true);

    const validNewSingers = newSingers.filter(
      (s) => s.name.trim() && s.email.trim()
    );

    const requestDto = {
      ...formData,
      newSingers: validNewSingers.map(s => ({
        id: s.id, // GỬI ID LÊN
        name: s.name,
        email: s.email,
        avatarFileName: s.avatarFile ? s.avatarFile.name : null,
      })),
    };

    const submissionFormData = new FormData();
    submissionFormData.append(
      "submissionRequest",
      new Blob([JSON.stringify(requestDto)], { type: "application/json" })
    );

    if (audioFile) submissionFormData.append("audioFile", audioFile);
    if (thumbnailFile)
      submissionFormData.append("thumbnailFile", thumbnailFile);

    validNewSingers.forEach((singer) => {
      if (singer.avatarFile) {
        submissionFormData.append(
          "newSingerAvatars",
          singer.avatarFile,
          singer.avatarFile.name
        );
      }
    });

    try {
      if (isEditMode) {
        await submissionService.updateSubmission(
          submissionId,
          submissionFormData
        );
        toast.success("Đã cập nhật yêu cầu thành công!");
      } else {
        await submissionService.createSubmission(submissionFormData);
        toast.success("Đã gửi yêu cầu thành công!");
      }
      navigate("/creator/my-submissions");
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra.");
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

  // START-FIX: Bọc toàn bộ JSX trong một thẻ fragment duy nhất <> ... </>
  return (
    <>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className={`text-3xl font-bold ${currentTheme.text}`}>
            {isEditMode ? "Chỉnh sửa Yêu cầu" : "Tạo Yêu cầu Đăng bài hát"}
          </h1>
          <p className={`${currentTheme.textSecondary}`}>
            {isEditMode
              ? "Cập nhật thông tin cho yêu cầu của bạn."
              : "Điền đầy đủ thông tin để gửi bài hát."}
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
              onChange={handleInputChange}
              required
            />
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Giới thiệu ngắn về bài hát..."
              value={formData.description}
              onChange={handleInputChange}
              className={`w-full p-2 border rounded-lg ${currentTheme.bg} ${currentTheme.border} focus:border-music-500 focus:ring-music-500`}
            />
            <div>
              <label
                htmlFor="lyrics"
                className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-1"
              >
                Lời bài hát (LRC Format)
              </label>
              <textarea
                id="lyrics"
                name="lyrics"
                rows={10}
                placeholder="Dán lời bài hát tại đây, ví dụ: [00:12.34]Dòng lời thứ nhất..."
                value={formData.lyrics}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-lg ${currentTheme.bg} ${currentTheme.border} focus:border-music-500 focus:ring-music-500 font-mono`}
              />
            </div>
          </div>

          <div
            className={`p-8 rounded-xl border ${currentTheme.border} ${currentTheme.bgCard} space-y-6`}
          >
            <h2 className="text-xl font-semibold">Ca sĩ & Thể loại</h2>
            <MultiSelect
              label="Ca sĩ đã có"
              options={availableSingers}
              selected={formData.existingSingerIds}
              onChange={(ids) =>
                setFormData({ ...formData, existingSingerIds: ids })
              }
              placeholder="Chọn từ danh sách ca sĩ..."
            />
            <MultiSelect
              label="Thể loại"
              options={availableTags}
              selected={formData.tagIds}
              onChange={(ids) => setFormData({ ...formData, tagIds: ids })}
              placeholder="Chọn thể loại..."
            />
          </div>

          <div
            className={`p-8 rounded-xl border ${currentTheme.border} ${currentTheme.bgCard} space-y-4`}
          >
            <h2 className="text-xl font-semibold">Thêm ca sĩ mới (nếu cần)</h2>
            <div className="space-y-3">
              {newSingers.map((singer, index) => (
                <NewSingerInput
                  key={singer.clientId || index}
                  singer={singer}
                  index={index}
                  onUpdate={handleNewSingerChange}
                  onRemove={() => handleRemoveNewSinger(index)}
                />
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddNewSinger}
              className="flex items-center w-full justify-center"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Thêm ca sĩ mới
            </Button>
          </div>

          <div
            className={`p-8 rounded-xl border ${currentTheme.border} ${currentTheme.bgCard} space-y-6`}
          >
            <h2 className="text-xl font-semibold">
              Tệp tin {isEditMode && "(Chỉ chọn nếu muốn thay đổi)"}
            </h2>
            <FileUpload
              label={`File audio ${!isEditMode ? "*" : ""}`}
              accept="audio/*"
              onFileChange={handleAudioFileChange}
              fileName={
                audioFile?.name || existingFiles.audio?.split("/").pop()
              }
              previewType="audio"
              existingFileUrl={audioPreviewUrl}
            />
            <FileUpload
              label="Ảnh bìa"
              accept="image/*"
              onFileChange={handleThumbnailFileChange}
              previewType="image"
              existingFileUrl={thumbnailPreviewUrl}
              fileName={
                thumbnailFile?.name || existingFiles.thumbnail?.split("/").pop()
              }
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
                  onChange={handleInputChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate("/creator/my-submissions")}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Đang xử lý..."
                : isEditMode
                ? "Lưu thay đổi"
                : "Gửi yêu cầu"}
            </Button>
          </div>
        </form>
      </div>

      <CreateSingerModal
        isOpen={isCreateSingerModalOpen}
        onClose={() => setIsCreateSingerModalOpen(false)}
        onSuccess={() => {
          /* Logic này không còn được dùng trực tiếp */
        }}
      />
    </>
  );
};

export default SongSubmission;
