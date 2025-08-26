// frontend-webmusic/src/components/layout/PlayerSidebar.jsx

import React, { useState, useRef, useEffect, useCallback, Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAudio } from '../../hooks/useAudio';
import { useDarkMode } from '../../hooks/useDarkMode';
import Button from '../common/Button';
import {
    Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Star, ChevronsRight,
    Music, Heart, ListMusic, Volume2, Volume1, VolumeX, MoreHorizontal, Mic2, X
} from 'lucide-react';
import { musicService } from '../../modules/music/services/musicService';
import { toast } from 'react-toastify';
import { AddToPlaylistModal } from '../../modules/music/components/AddToPlaylistModal';
import { Menu, Transition } from '@headlessui/react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.muzo.com.vn';

// ============================================================================
// COMPONENT CON: PremiumUpsellCard
// ============================================================================
const PremiumUpsellCard = () => {
    const { isDarkMode } = useDarkMode();
    return (
        <div className="relative p-[1px] rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600">
            <div className={`
                w-full h-full rounded-[11px] p-3 flex items-center space-x-3 backdrop-blur-sm 
                ${isDarkMode ? 'bg-slate-800/80 text-white' : 'bg-white/80 text-slate-800'}
            `}>
                <div className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center bg-gradient-to-br from-cyan-400 to-blue-600">
                    <Star size={20} className="text-white" />
                </div>
                <div className="flex-grow min-w-0">
                    <h4 className="font-bold text-sm truncate">Trải nghiệm Premium</h4>
                    <p className={`text-xs truncate ${isDarkMode ? 'opacity-80' : 'opacity-70'}`}>
                        Không quảng cáo, chất lượng cao nhất.
                    </p>
                </div>
                <Link to="/premium" className="flex-shrink-0 ml-auto">
                    <Button
                        size="sm"
                        className={`
                            !rounded-full backdrop-blur-sm whitespace-nowrap 
                            ${isDarkMode
                            ? '!bg-white/10 hover:!bg-white/20 !text-white'
                            : '!bg-black/5 hover:!bg-black/10 !text-slate-800'
                        }
                        `}
                    >
                        Nâng cấp
                    </Button>
                </Link>
            </div>
        </div>
    );
};

