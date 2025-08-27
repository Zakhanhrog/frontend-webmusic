import React, { useState, useRef, useEffect } from 'react';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useAudio } from '../../hooks/useAudio';
import Button from '../common/Button';
import { X, Mic2 } from 'lucide-react';

const LyricsSidebar = ({ isOpen, onClose }) => {
    const { isDarkMode } = useDarkMode();
    const { currentSong, lyrics, currentTime } = useAudio();
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
        if (activeLineRef.current && isOpen) {
            activeLineRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [activeLineIndex, isOpen]);

    if (!isOpen) return null;

    return (
        <aside className="w-80 flex-shrink-0 relative">
            <div className="w-full h-full overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0">
                    {currentSong && (
                        <img 
                            src={`${import.meta.env.VITE_API_BASE_URL || 'https://api.muzo.com.vn'}${currentSong.thumbnailPath}`} 
                            alt="Lyrics background" 
                            className={`w-full h-full object-cover scale-110 filter blur-2xl transition-all duration-500 ${isDarkMode ? 'brightness-[.3]' : 'brightness-75'}`} 
                        />
                    )}
                    <div className={`absolute inset-0 ${isDarkMode ? 'bg-black/50' : 'bg-white/30'}`}></div>
                </div>

                {/* Content */}
                <div className="relative h-full flex flex-col p-4">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-4 flex-shrink-0">
                        <div className="flex items-center space-x-2">
                            <Mic2 size={20} className={isDarkMode ? 'text-white' : 'text-slate-900'} />
                            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                Lời bài hát
                            </h3>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="!w-8 !h-8" 
                            onClick={onClose}
                        >
                            <X size={18} />
                        </Button>
                    </div>

                    {/* Song Info */}
                    {currentSong && (
                        <div className={`mb-4 p-3 backdrop-blur-2xl border rounded-xl transition-colors duration-300 ${isDarkMode ? 'bg-gray-900/60 border-white/10' : 'bg-slate-50/60 border-black/10'}`}>
                            <p className={`font-bold truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                {currentSong.title}
                            </p>
                            <p className={`text-sm truncate ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                {currentSong.singers.map(s => s.name).join(', ')}
                            </p>
                        </div>
                    )}

                    {/* Lyrics Content */}
                    <div className="flex-1 flex flex-col min-h-0">
                        {!lyrics || lyrics.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center">
                                    <Mic2 className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                                    <p className={`font-semibold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                        Lời bài hát không có sẵn
                                    </p>
                                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                        Hãy thưởng thức giai điệu
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto space-y-4 text-center pr-2">
                                {lyrics.map((line, index) => (
                                    <p
                                        key={index}
                                        ref={index === activeLineIndex ? activeLineRef : null}
                                        className={`transition-all duration-300 text-lg leading-relaxed
                                            ${index === activeLineIndex
                                                ? (isDarkMode ? 'text-white font-bold scale-105 drop-shadow-lg' : 'text-slate-900 font-bold scale-105 drop-shadow-lg')
                                                : (isDarkMode ? 'text-slate-400' : 'text-slate-600')
                                            }`
                                        }
                                    >
                                        {line.text}
                                    </p>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default LyricsSidebar;
