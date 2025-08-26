import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useDebounce } from '../../hooks/useDebounce';
import { useAudio } from '../../hooks/useAudio';
import { musicService } from '../../modules/music/services/musicService';
import { Search, Music, Loader2, ListMusic as PlaylistIcon, User as SingerIcon } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.muzo.com.vn';

const CommandPalette = ({ isOpen, onClose, navigationCommands }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const [searchResults, setSearchResults] = useState(null);
    const [loading, setLoading] = useState(false);

    const { currentTheme } = useDarkMode();
    const { playSong } = useAudio();
    const navigate = useNavigate();
    const inputRef = useRef(null);
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    useEffect(() => {
        if (isOpen) {
            setSearchTerm('');
            setSearchResults(null);
            setActiveIndex(0);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    useEffect(() => {
        const performSearch = async () => {
            if (debouncedSearchTerm.trim().length < 2) {
                setSearchResults(null);
                setActiveIndex(0);
                return;
            }
            setLoading(true);
            try {
                const [songsRes, singersRes, playlistsRes] = await Promise.all([
                    musicService.searchSongs(debouncedSearchTerm, 0, 3).catch(() => ({ data: { content: [] } })),
                    musicService.searchSingers(debouncedSearchTerm, 0, 3).catch(() => ({ data: { content: [] } })),
                    musicService.searchPlaylists(debouncedSearchTerm, 0, 3).catch(() => ({ data: { content: [] } }))
                ]);

                const searchData = {
                    songs: songsRes.data?.content || [],
                    singers: singersRes.data?.content || [],
                    playlists: playlistsRes.data?.content || [],
                };
                setSearchResults(searchData);
            } catch (error) {
                console.error("Search failed:", error);
                setSearchResults({ songs: [], singers: [], playlists: [] });
            } finally {
                setLoading(false);
                setActiveIndex(0);
            }
        };

        performSearch();
    }, [debouncedSearchTerm]);

    const handleClose = () => onClose();

    const getGroupedItems = () => {
        if (debouncedSearchTerm.length < 2) {
            return [{
                group: 'navigation',
                items: navigationCommands.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
            }];
        }
        if (searchResults) {
            const groups = [];
            if (searchResults.songs.length > 0) {
                groups.push({ group: 'Bài hát', items: searchResults.songs.map(s => ({ ...s, type: 'song', name: s.title })) });
            }
            if (searchResults.singers.length > 0) {
                groups.push({ group: 'Ca sĩ', items: searchResults.singers.map(s => ({ ...s, type: 'singer' })) });
            }
            if (searchResults.playlists.length > 0) {
                groups.push({ group: 'Playlist', items: searchResults.playlists.map(p => ({ ...p, type: 'playlist' })) });
            }
            return groups;
        }
        return [];
    };

    const groupedItems = getGroupedItems();
    const allItems = groupedItems.flatMap(g => g.items);

    const handleAction = (item) => {
        if (!item) return;
        if (item.type === 'song') {
            // Navigate to song detail page instead of auto-playing
            navigate(`/song/${item.id}`);
        } else if (item.type === 'singer') {
            navigate(`/singer/${item.id}`);
        } else if (item.type === 'playlist') {
            navigate(`/playlist/${item.id}`);
        } else if (item.action) {
            item.action();
        } else {
            navigate(item.href);
        }
        handleClose();
    };

    const handleGlobalSearch = () => {
        if (searchTerm.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
            handleClose();
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setActiveIndex(prev => (prev + 1) % allItems.length);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setActiveIndex(prev => (prev - 1 + allItems.length) % allItems.length);
                    break;
                case 'Enter':
                    e.preventDefault();
                    // Always navigate to search results page when pressing Enter
                    // Don't auto-play songs from search results
                    if (searchTerm.trim()) {
                        handleGlobalSearch();
                    } else if (allItems.length > 0 && allItems[activeIndex]) {
                        handleAction(allItems[activeIndex]);
                    }
                    break;
                case 'Escape': handleClose(); break;
                default: break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, activeIndex, allItems, searchTerm]);

    const renderItem = (item, index) => {
        let icon, title, subtitle, typeLabel;

        if (item.type === 'song') {
            icon = <Music className="w-5 h-5 text-slate-500" />;
            title = item.name || 'Unknown Item'; // <<< SỬA LỖI Ở ĐÂY
            subtitle = item.singers?.map(s => s.name).join(', ') || '';
            typeLabel = "Bài hát";
        } else if (item.type === 'singer') {
            title = item.name || 'Unknown Singer';
            typeLabel = "Ca sĩ";
            if (item.avatarPath) {
                icon = <img src={`${API_BASE_URL}${item.avatarPath}`} className="w-8 h-8 rounded-full object-cover" alt={item.name} />;
            } else {
                icon = <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white text-sm font-bold">{item.name?.charAt(0)?.toUpperCase() || <SingerIcon size={16}/>}</div>;
            }
        } else if (item.type === 'playlist') {
            icon = <PlaylistIcon className="w-5 h-5 text-slate-500" />;
            title = item.name || 'Unknown Playlist';
            typeLabel = "Playlist";
        } else { // Navigation items
            const IconComponent = item.icon;
            icon = IconComponent ? <IconComponent className="w-5 h-5 text-slate-500" /> : null;
            title = item.name || 'Unknown Item';
            typeLabel = item.category || 'Menu';
        }

        return (
            <li key={item.id || item.name || `item-${index}`}>
                <button
                    onClick={() => handleAction(item)}
                    className={`flex items-center justify-between p-3 rounded-lg text-sm transition-colors w-full text-left ${currentTheme.text} ${index === activeIndex ? 'bg-black/10 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                >
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">{icon}</div>
                        <div className="min-w-0">
                            <p className="font-medium truncate">{title}</p>
                            {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{subtitle}</p>}
                        </div>
                    </div>
                    {typeLabel && <span className={`text-xs px-2 py-1 rounded-md ${currentTheme.textSecondary} bg-black/5 dark:bg-white/5 flex-shrink-0`}>{typeLabel}</span>}
                </button>
            </li>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/20 backdrop-blur-sm" onClick={handleClose}>
            <div
                className="relative w-full max-w-xl rounded-xl shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center p-4 border-b border-gray-200/70 dark:border-gray-700/70">
                    {loading ? <Loader2 className={`w-5 h-5 mr-3 ${currentTheme.textSecondary} animate-spin`} /> : <Search className={`w-5 h-5 mr-3 ${currentTheme.textSecondary}`} />}
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Tìm kiếm bài hát, ca sĩ, trang..."
                        className={`w-full bg-transparent outline-none ${currentTheme.text} placeholder-gray-500 dark:placeholder-gray-400`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <ul className="p-2 max-h-[400px] overflow-y-auto">
                    {loading ? (
                        <li className="flex justify-center items-center py-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /><span className="ml-2 text-slate-500">Đang tìm kiếm...</span></li>
                    ) : allItems.length > 0 ? (
                        groupedItems.map((group, groupIndex) => (
                            <div key={group.group || groupIndex}>
                                {group.group !== 'navigation' && <h4 className="text-xs font-semibold uppercase text-slate-400 px-3 pt-4 pb-2">{group.group}</h4>}
                                {group.items.map(item => {
                                    const globalIndex = allItems.findIndex(i => (i.id && i.id === item.id && i.type === item.type) || (i.name === item.name && !i.id));
                                    return renderItem(item, globalIndex);
                                })}
                            </div>
                        ))
                    ) : debouncedSearchTerm.length >= 2 ? (
                        <li className={`p-4 text-center ${currentTheme.textSecondary} cursor-pointer`} onClick={handleGlobalSearch}>
                            <div className="mb-2">Không tìm thấy kết quả cho "{searchTerm}"</div><div className="text-xs">Nhấn Enter để tìm kiếm chi tiết hơn</div>
                        </li>
                    ) : (
                        <li className="p-4 text-center text-slate-500">Nhập ít nhất 2 ký tự để tìm kiếm</li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default CommandPalette;