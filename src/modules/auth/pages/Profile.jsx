import React, { useState, useEffect, useCallback } from "react";
import { useDarkMode } from "../../../hooks/useDarkMode";
import { useAuth } from "../../../hooks/useAuth";
import { authService } from "../services/authService";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import FileUpload from "../../../components/common/FileUpload";
import Avatar from "../../../components/common/Avatar";
import { User, Mail, Phone, Calendar } from "lucide-react";
import { toast } from "react-toastify";

// const API_BASE_URL =
//   import.meta.env.VITE_API_BASE_URL || "https://api.muzo.com.vn";

const SettingsCard = ({ title, description, children }) => {
  const { isDarkMode } = useDarkMode();
  return (
    <div
      className={`rounded-xl border ${
        isDarkMode
          ? "border-slate-800 bg-slate-900/50"
          : "border-slate-200 bg-white/80"
      } backdrop-blur-lg`}
    >
      <div className="p-6">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p
          className={`mt-1 text-sm ${
            isDarkMode ? "text-slate-400" : "text-slate-600"
          }`}
        >
          {description}
        </p>
      </div>
      <div className="p-6 pt-0">{children}</div>
    </div>
  );
};

const Profile = () => {
  const { currentTheme } = useDarkMode();
  const { user, updateUserContext } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [wantsToRemoveAvatar, setWantsToRemoveAvatar] = useState(false);

  const resetFormData = useCallback(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || "",
        phoneNumber: user.phoneNumber || "",
        dateOfBirth: user.dateOfBirth
          ? new Date(user.dateOfBirth).toISOString().split("T")[0]
          : "",
        gender: user.gender || "",
      });
      setAvatarFile(null);
      const isExternal = user.avatarPath && user.avatarPath.startsWith("http");
      setAvatarPreview(
        user.avatarPath
          ? isExternal
            ? user.avatarPath
            : `${import.meta.env.VITE_API_BASE_URL || "https://api.muzo.com.vn"}${
                user.avatarPath
              }`
          : ""
      );
      setWantsToRemoveAvatar(false);
    }
  }, [user]);

  useEffect(() => {
    // Chỉ reset form khi đối tượng user thay đổi (ví dụ: sau khi đăng nhập)
    resetFormData();
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (file) => {
    setAvatarFile(file);
    setWantsToRemoveAvatar(false);
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    } else {
      setAvatarPreview("");
      setWantsToRemoveAvatar(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    resetFormData();
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (formData.dateOfBirth) {
      const selectedDate = new Date(formData.dateOfBirth);
      const today = new Date();
      selectedDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      if (selectedDate > today) {
        toast.error("Ngày sinh không được ở trong tương lai.");
        return;
      }
    }
    setProfileLoading(true);

    const dataToSubmit = {
      displayName: formData.displayName,
      phoneNumber: formData.phoneNumber || null,
      dateOfBirth: formData.dateOfBirth || null,
      gender: formData.gender || null,
      removeAvatar: wantsToRemoveAvatar,
    };

    try {
      const response = await authService.updateProfile(
        dataToSubmit,
        avatarFile
      );
      updateUserContext(response.data);
      toast.success("Cập nhật thông tin thành công!");
      setIsEditing(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại."
      );
      resetFormData();
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Thông tin cá nhân</h1>
        <p className={`mt-2 ${currentTheme.textSecondary}`}>
          Quản lý thông tin công khai và chi tiết liên hệ của bạn.
        </p>
      </div>

      <SettingsCard
        title="Thông tin hiển thị"
        description="Cập nhật thông tin sẽ được hiển thị cho người khác."
      >
        <form onSubmit={handleProfileSubmit} className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-32 h-32 flex-shrink-0">
              {isEditing ? (
                <FileUpload
                  onFileChange={handleFileChange}
                  existingFileUrl={avatarPreview}
                  previewType="image"
                  className="w-full h-full"
                  accept="image/*"
                />
              ) : (
                <Avatar user={user} className="w-32 h-32 rounded-lg" />
              )}
            </div>
            <div className="w-full space-y-4">
              <Input
                label="Tên hiển thị "
                icon={User}
                name="displayName"
                value={formData.displayName}
                onChange={handleProfileChange}
                disabled={!isEditing}
                required
              />
              <Input
                label="Email"
                icon={Mail}
                name="email"
                value={user?.email || ""}
                disabled
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Số điện thoại"
              icon={Phone}
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleProfileChange}
              disabled={!isEditing}
              placeholder="Chưa cập nhật"
            />
            <Input
              label="Ngày sinh"
              icon={Calendar}
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleProfileChange}
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Giới tính</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleProfileChange}
              disabled={!isEditing}
              className={`w-full p-2 border rounded-lg ${currentTheme.bg} ${currentTheme.border} focus:border-music-500 focus:ring-music-500 disabled:opacity-50`}
            >
              <option value="">Không muốn tiết lộ</option>
              <option value="Male">Nam</option>
              <option value="Female">Nữ</option>
              <option value="Other">Khác</option>
            </select>
          </div>
          {isEditing && (
            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button
                type="button"
                variant="ghost"
                onClick={handleCancelEdit}
                disabled={profileLoading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={profileLoading}>
                {profileLoading ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          )}
          {!isEditing && (
            <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button onClick={() => setIsEditing(true)}>
                Chỉnh sửa thông tin
              </Button>
            </div>
          )}
        </form>
      </SettingsCard>
    </div>
  );
};

export default Profile;
