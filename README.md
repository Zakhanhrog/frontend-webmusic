# 🎵 Muzo - Music Streaming Platform

Ứng dụng phát nhạc trực tuyến hiện đại được xây dựng với **React 19** và **Vite**, cung cấp trải nghiệm âm nhạc chất lượng cao với giao diện thân thiện và tính năng AI thông minh.

## ✨ Tính năng nổi bật

- 🎧 **Phát nhạc streaming** - Công nghệ zero delay, không gián đoạn
- 🤖 **AI đề xuất thông minh** - Thuật toán học sở thích người dùng  
- 🎨 **Dark/Light Mode** - Giao diện tự động thích ứng
- 👑 **Premium Features** - Chất lượng Hi-Res Audio, Lossless
- 🔐 **Multi-role System** - User, Creator, Admin dashboard
- 📱 **Responsive Design** - Tối ưu cho mọi thiết bị
- 🌐 **Internationalization** - Hỗ trợ đa ngôn ngữ

## 🏗️ Kiến trúc & Tech Stack

### Frontend Technologies
- **React 19.1.0** + **Vite 7.0.4** - Framework hiện đại
- **TailwindCSS 3.4.17** - Utility-first CSS framework
- **React Router DOM 7.7.0** - SPA routing
- **HTML5 Audio API** - Xử lý audio chuyên nghiệp
- **Axios** - HTTP client cho API integration

### Architecture Pattern
```
src/
├── components/     # Shared UI components
├── modules/        # Feature-based modules
│   ├── auth/       # Authentication
│   ├── music/      # Music player & management  
│   ├── admin/      # Admin dashboard
│   ├── creator/    # Creator tools
│   └── premium/    # Subscription features
├── hooks/          # Custom React hooks
├── shared/         # Utilities & services
└── pages/          # Route components
```

## 🚀 Khởi chạy dự án

### Yêu cầu hệ thống
- Node.js 18+
- npm/yarn
- Backend API server

### Cài đặt

```bash
# Clone project
git clone <repository-url>
cd frontend-webmusic

# Install dependencies  
npm install

# Setup environment
cp .env.example .env
# Cấu hình VITE_API_BASE_URL trong .env

# Run development
npm run dev
```

### Scripts

```bash
npm run dev      # Development server (localhost:3000)
npm run build    # Production build
npm run preview  # Preview production build  
npm run lint     # Code linting
```

## 🎯 Key Components

### [`DescriptionBox`](src/modules/music/components/DescriptionBox.jsx)
Component hiển thị mô tả với tính năng expand/collapse thông minh, tự động detect overflow content.

### [`useDarkMode`](src/hooks/useDarkMode.jsx) 
Custom hook quản lý theme switching với localStorage persistence.

### [`LandingPage`](src/components/layout/LandingPage.jsx)
Landing page với gradient design showcasing các tính năng chính.

## 🔧 Tính năng kỹ thuật

- **Modular Architecture** - Tách biệt features theo modules
- **Custom Hooks** - Tái sử dụng logic (useAuth, useAudio, useDarkMode)
- **Theme System** - Dynamic theming với CSS variables
- **Performance Optimized** - Lazy loading, code splitting
- **Responsive UI** - Mobile-first design approach
- **Accessibility** - ARIA compliance, keyboard navigation

## 🎨 UI/UX Features

- Modern gradient backgrounds và smooth transitions
- Card-based layout với hover effects  
- Intelligent content truncation (line-clamp)
- Toast notifications cho user feedback
- Loading states và error handling

---
 
**Backend API:** api.muzo.com.vn  
**Design System:** TailwindCSS + Custom theme variables
**Main Programmer:** Ngô Gia Khánh ( devfromzk )