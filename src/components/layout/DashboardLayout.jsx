import React, { useState, useEffect, useRef } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useDarkMode } from "../../hooks/useDarkMode";
import { useAuth } from "../../hooks/useAuth";
import { useAudio } from "../../hooks/useAudio";
import CommandPalette from "./CommandPalette";
import PlayerSidebar from "./PlayerSidebar";
import Button from "../common/Button";
import ConfirmationModal from "../common/ConfirmationModal";
import {
  Music,
  Home,
  Search,
  Library,
  BarChart3,
  Users as AdminIcon,
  Mic2,
  ListMusic as SongIcon,
  CheckSquare,
  Crown,
  Upload,
  LogOut,
  Sun,
  Moon,
  User,
  Settings,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Briefcase,
  KeyRound,
  ChevronDown,
  BookOpen,
  Tags,
  History,
  Bell,
  ChevronsLeft,
} from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";
import { useNotifications } from "../../hooks/useNotifications";
import Avatar from "../common/Avatar";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "https://api.muzo.com.vn";

const NavbarProgressBar = ({ currentSong, currentTime, duration, isPlaying, onSeek }) => {
  const { isDarkMode } = useDarkMode();
  const progressBarRef = useRef(null);

  const handleSeek = (e) => {
    if (!progressBarRef.current || !duration || !onSeek) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * duration;
    onSeek(newTime);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!currentSong) return null;

  return (
      <div className="absolute bottom-0 left-0 right-0 h-1 group">
        <div
            ref={progressBarRef}
            onClick={handleSeek}
            className={`w-full h-full cursor-pointer ${
                isDarkMode ? 'bg-slate-800/50' : 'bg-slate-200/50'
            } group-hover:h-1.5 transition-all duration-200`}
        >
          <div
              className={`h-full transition-all duration-200 ${
                  isPlaying
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600'
                      : isDarkMode
                          ? 'bg-slate-600'
                          : 'bg-slate-400'
              }`}
              style={{ width: `${progress}%` }}
          />
          <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none"
              style={{ left: `${progress}%`, transform: 'translateX(-50%) translateY(-50%)' }}
          />
        </div>
        <div className={`absolute bottom-full left-0 right-0 mb-2 px-4 py-2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none backdrop-blur-lg rounded-t-lg ${
            isDarkMode ? 'bg-slate-900/90 border-slate-700/50' : 'bg-white/90 border-slate-200/50'
        } border-t border-l border-r`}>
          <div className="flex items-center gap-3">
            <img
                src={`${import.meta.env.VITE_API_BASE_URL || 'https://api.muzo.com.vn'}${currentSong.thumbnailPath}`}
                alt={currentSong.title}
                className="w-8 h-8 rounded object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{currentSong.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {currentSong.singers?.map(s => s.name).join(', ')}
              </p>
            </div>
            <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
        </div>
      </div>
  );

  function formatTime(time) {
    if (isNaN(time) || time === 0) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
};

const NavbarLyricsDisplay = ({ lyrics, currentTime, isVisible }) => {
  const { isDarkMode } = useDarkMode();
  const [activeLineIndex, setActiveLineIndex] = useState(-1);
  const [displayedLine, setDisplayedLine] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!lyrics || lyrics.length === 0 || !isVisible) {
      setActiveLineIndex(-1);
      setDisplayedLine("");
      return;
    }

    let newActiveIndex = -1;
    for (let i = lyrics.length - 1; i >= 0; i--) {
      if (currentTime >= lyrics[i].time) {
        newActiveIndex = i;
        break;
      }
    }

    if (newActiveIndex !== activeLineIndex && newActiveIndex >= 0) {
      setIsAnimating(true);
      setActiveLineIndex(newActiveIndex);

      setTimeout(() => {
        setDisplayedLine(lyrics[newActiveIndex]?.text || "");
        setIsAnimating(false);
      }, 100);
    } else if (newActiveIndex < 0) {
      setDisplayedLine("");
      setActiveLineIndex(-1);
    }
  }, [currentTime, lyrics, isVisible, activeLineIndex]);

  if (!isVisible || !displayedLine) {
    return null;
  }

  return (
      <div className="flex items-center justify-center pointer-events-none min-h-[20px]">
        <p
            className={`
          text-sm font-medium text-center max-w-xs lg:max-w-sm truncate transition-all duration-300 ease-out
          ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'}
          ${isAnimating
                ? 'transform translate-y-1 opacity-0 scale-95'
                : 'transform translate-y-0 opacity-100 scale-100'
            }
        `}
            style={{
              animation: isAnimating ? 'none' : 'slideUp 0.3s ease-out',
            }}
        >
          {displayedLine}
        </p>
      </div>
  );
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const AppHeader = ({ onOpenPalette, isPlayerVisible, onConfirmLogout }) => {
  const { toggleDarkMode, isDarkMode } = useDarkMode();
  const { user, isPremium, isAdmin, isCreator } = useAuth();
  const {
    currentSong,
    isPlaying,
    isRepeat,
    isShuffle,
    togglePlay,
    playNext,
    playPrevious,
    toggleRepeat,
    toggleShuffle,
    lyrics,
    currentTime,
    duration,
    seekTo,
  } = useAudio();
  const location = useLocation();

  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const avatarMenuRef = useRef(null);

  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    pageInfo,
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useNotifications();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
          avatarMenuRef.current &&
          !avatarMenuRef.current.contains(event.target)
      ) {
        setIsAvatarMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotifToggle = () => {
    const shouldOpen = !isNotifOpen;
    setIsNotifOpen(shouldOpen);
    if (shouldOpen) {
      fetchNotifications(0);
    }
  };

  const mainNavItems = [
    { href: "/", icon: Home, label: "Trang chủ" },
    { href: "/my-playlists", icon: Library, label: "Thư viện" },
    { href: "/charts", icon: BarChart3, label: "Bảng xếp hạng" },
    { type: "button", action: onOpenPalette, icon: Search, label: "Tìm kiếm" },
  ];

  const userMenuItems = [
    { href: "/profile", icon: User, label: "Cập nhật thông tin" },
    {
      href: "/profile/transactions",
      icon: History,
      label: "Lịch sử giao dịch",
    },
  ];
  if (user && user.provider !== "google") {
    userMenuItems.push({
      href: "/profile/change-password",
      icon: KeyRound,
      label: "Đổi mật khẩu",
    });
  }

  const creatorMenuItems = [
    { href: "/creator/my-library", icon: BookOpen, label: "Thư viện bài hát" },
    {
      href: "/creator/my-submissions",
      icon: SongIcon,
      label: "Quản lý yêu cầu",
    },
    { href: "/creator/submission/new", icon: Upload, label: "Tải lên bài hát" },
  ];

  const adminMenuItems = [
    { href: "/admin/users", icon: AdminIcon, label: "Quản lý người dùng" },
    { href: "/admin/creators", icon: Briefcase, label: "Quản lý NPT" },
    { href: "/admin/songs", icon: Music, label: "Quản lý bài hát" },
    { href: "/admin/singers", icon: Mic2, label: "Quản lý ca sĩ" },
    { href: "/admin/tags", icon: Tags, label: "Quản lý Tags" },
    { href: "/admin/submissions", icon: CheckSquare, label: "Duyệt bài hát" },
  ];

  const MenuLink = ({ to, icon: Icon, label, onClick }) => (
      <Link
          to={to}
          onClick={onClick}
          className="flex items-center w-full px-3 py-2 text-sm rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50"
      >
        <Icon className="w-4 h-4 mr-3" />
        <span>{label}</span>
      </Link>
  );

  return (
      <header
          className={`sticky top-0 z-40 w-full backdrop-blur-lg bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-700/80`}
      >
        <div className="relative px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Link to="/" className="group flex items-center p-2 rounded-lg">
              <div className="relative w-10 h-10 transition-all duration-300 ease-in-out group-hover:w-[105px]">
                <div className="absolute inset-0 flex items-center transition-all duration-300 ease-in-out">
                  <img
                      src="/logo/M.png"
                      alt="M"
                      className="h-[28px] w-auto object-contain transition-all duration-300 ease-in-out"
                  />
                  <img
                      src="/logo/uzo.png"
                      alt="uzo"
                      className="h-[28px] w-auto object-contain transition-all duration-300 ease-in-out transform -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                  />
                </div>
              </div>
            </Link>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 ml-2"></div>
            <nav className="hidden md:flex items-center gap-1 pl-2">
              {mainNavItems.map((item) => {
                const isActive = item.href && location.pathname === item.href;
                const commonContent = (
                    <>
                      <div
                          className={`p-2 rounded-lg transition-colors ${
                              isActive
                                  ? "bg-black/10 dark:bg-white/10 text-slate-800 dark:text-white"
                                  : "text-slate-500 dark:text-slate-400 group-hover:bg-black/5 dark:group-hover:bg-white/5 group-hover:text-slate-800 dark:group-hover:text-white"
                          }`}
                      >
                        <item.icon size={22} />
                      </div>
                      <span
                          className={`whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out text-slate-800 dark:text-white max-w-0 ml-0 opacity-0 group-hover:max-w-xs group-hover:ml-2 group-hover:opacity-100`}
                      >
                    {item.label}
                  </span>
                    </>
                );
                return item.type === "button" ? (
                    <button
                        key={item.label}
                        onClick={item.action}
                        className="group flex items-center p-2 rounded-lg text-sm font-semibold"
                    >
                      {commonContent}
                    </button>
                ) : (
                    <Link
                        key={item.label}
                        to={item.href}
                        className="group flex items-center p-2 rounded-lg text-sm font-semibold"
                    >
                      {commonContent}
                    </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className={`transition-all duration-300 ease-in-out ${
                user && (isPremium() || isAdmin() || isCreator()) && !isPlayerVisible && currentSong && lyrics && lyrics.length > 0
                    ? "opacity-100 max-w-xs"
                    : "opacity-0 max-w-0"
            } overflow-hidden`}>
              {user && (isPremium() || isAdmin() || isCreator()) && (
                  <NavbarLyricsDisplay
                      lyrics={lyrics}
                      currentTime={currentTime}
                      isVisible={!isPlayerVisible && currentSong && lyrics && lyrics.length > 0}
                  />
              )}
            </div>

            <div
                className={`flex items-center gap-3 transition-all duration-300 ease-in-out ${
                    !isPlayerVisible && currentSong
                        ? "max-w-md opacity-100"
                        : "max-w-0 opacity-0"
                } overflow-hidden`}
            >
              {currentSong && (
                  <>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`!w-9 !h-9 ${
                            isShuffle
                                ? isDarkMode
                                    ? "text-cyan-400"
                                    : "text-blue-600"
                                : isDarkMode
                                    ? "text-slate-400"
                                    : "text-slate-500"
                        }`}
                        onClick={toggleShuffle}
                    >
                      <Shuffle size={18} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="!w-9 !h-9"
                        onClick={playPrevious}
                    >
                      <SkipBack size={18} />
                    </Button>
                    <Button
                        size="icon"
                        className="!w-10 !h-10 bg-cyan-500 text-white"
                        onClick={togglePlay}
                    >
                      {isPlaying ? (
                          <Pause size={20} />
                      ) : (
                          <Play size={20} className="ml-0.5" />
                      )}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="!w-9 !h-9"
                        onClick={playNext}
                    >
                      <SkipForward size={18} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`!w-9 !h-9 ${
                            isRepeat
                                ? isDarkMode
                                    ? "text-cyan-400"
                                    : "text-blue-600"
                                : isDarkMode
                                    ? "text-slate-400"
                                    : "text-slate-500"
                        }`}
                        onClick={toggleRepeat}
                    >
                      {isRepeat ? <Repeat1 size={18} /> : <Repeat size={18} />}
                    </Button>
                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                    <img
                        src={`${API_BASE_URL}${currentSong.thumbnailPath}`}
                        alt={currentSong.title}
                        className="w-10 h-10 rounded-md object-cover hidden md:block"
                    />
                    <div className="hidden lg:block min-w-0">
                      <p className="font-semibold truncate">{currentSong.title}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                        {currentSong.singers.map((s) => s.name).join(", ")}
                      </p>
                    </div>
                  </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {user ? (
                  <>
                    {!isPremium() && (
                        <Link to="/premium">
                          <button className="hidden lg:inline-flex relative group items-center justify-center h-10 px-4 font-medium text-sm text-white rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 flex-shrink-0 whitespace-nowrap min-w-max">
                            <div className="absolute -inset-px rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 opacity-50 group-hover:opacity-75 transition-opacity"></div>
                            <span className="relative flex items-center gap-2">
                        Nâng cấp tài khoản
                      </span>
                          </button>
                        </Link>
                    )}

                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-full text-slate-500 hover:bg-black/5 dark:text-slate-400 dark:hover:bg-white/10 transition-colors"
                    >
                      {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    <div className="relative" ref={notifRef}>
                      <button
                          onClick={handleNotifToggle}
                          className="relative p-2 rounded-full text-slate-500 hover:bg-black/5 dark:text-slate-400 dark:hover:bg-white/10 transition-colors"
                      >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                        )}
                      </button>
                      {isNotifOpen && (
                          <NotificationDropdown
                              notifications={notifications}
                              loading={notificationsLoading}
                              onClose={() => setIsNotifOpen(false)}
                              onMarkAsRead={markNotificationAsRead}
                              onMarkAllAsRead={markAllNotificationsAsRead}
                              onLoadMore={() => fetchNotifications(pageInfo.page + 1)}
                              hasMore={pageInfo.page + 1 < pageInfo.totalPages}
                              unreadCount={unreadCount}
                          />
                      )}
                    </div>

                    <div className="relative" ref={avatarMenuRef}>
                      <button
                          onClick={() => setIsAvatarMenuOpen((prev) => !prev)}
                          className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                      >
                        <div className="relative">
                          <div
                              className={`${
                                  isPremium()
                                      ? "ring-2 ring-offset-1 ring-amber-400 dark:ring-offset-slate-900 rounded-full"
                                      : ""
                              }`}
                          >
                            <Avatar user={user} className="w-8 h-8" />
                          </div>
                          {isPremium() && (
                              <div className="absolute -bottom-1 -right-1 bg-amber-400 rounded-full p-0.5 border border-white dark:border-slate-800">
                                <Crown
                                    size={10}
                                    className="text-white"
                                    fill="currentColor"
                                />
                              </div>
                          )}
                        </div>
                        <ChevronDown
                            size={16}
                            className={`transition-transform ${
                                isAvatarMenuOpen ? "rotate-180" : ""
                            }`}
                        />
                      </button>

                      {isAvatarMenuOpen && (
                          <div className="absolute top-full right-0 mt-2 w-72 p-2 rounded-xl shadow-lg border backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 border-slate-200/50 dark:border-slate-700/50">
                            <div className="flex items-start gap-3 p-2 mb-2">
                              <Avatar user={user} className="w-12 h-12" />
                              <div className="min-w-0 flex-grow">
                                <p className="font-semibold truncate text-slate-800 dark:text-slate-100">
                                  {user.displayName}
                                </p>
                                <p className="text-sm truncate text-slate-500 dark:text-slate-400">
                                  {user.email}
                                </p>
                                {isPremium() && user.subscriptionEndDate && (
                                    <div className="mt-1.5">
                                      <div>
                                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400">
                                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                          Premium
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                          Hết hạn:{" "}
                                          {formatDate(user.subscriptionEndDate)}
                                        </p>
                                      </div>
                                    </div>
                                )}
                              </div>
                            </div>

                            <hr className="my-1 border-slate-200 dark:border-slate-700" />

                            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-3 py-2">
                              Tài khoản
                            </div>
                            {userMenuItems.map((item) => (
                                <MenuLink
                                    key={item.label}
                                    to={item.href}
                                    icon={item.icon}
                                    label={item.label}
                                    onClick={() => setIsAvatarMenuOpen(false)}
                                />
                            ))}

                            {isCreator() && (
                                <>
                                  <hr className="my-1 border-slate-200 dark:border-slate-700" />
                                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-3 py-2">
                                    Công cụ Creator
                                  </div>
                                  {creatorMenuItems.map((item) => (
                                      <MenuLink
                                          key={item.label}
                                          to={item.href}
                                          icon={item.icon}
                                          label={item.label}
                                          onClick={() => setIsAvatarMenuOpen(false)}
                                      />
                                  ))}
                                </>
                            )}

                            {isAdmin() && (
                                <>
                                  <hr className="my-1 border-slate-200 dark:border-slate-700" />
                                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-3 py-2">
                                    Quản trị viên
                                  </div>
                                  {adminMenuItems.map((item) => (
                                      <MenuLink
                                          key={item.label}
                                          to={item.href}
                                          icon={item.icon}
                                          label={item.label}
                                          onClick={() => setIsAvatarMenuOpen(false)}
                                      />
                                  ))}
                                </>
                            )}

                            <hr className="my-1 border-slate-200 dark:border-slate-700" />

                            <button
                                onClick={() => {
                                  setIsAvatarMenuOpen(false);
                                  onConfirmLogout();
                                }}
                                className="flex items-center w-full px-3 py-2 text-sm rounded-md text-red-600 dark:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/20"
                            >
                              <LogOut className="w-4 h-4 mr-3" />
                              <span>Đăng xuất</span>
                            </button>
                          </div>
                      )}
                    </div>
                  </>
              ) : (
                  <div className="flex items-center gap-2">
                    <Link to="/register">
                      <Button variant="outline" size="md">
                        Đăng ký
                      </Button>
                    </Link>
                    <Link to="/login">
                      <Button size="md">Đăng nhập</Button>
                    </Link>
                  </div>
              )}
            </div>
          </div>
        </div>

        {!isPlayerVisible && currentSong && (
            <NavbarProgressBar
                currentSong={currentSong}
                currentTime={currentTime}
                duration={duration}
                isPlaying={isPlaying}
                onSeek={seekTo}
            />
        )}
      </header>
  );
};

const DashboardLayout = () => {
  const { currentTheme, isDarkMode } = useDarkMode();
  const { user, logout, isAdmin, isCreator, isPremium } = useAuth();
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isPlayerCollapsed, setIsPlayerCollapsed] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleTogglePlayer = () => {
    setIsPlayerCollapsed((prevState) => !prevState);
  };

  const handleLogout = () => {
    logout();
    setIsLogoutModalOpen(false);
    navigate("/login");
  };

  const cmdMainNavItems = [
    { name: "Trang chủ", href: "/", icon: Home, category: "Menu" },
    {
      name: "Tìm kiếm",
      href: "#",
      icon: Search,
      category: "Menu",
      action: () => setIsPaletteOpen(true),
    },
    {
      name: "Thư viện",
      href: "/my-playlists",
      icon: Library,
      category: "Menu",
    },
  ];
  const cmdCreatorNavItems = [
    {
      name: "Tải lên bài hát",
      href: "/creator/submission/new",
      icon: Upload,
      category: "Creator",
    },
    {
      name: "Yêu cầu của tôi",
      href: "/creator/my-submissions",
      icon: SongIcon,
      category: "Creator",
    },
    {
      name: "Bảng điều khiển Creator",
      href: "/creator",
      icon: Settings,
      category: "Creator",
    },
  ];
  const cmdAdminNavItems = [
    {
      name: "Quản lý người dùng",
      href: "/admin/users",
      icon: AdminIcon,
      category: "Admin",
    },
    {
      name: "Quản lý NPT",
      href: "/admin/creators",
      icon: Briefcase,
      category: "Admin",
    },
    {
      name: "Quản lý ca sĩ",
      href: "/admin/singers",
      icon: Mic2,
      category: "Admin",
    },
    {
      name: "Quản lý bài hát",
      href: "/admin/songs",
      icon: SongIcon,
      category: "Admin",
    },
    {
      name: "Quản lý Tags",
      href: "/admin/tags",
      icon: Tags,
      category: "Admin",
    },
    {
      name: "Duyệt bài hát",
      href: "/admin/submissions",
      icon: CheckSquare,
      category: "Admin",
    },
  ];
  const cmdUserNavItems = [
    {
      name: "Thông tin cá nhân",
      href: "/profile",
      icon: User,
      category: "Tài khoản",
    },
    {
      name: "Lịch sử giao dịch",
      href: "/profile/transactions",
      icon: History,
      category: "Tài khoản",
    },
    {
      name: "Đăng xuất",
      href: "#",
      icon: LogOut,
      category: "Tài khoản",
      action: () => setIsLogoutModalOpen(true),
    },
  ];
  const cmdPremiumNavItem = {
    name: "Nâng cấp Premium",
    href: "/premium",
    icon: Crown,
    category: "Tài khoản",
  };

  const navigationCommands = [
    ...cmdMainNavItems,
    ...(user && isCreator() ? cmdCreatorNavItems : []),
    ...(user && isAdmin() ? cmdAdminNavItems : []),
    ...(user ? cmdUserNavItems : []),
    ...(user && !isPremium() ? [cmdPremiumNavItem] : []),
  ];

  return (
      <div
          className={`flex flex-col h-screen ${currentTheme.bg} ${currentTheme.text} font-sans`}
      >
        <AppHeader
            onOpenPalette={() => setIsPaletteOpen(true)}
            isPlayerVisible={!isPlayerCollapsed}
            onConfirmLogout={() => setIsLogoutModalOpen(true)}
        />
        <div className="relative flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:px-8 transition-all duration-300 ease-in-out">
            <Outlet />
          </main>
          <PlayerSidebar
              isCollapsed={isPlayerCollapsed}
              onToggle={handleTogglePlayer}
          />
          {isPlayerCollapsed && (
              <button
                  onClick={handleTogglePlayer}
                  className={`absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 z-20 w-8 h-16 flex items-center justify-center backdrop-blur-md rounded-lg transition-all duration-200 ${
                      isDarkMode
                          ? "bg-gray-800/50 hover:bg-gray-700/70 border border-white/10 text-slate-300 hover:text-white"
                          : "bg-slate-200/50 hover:bg-slate-300/70 border border-black/10 text-slate-600 hover:text-black"
                  }`}
                  aria-label="Mở trình phát nhạc"
              >
                <ChevronsLeft size={20} />
              </button>
          )}
        </div>
        <CommandPalette
            isOpen={isPaletteOpen}
            onClose={() => setIsPaletteOpen(false)}
            navigationCommands={navigationCommands}
        />
        <ConfirmationModal
            isOpen={isLogoutModalOpen}
            onClose={() => setIsLogoutModalOpen(false)}
            onConfirm={handleLogout}
            title="Xác nhận Đăng xuất"
            message="Bạn có chắc chắn muốn đăng xuất khỏi tài khoản của mình không?"
            confirmText="Đăng xuất"
            cancelText="Hủy"
            variant="danger"
        />
      </div>
  );
};

export default DashboardLayout;