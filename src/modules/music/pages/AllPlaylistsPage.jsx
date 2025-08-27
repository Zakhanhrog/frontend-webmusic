import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { musicService } from '../services/musicService';
import PlaylistCard from '../../../components/music/PlaylistCard';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { useAudio } from '../../../hooks/useAudio';
import { toast } from 'react-toastify';
import { Loader2, Search, LayoutGrid, List, Music, Play } from 'lucide-react';
import { useDarkMode } from '../../../hooks/useDarkMode';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.muzo.com.vn';

const PlaylistListItem = ({ playlist, onPlay }) => {
    const { isDarkMode } = useDarkMode();
    
    return (
        <div className="group flex items-center gap-4 p-4 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors duration-200">
            {/* Thumbnail */}
            <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                {playlist.thumbnailPath ? (
                    <img 
                        src={`${API_BASE_URL}${playlist.thumbnailPath}`} 
                        alt={playlist.name} 
                        className="w-full h-full object-cover" 
                    />
                ) : (
                    <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        <Music className="w-8 h-8 text-slate-400" />
                    </div>
                )}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onPlay(playlist)}
                        className="w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full text-white"
                    >
                        <Play size={18} className="ml-0.5" />
                    </Button>
                </div>
            </div>

            {/* Playlist Info */}
            <div className="flex-1 min-w-0">
                <Link 
                    to={`/playlist/${playlist.id}`}
                    className="font-semibold text-slate-800 dark:text-slate-100 truncate hover:underline block"
                >
                    {playlist.name}
                </Link>
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                    Tạo bởi {playlist.creatorName}
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span>{playlist.songCount} bài hát</span>
                    {playlist.visibility !== 'PRIVATE' && (
                        <>
                            <span>• {playlist.listenCount?.toLocaleString('vi-VN') || 0} lượt nghe</span>
                            <span>• {playlist.likeCount?.toLocaleString('vi-VN') || 0} lượt thích</span>
                        </>
                    )}
                </div>
            </div>

            {/* Created Date */}
            <div className="hidden md:block text-sm text-slate-500 dark:text-slate-400">
                {new Date(playlist.createdAt).toLocaleDateString('vi-VN')}
            </div>
        </div>
    );
};

const SkeletonList = ({ count = 10 }) => (
    <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="animate-pulse flex items-center gap-4 p-4">
                <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
                </div>
                <div className="w-20 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
            </div>
        ))}
    </div>
);

const SkeletonGrid = ({ count = 10 }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="animate-pulse">
                <div className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                <div className="h-4 mt-2 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                <div className="h-3 mt-1 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
            </div>
        ))}
    </div>
);

const AllPlaylistsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const category = searchParams.get('category') || 'top-listened';
    const { playPlaylist } = useAudio();
    
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list' hoặc 'grid'
    const [pageInfo, setPageInfo] = useState({
        page: 0,
        size: 20,
        totalPages: 0,
        totalElements: 0
    });

    useEffect(() => {
        fetchPlaylists();
    }, [category, pageInfo.page, searchTerm]);

    const fetchPlaylists = async () => {
        setLoading(true);
        try {
            let response;
            
            switch (category) {
                case 'top-listened':
                    response = await musicService.getTopListenedPlaylists(pageInfo.size * (pageInfo.page + 1));
                    break;
                case 'most-liked':
                    response = await musicService.getMostLikedPlaylists(pageInfo.size * (pageInfo.page + 1));
                    break;
                case 'recent':
                    response = await musicService.getRecentPlaylists(pageInfo.size * (pageInfo.page + 1));
                    break;
                default:
                    response = await musicService.searchPlaylists(searchTerm, pageInfo.page, pageInfo.size);
            }

            if (response.success) {
                if (response.data.content) {
                    // Response có phân trang - Filter out admin-hidden playlists
                    const visiblePlaylists = response.data.content?.filter(playlist => 
                        playlist.visibility === 'PUBLIC'
                    ) || [];
                    setPlaylists(visiblePlaylists);
                    setPageInfo(prev => ({
                        ...prev,
                        totalPages: response.data.pageInfo?.totalPages || 1,
                        totalElements: response.data.pageInfo?.totalElements || visiblePlaylists.length
                    }));
                } else {
                    // Response không có phân trang (mảng đơn giản) - Filter out admin-hidden playlists
                    const visiblePlaylists = response.data?.filter(playlist => 
                        playlist.visibility === 'PUBLIC'
                    ) || [];
                    setPlaylists(visiblePlaylists);
                    setPageInfo(prev => ({
                        ...prev,
                        totalPages: 1,
                        totalElements: visiblePlaylists.length
                    }));
                }
            } else {
                toast.error(response.message || 'Không thể tải danh sách playlist');
                setPlaylists([]);
            }
        } catch (error) {
            console.error('Failed to fetch playlists:', error);
            toast.error('Có lỗi xảy ra khi tải danh sách playlist');
            setPlaylists([]);
        } finally {
            setLoading(false);
        }
    };

    const handlePlayPlaylist = async (playlist) => {
        try {
            const response = await musicService.getPlaylistDetails(playlist.id);
            if (response.success && response.data.songs && response.data.songs.length > 0) {
                playPlaylist(response.data);
            } else {
                toast.info("Playlist này không có bài hát nào để phát.");
            }
        } catch (error) {
            console.error("Failed to play playlist:", error);
            toast.error('Không thể phát playlist này.');
        }
    };

    const handleCategoryChange = (newCategory) => {
        setSearchParams({ category: newCategory });
        setPageInfo(prev => ({ ...prev, page: 0 }));
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (value.trim()) {
            setSearchParams({ category: 'search', q: value });
        } else {
            setSearchParams({ category: 'top-listened' });
        }
        setPageInfo(prev => ({ ...prev, page: 0 }));
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < pageInfo.totalPages) {
            setPageInfo(prev => ({ ...prev, page: newPage }));
        }
    };

    const getCategoryTitle = () => {
        switch (category) {
            case 'top-listened':
                return 'Playlist Nghe Nhiều';
            case 'most-liked':
                return 'Playlist Được Yêu Thích';
            case 'recent':
                return 'Playlist Mới';
            case 'search':
                return `Kết quả tìm kiếm: "${searchTerm}"`;
            default:
                return 'Tất cả Playlist';
        }
    };

    return (
        <div className="space-y-6 p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                    {getCategoryTitle()}
                </h1>
                
                {/* Search và Controls */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="w-full sm:w-96">
                        <Input
                            placeholder="Tìm kiếm playlist..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            icon={<Search size={18} />}
                        />
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {/* Category Buttons */}
                        <div className="flex items-center gap-1 p-1 bg-slate-200 dark:bg-slate-800 rounded-lg">
                            <Button 
                                size="sm" 
                                variant={category === 'top-listened' ? 'solid' : 'ghost'}
                                onClick={() => handleCategoryChange('top-listened')}
                            >
                                Nghe nhiều
                            </Button>
                            <Button 
                                size="sm" 
                                variant={category === 'most-liked' ? 'solid' : 'ghost'}
                                onClick={() => handleCategoryChange('most-liked')}
                            >
                                Yêu thích
                            </Button>
                            <Button 
                                size="sm" 
                                variant={category === 'recent' ? 'solid' : 'ghost'}
                                onClick={() => handleCategoryChange('recent')}
                            >
                                Mới nhất
                            </Button>
                        </div>
                        
                        {/* View Mode Toggle */}
                        <div className="p-1 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center">
                            <Button 
                                size="icon" 
                                variant={viewMode === 'list' ? 'solid' : 'ghost'} 
                                onClick={() => setViewMode('list')}
                            >
                                <List size={18} />
                            </Button>
                            <Button 
                                size="icon" 
                                variant={viewMode === 'grid' ? 'solid' : 'ghost'} 
                                onClick={() => setViewMode('grid')}
                            >
                                <LayoutGrid size={18} />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                viewMode === 'list' ? <SkeletonList /> : <SkeletonGrid />
            ) : playlists.length > 0 ? (
                <>
                    {viewMode === 'list' ? (
                        <div className="space-y-2">
                            {playlists.map((playlist) => (
                                <PlaylistListItem 
                                    key={playlist.id} 
                                    playlist={playlist}
                                    onPlay={handlePlayPlaylist}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {playlists.map((playlist) => (
                                <PlaylistCard 
                                    key={playlist.id} 
                                    playlist={playlist}
                                />
                            ))}
                        </div>
                    )}
                    
                    {/* Pagination */}
                    {pageInfo.totalPages > 1 && (
                        <div className="flex items-center justify-between mt-8">
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                                Hiển thị {pageInfo.page * pageInfo.size + 1} - {Math.min((pageInfo.page + 1) * pageInfo.size, pageInfo.totalElements)} trên {pageInfo.totalElements} playlist
                            </span>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => handlePageChange(pageInfo.page - 1)}
                                    disabled={pageInfo.page === 0}
                                >
                                    Trước
                                </Button>
                                <span className="px-3 py-1 text-sm">
                                    {pageInfo.page + 1} / {pageInfo.totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    onClick={() => handlePageChange(pageInfo.page + 1)}
                                    disabled={pageInfo.page >= pageInfo.totalPages - 1}
                                >
                                    Sau
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-12">
                    <Music className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        Không tìm thấy playlist nào
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400">
                        {searchTerm ? 'Thử tìm kiếm với từ khóa khác' : 'Chưa có playlist nào trong danh mục này'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default AllPlaylistsPage;