// ============================================================================
// COMPONENT CON: QueueItem
// ============================================================================
const QueueItem = ({ song, isPlayingNow, onPlay, onRemove }) => {
    const { isDarkMode } = useDarkMode();
    const itemClasses = `
        flex items-center p-2 rounded-lg transition-colors 
        ${isPlayingNow
        ? (isDarkMode ? 'bg-white/10' : 'bg-black/5')
        : 'hover:bg-white/5 dark:hover:bg-black/10'
    }
    `;
    const titleClasses = `
        font-semibold truncate 
        ${isPlayingNow
        ? 'text-cyan-400'
        : (isDarkMode ? 'text-white' : 'text-slate-900')
    }
    `;

    return (
        <div className={itemClasses}>
            <div onClick={onPlay} className="flex items-center flex-1 cursor-pointer min-w-0">
                <img
                    src={song.thumbnailPath ? `${API_BASE_URL}${song.thumbnailPath}` : 'https://via.placeholder.com/40'}
                    alt={song.title}
                    className="w-10 h-10 rounded-md object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0 mx-3">
                    <p className={titleClasses}>{song.title}</p>
                    <p className={`text-sm truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        {song.singers.map(s => s.name).join(', ')}
                    </p>
                </div>
            </div>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                }}
                className="flex-shrink-0 p-1 rounded text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors"
                aria-label="Xóa khỏi hàng đợi"
            >
                <X size={16} />
            </button>
        </div>
    );
};

// ============================================================================
// COMPONENT CON: LyricsDisplay
// ============================================================================
const LyricsDisplay = ({ lyrics, currentTime, isCollapsed }) => {
    const { isDarkMode } = useDarkMode();
    const activeLineRef = useRef(null);
    const [activeLineIndex, setActiveLineIndex] = useState(-1);

    useEffect(() => {
        if (!lyrics || lyrics.length === 0) {
            setActiveLineIndex(-1);
            return;
        }
        let newActiveIndex = -1;
        for (let i = lyrics.length - 1; i >= 0; i--) {
            if (currentTime >= lyrics[i].time) {
                newActiveIndex = i;
                break;
            }
        }
        setActiveLineIndex(newActiveIndex);
    }, [currentTime, lyrics]);

    useEffect(() => {
        if (activeLineRef.current && !isCollapsed) {
            activeLineRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [activeLineIndex, isCollapsed]);

    if (!lyrics || lyrics.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <p className="text-slate-400 dark:text-slate-500">Lời bài hát không có sẵn.</p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto space-y-4 text-center pr-2">
            {lyrics.map((line, index) => {
                const isActive = index === activeLineIndex;
                const lineClasses = `
                    transition-all duration-300 text-lg
                    ${isActive
                    ? (isDarkMode ? 'text-white font-bold scale-105' : 'text-slate-900 font-bold scale-105')
                    : (isDarkMode ? 'text-slate-400' : 'text-slate-600')
                }
                `;
                return (
                    <p key={index} ref={isActive ? activeLineRef : null} className={lineClasses}>
                        {line.text}
                    </p>
                );
            })}
        </div>
    );
};

// ============================================================================
// COMPONENT CHÍNH: PlayerSidebar
// ============================================================================
const PlayerSidebar = ({ isCollapsed, onToggle }) => {
    const { user, isAuthenticated, isPremium } = useAuth();
    const { isDarkMode } = useDarkMode();
    const navigate = useNavigate();
    const {
        currentSong, isPlaying, currentTime, duration, bufferedTime, volume, isRepeat, isShuffle, queue, currentIndex, lyrics,
        togglePlay, playNext, playPrevious, seekTo, changeVolume, toggleRepeat, toggleShuffle, formatTime, playSong, removeFromQueue,
    } = useAudio();

    const [isVolumeOpen, setIsVolumeOpen] = useState(false);
    const [isAddToPlaylistModalOpen, setIsAddToPlaylistModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState('queue');
    const [isLiked, setIsLiked] = useState(currentSong?.isLikedByCurrentUser || false);

    const progressBarRef = useRef(null);
    const volumeRef = useRef(null);

    useEffect(() => {
        setIsLiked(currentSong?.isLikedByCurrentUser || false);
    }, [currentSong]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (volumeRef.current && !volumeRef.current.contains(event.target)) {
                setIsVolumeOpen(false);
            }
        };
        if (isVolumeOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isVolumeOpen]);

    const handleToggleLike = useCallback(async () => {
        if (!isAuthenticated) {
            toast.info('Vui lòng đăng nhập để thích bài hát.');
            navigate('/login');
            return;
        }
        if (!currentSong) return;
        try {
            await musicService.toggleSongLike(currentSong.id);
            setIsLiked(prev => !prev);
        } catch (error) {
            toast.error('Có lỗi xảy ra, vui lòng thử lại.');
        }
    }, [currentSong, isAuthenticated, navigate]);

    const handleSeek = (e) => {
        if (!progressBarRef.current || !duration) return;
        const rect = progressBarRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const newTime = (clickX / width) * duration;
        seekTo(newTime);
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
    const bufferProgress = duration > 0 ? (bufferedTime / duration) * 100 : 0;

    const VolumeIcon = () => {
        if (volume === 0) return <VolumeX size={18} />;
        if (volume < 0.5) return <Volume1 size={18} />;
        return <Volume2 size={18} />;
    };

    const shuffleButtonClasses = `
        !rounded-full relative transition-all duration-200
        ${isShuffle
        ? (isDarkMode ? 'text-cyan-400 bg-cyan-400/20 hover:bg-cyan-400/30' : 'text-blue-600 bg-blue-600/20 hover:bg-blue-600/30')
        : (isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-black hover:bg-black/10')
    }
    `;
    const repeatButtonClasses = `
        !rounded-full relative transition-all duration-200
        ${isRepeat
        ? (isDarkMode ? 'text-cyan-400 bg-cyan-400/20 hover:bg-cyan-400/30' : 'text-blue-600 bg-blue-600/20 hover:bg-blue-600/30')
        : (isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-black hover:bg-black/10')
    }
    `;

    return (
        <>
            <aside className={`relative flex-shrink-0 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-0' : 'w-80'}`}>
                <div className={`relative w-80 h-full overflow-hidden transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                    {/* Background mờ */}
                    <div className="absolute inset-0">
                        {currentSong && <img src={`${API_BASE_URL}${currentSong.thumbnailPath}`} alt="Ambient background" className={`w-full h-full object-cover scale-110 filter blur-2xl transition-all duration-500 ${isDarkMode ? 'brightness-[.4]' : 'brightness-100'}`} />}
                        <div className={`absolute inset-0 ${isDarkMode ? 'bg-black/40' : 'bg-white/20'}`}></div>
                    </div>

                    {/* Nội dung chính của Sidebar */}
                    <div className="relative h-full flex flex-col p-4">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-3 flex-shrink-0">
                            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                {viewMode === 'queue' ? 'Danh sách phát' : 'Lời bài hát'}
                            </h3>
                            <div className="flex items-center">
                                {(currentSong || queue.length > 0) && (
                                    <Button variant="ghost" size="icon" className="!w-8 !h-8" onClick={() => setViewMode(v => v === 'queue' ? 'lyrics' : 'queue')}>
                                        {viewMode === 'queue' ? <Mic2 size={18} /> : <ListMusic size={18} />}
                                    </Button>
                                )}
                                <Button onClick={onToggle} variant="ghost" size="icon" className="!w-8 !h-8">
                                    <ChevronsRight size={20} />
                                </Button>
                            </div>
                        </div>

                        {/* Danh sách chờ hoặc Lời bài hát */}
                        <div className="flex-1 flex flex-col min-h-0">
                            {queue.length > 0 ? (
                                <>
                                    {viewMode === 'queue' && (
                                        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
                                            {queue.map((qSong, index) => (
                                                <QueueItem
                                                    key={`${qSong.id}-${index}`}
                                                    song={qSong}
                                                    isPlayingNow={currentIndex === index}
                                                    onPlay={() => playSong(qSong, queue)}
                                                    onRemove={() => removeFromQueue(qSong.id)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    {viewMode === 'lyrics' && (
                                        <LyricsDisplay lyrics={lyrics} currentTime={currentTime} isCollapsed={isCollapsed} />
                                    )}
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500">
                                    <Music className="w-10 h-10 mb-2" />
                                    <p className="font-semibold">Chưa có nhạc</p>
                                    <p className="text-sm">Hãy chọn một bài hát để bắt đầu.</p>
                                </div>
                            )}
                        </div>

                        {/* Khu vực Player */}
                        {(currentSong || queue.length > 0) && (
                            <div className="flex-shrink-0">
                                <div className={`relative mt-4 p-4 backdrop-blur-2xl border rounded-2xl transition-colors duration-300 ${isDarkMode ? 'bg-gray-900/60 border-white/10' : 'bg-slate-50/60 border-black/10'}`}>
                                    {currentSong ? (
                                        <div className="space-y-2">
                                            {/* Song Info */}
                                            <div className="flex items-center gap-3">
                                                <img src={`${API_BASE_URL}${currentSong.thumbnailPath}`} className="w-14 h-14 rounded-md flex-shrink-0 object-cover" />
                                                <div className="flex-1 min-w-0">
                                                    <p className={`font-bold truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{currentSong.title}</p>
                                                    <p className={`text-sm truncate ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{currentSong.singers.map(s => s.name).join(', ')}</p>
                                                </div>
                                                <Button onClick={handleToggleLike} variant="ghost" size="icon" className="!w-9 !h-9 flex-shrink-0 text-slate-500 hover:text-pink-500 dark:text-slate-400 dark:hover:text-pink-400">
                                                    <Heart size={18} className={`${isLiked ? 'fill-pink-500 text-pink-500' : ''}`} />
                                                </Button>
                                            </div>

                                            {/* Player Controls */}
                                            <div className="flex justify-center items-center gap-4">
                                                <Button variant="ghost" size="icon" className={shuffleButtonClasses} onClick={toggleShuffle}><Shuffle size={18} />{isShuffle && <div className="absolute bottom-1 h-1 w-1 bg-current rounded-full"></div>}</Button>
                                                <Button onClick={playPrevious} variant="ghost" size="icon" className={`!rounded-full ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-black'}`} disabled={queue.length <= 1}><SkipBack size={22} /></Button>
                                                <Button onClick={togglePlay} variant="secondary" size="icon" className={`!w-14 !h-14 !rounded-full transition-colors ${isDarkMode ? 'bg-white hover:bg-slate-200 text-slate-900' : 'bg-slate-900 hover:bg-slate-700 text-white'}`} >{isPlaying ? <Pause size={24} className="fill-current" /> : <Play size={24} className="fill-current ml-1" />}</Button>
                                                <Button onClick={playNext} variant="ghost" size="icon" className={`!rounded-full ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-black'}`} disabled={queue.length <= 1}><SkipForward size={22} /></Button>
                                                <Button variant="ghost" size="icon" className={repeatButtonClasses} onClick={toggleRepeat}>{isRepeat ? <Repeat1 size={20} /> : <Repeat size={20} />}{isRepeat && <div className="absolute bottom-1 h-1 w-1 bg-current rounded-full"></div>}</Button>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{formatTime(currentTime)}</span>
                                                <div ref={progressBarRef} onClick={handleSeek} className={`w-full group relative rounded-full h-1.5 cursor-pointer ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`}>
                                                    <div className="absolute top-0 left-0 h-full rounded-full bg-slate-500/30" style={{ width: `${bufferProgress}%` }}></div>
                                                    <div className={`relative h-1.5 rounded-full ${isDarkMode ? 'bg-white group-hover:bg-cyan-400' : 'bg-slate-800 group-hover:bg-blue-600'}`} style={{ width: `${progress}%` }}></div>
                                                    <div className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white group-hover:bg-cyan-400 dark:bg-white dark:group-hover:bg-cyan-400 shadow scale-0 group-hover:scale-100 transition-transform" style={{ left: `${progress}%` }}></div>
                                                </div>
                                                <span className={`text-xs font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{formatTime(duration)}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-4">
                                            <p className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Danh sách phát sẵn sàng</p>
                                            <p className={`text-sm mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{queue.length} bài hát trong hàng đợi</p>
                                            <Button onClick={() => queue.length > 0 && playSong(queue[0], queue)} className="!px-6"><Play size={18} className="mr-2" />Phát bài đầu tiên</Button>
                                        </div>
                                    )}

                                    {/* Volume & More Options */}
                                    <div className={`flex justify-end items-center gap-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                        <div className="relative" ref={volumeRef}>
                                            <Button variant="ghost" size="icon" className="!w-9 !h-9 hover:!text-current dark:hover:!text-white" onClick={(e) => { e.stopPropagation(); setIsVolumeOpen(v => !v); }}><VolumeIcon/></Button>
                                            {isVolumeOpen && (<div className={`absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-2 rounded-xl backdrop-blur-xl transition-all duration-300 ease-out transform z-50 ${isVolumeOpen ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-4 opacity-0 scale-95'} ${isDarkMode ? 'bg-gray-900/70' : 'bg-white/70'}`}><input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => { e.stopPropagation(); changeVolume(parseFloat(e.target.value)); }} className="w-24 h-1 accent-cyan-400 cursor-pointer" /></div>)}
                                        </div>
                                        <Menu as="div" className="relative">
                                            <Menu.Button as={Button} variant="ghost" size="icon" className="!w-9 !h-9 hover:!text-current dark:hover:!text-white"><MoreHorizontal size={18} /></Menu.Button>
                                            <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                                                <Menu.Items className="absolute bottom-full right-0 mb-2 w-56 origin-bottom-right rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-slate-200 dark:border-slate-700">
                                                    <div className="px-1 py-1"><Menu.Item>{({ active }) => (<button onClick={() => setIsAddToPlaylistModalOpen(true)} className={`${active ? 'bg-slate-100 dark:bg-slate-700' : ''} group flex w-full items-center rounded-md px-2 py-2 text-sm text-slate-900 dark:text-slate-200`}>Thêm vào playlist</button>)}</Menu.Item></div>
                                                </Menu.Items>
                                            </Transition>
                                        </Menu>
                                    </div>
                                </div>
                                {(!user || !isPremium()) && <div className="mt-4"><PremiumUpsellCard /></div>}
                            </div>
                        )}
                    </div>
                </div>
            </aside>
            {currentSong && <AddToPlaylistModal isOpen={isAddToPlaylistModalOpen} onClose={() => setIsAddToPlaylistModalOpen(false)} songToAdd={currentSong} />}
        </>
    );
};

export default PlayerSidebar;