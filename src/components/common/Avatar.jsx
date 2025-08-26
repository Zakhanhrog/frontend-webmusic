import React from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://api.muzo.com.vn";

const Avatar = ({ user, className = "w-8 h-8" }) => {
  if (!user || !user.displayName) return null;

  // Mã hóa tên để xử lý các ký tự đặc biệt trong URL
  const encodedName = encodeURIComponent(user.displayName);

  // URL avatar mặc định sử dụng ui-avatars.com
  // Thêm &color=fff&bold=true để chữ luôn màu trắng và in đậm
  const defaultAvatarUrl = `https://ui-avatars.com/api/?name=${encodedName}&background=random&color=fff&bold=true`;

  let finalImageUrl = defaultAvatarUrl;

  if (user.avatarPath) {
    // Kiểm tra xem avatarPath là link đầy đủ (từ Google) hay link tương đối (từ server mình)
    const isExternalUrl = user.avatarPath.startsWith("http");
    finalImageUrl = isExternalUrl
      ? user.avatarPath
      : `${API_BASE_URL}${user.avatarPath}`;
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 bg-slate-700 ${className}`}
    >
      <img
        src={finalImageUrl}
        alt={user.displayName}
        className="w-full h-full object-cover"
        // Xử lý trường hợp link ảnh thật bị lỗi, sẽ tự động chuyển về ảnh mặc định
        onError={(e) => {
          if (e.target.src !== defaultAvatarUrl) {
            e.target.onerror = null; // Ngăn vòng lặp vô hạn nếu link mặc định cũng lỗi
            e.target.src = defaultAvatarUrl;
          }
        }}
      />
    </div>
  );
};

export default Avatar;
