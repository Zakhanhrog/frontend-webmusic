import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { musicService } from '../services/musicService';
import SongCard from '../../../components/music/SongCard';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { useAudio } from '../../../hooks/useAudio';
import { toast } from 'react-toastify';
import { Search, LayoutGrid, List, Music, Play } from 'lucide-react';
import { useDarkMode } from '../../../hooks/useDarkMode';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.muzo.com.vn';

const SongListItem = ({ song, index, onPlay }) => {
    const { isDarkMode } = useDarkMode();

    return (
        <div className="group flex items-center gap-4 p-4 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors duration-200">
            {/* Index */}
            <div className="w-6 text-center text-sm text-slate-400">
                {index}
            </div>

            {/* Thumbnail */}
            <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                {song.thumbnailPath ? (
                    <img
                        src={`${API_BASE_URL}${song.thumbnailPath}`}
                        alt={song.title}
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
                        onClick={() => onPlay(song)}
                        className="w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full text-white"
                    >
                        <Play size={18} className="ml-0.5" />
                    </Button>
                </div>
            </div>

            {/* Song Info */}
            <div className="flex-1 min-w-0">
                <Link
                    to={`/song/${song.id}`}
                    className="font-semibold text-slate-800 dark:text-slate-100 truncate hover:underline block"
                >
                    {song.title}
                </Link>
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                    {song.singers && song.singers.map(s => s.name).join(', ')}
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span>{song.listenCount?.toLocaleString('vi-VN') || 0} lượt nghe</span>
                    <span>• {song.likeCount?.toLocaleString('vi-VN') || 0} lượt thích</span>
                    {song.duration && (
                        <span>• {Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, '0')}</span>
                    )}
                </div>
            </div>

            {/* Created Date */}
            <div className="hidden md:block text-sm text-slate-500 dark:text-slate-400">
                {new Date(song.createdAt).toLocaleDateString('vi-VN')}
            </div>
        </div>
    );
};

const SkeletonList = ({ count = 10 }) => (
    <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="animate-pulse flex items-center gap-4 p-4">
                <div className="w-6 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
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


const AllSongsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const category = searchParams.get('category') || 'popular';
    const { playSong } = useAudio();

    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
    const [viewMode, setViewMode] = useState('list'); // 'list' hoặc 'grid'
    const [pageInfo, setPageInfo] = useState({
        page: 0,
        size: 20,
        totalPages: 0,
        totalElements: 0
    });

    const fetchSongs = async () => {
        setLoading(true);
        try {
            let response;
            const currentPage = pageInfo.page + 1; // API service uses 1-based page index
            const pageSize = pageInfo.size;

            if (category === 'search' && searchTerm.trim()) {
                response = await musicService.searchSongs(searchTerm, pageInfo.page, pageSize);
            } else {
                switch (category) {
                    case 'popular':
                        response = await musicService.getTopSongsPaginated(currentPage, pageSize);
                        break;
                    case 'most-liked':
                        response = await musicService.getMostLikedSongsPaginated(currentPage, pageSize);
                        break;
                    case 'recent':
                        response = await musicService.getRecentSongsPaginated(currentPage, pageSize);
                        break;
                    default:
                        response = await musicService.getAllSongs(pageInfo.page, pageSize);
                }
            }

            if (response?.success) {
                let songsData = [];
                let totalPagesData = 1;
                let totalElementsData = 0;

                if (response.data) {
                    if (Array.isArray(response.data)) {
                        songsData = response.data;
                        totalPagesData = 1;
                        totalElementsData = response.data.length;
                    } else if (response.data.content) {
                        songsData = response.data.content;
                        totalPagesData = response.data.totalPages || 1;
                        totalElementsData = response.data.totalElements || response.data.content.length;
                    } else if (response.data.songs) {
                        songsData = response.data.songs;
                        totalPagesData = response.data.totalPages || Math.ceil((response.data.total || 0) / pageSize);
                        totalElementsData = response.data.total || response.data.songs.length;
                    }
                }

                setSongs(songsData);
                setPageInfo(prev => ({
                    ...prev,
                    totalPages: totalPagesData,
                    totalElements: totalElementsData
                }));
            } else {
                toast.error(response.message || 'Không thể tải danh sách bài hát');
                setSongs([]);
            }
        } catch (error) {
            console.error('Failed to fetch songs:', error);
            toast.error('Có lỗi xảy ra khi tải danh sách bài hát');
            setSongs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Reset page to 0 when category or search term changes
        setPageInfo(prev => ({ ...prev, page: 0 }));
    }, [category, searchTerm]);

    useEffect(() => {
        fetchSongs();
    }, [category, pageInfo.page]); // Removed searchTerm from here to avoid double fetch


    const handlePlaySong = (song) => {
        playSong(song, songs);
    };

    const handleCategoryChange = (newCategory) => {
        const params = { category: newCategory };
        // If we switch away from search, clear the search term and query param
        if (category === 'search') {
            setSearchTerm('');
        }
        setSearchParams(params);
    };

    const handleSearch = () => {
        const trimmedSearch = searchTerm.trim();
        if (trimmedSearch) {
            setSearchParams({ category: 'search', q: trimmedSearch });
        } else {
            // If search is empty, go back to popular
            setSearchParams({ category: 'popular' });
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    }

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < pageInfo.totalPages) {
            setPageInfo(prev => ({ ...prev, page: newPage }));
        }
    };

    return (
        <div className="space-y-6 p-4 sm:p-6">
            {/* Header */}
            <div className="space-y-4">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                    Tất cả bài hát
                </h1>

                {/* Search và Controls */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="relative w-full sm:w-96">
                        <Input
                            placeholder="Tìm kiếm bài hát..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onKeyDown={handleSearchKeyDown}
                            className="pr-24"
                        />
                        <Button
                            onClick={handleSearch}
                            className="absolute right-2 top-1/2 -translate-y-1/2"
                            size="sm"
                        >
                            Tìm kiếm
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Category Buttons */}
                        <div className="flex items-center gap-1 p-1 bg-slate-200 dark:bg-slate-800 rounded-lg">
                            <Button
                                size="sm"
                                variant={category === 'popular' ? 'solid' : 'ghost'}
                                onClick={() => handleCategoryChange('popular')}
                            >
                                Phổ biến
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
            ) : songs.length > 0 ? (
                <>
                    {viewMode === 'list' ? (
                        <div className="space-y-2">
                            {songs.map((song, index) => (
                                <SongListItem
                                    key={song.id}
                                    song={song}
                                    index={index + 1 + (pageInfo.page * pageInfo.size)}
                                    onPlay={handlePlaySong}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {songs.map((song) => (
                                <SongCard
                                    key={song.id}
                                    song={song}
                                />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {pageInfo.totalPages > 1 && (
                        <div className="flex items-center justify-between mt-8">
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                                Hiển thị {pageInfo.page * pageInfo.size + 1} - {Math.min((pageInfo.page + 1) * pageInfo.size, pageInfo.totalElements)} trên {pageInfo.totalElements} bài hát
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
                        Không tìm thấy bài hát nào
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400">
                        {searchTerm ? 'Thử tìm kiếm với từ khóa khác' : 'Chưa có bài hát nào trong danh mục này'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default AllSongsPage;