import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { musicService } from '../services/musicService';
import { toast } from 'react-toastify';
import { useDebounce } from 'use-debounce';
import { Search, Plus, X, Check } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.muzo.com.vn';

const SongItem = ({ song, onAdd, isExisting, isSelected }) => {
    const handleAddClick = () => {
        if (isExisting) {
            toast.info(`"${song.title}" đã có trong playlist.`);
        } else if (!isSelected) {
            onAdd(song);
        }
    };

    return (
        <div className={`flex items-center justify-between p-2 rounded-md transition-colors ${isSelected ? 'bg-cyan-50 dark:bg-cyan-900/20' : 'hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}>
            <div className="flex items-center gap-3 min-w-0">
                <img
                    src={song.thumbnailPath ? `${API_BASE_URL}${song.thumbnailPath}` : `https://via.placeholder.com/40`}
                    alt={song.title}
                    className="w-10 h-10 rounded-md object-cover"
                />
                <div className="min-w-0">
                    <p className="font-semibold truncate text-slate-800 dark:text-slate-100">{song.title}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{song.singers && song.singers.map(s => s.name).join(', ')}</p>
                </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleAddClick} className="!px-2 !py-1" disabled={isSelected}>
                {isExisting || isSelected ? <Check size={16} className="text-green-500" /> : <Plus size={16} />}
            </Button>
        </div>
    );
};

const AddSongsToPlaylistModal = ({ isOpen, onClose, onSuccess, playlist }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
    const [selectedSongs, setSelectedSongs] = useState([]);
    const [allSongs, setAllSongs] = useState([]);
    const [isSongListLoading, setIsSongListLoading] = useState(false);

    const existingSongIds = useMemo(() => {
        if (!playlist?.songs) return new Set();
        return new Set(playlist.songs.map(s => s.id));
    }, [playlist]);

    useEffect(() => {
        if (isOpen && playlist) {
            setIsSongListLoading(true);
            musicService.getAllSongsForPlaylist()
                .then(response => {
                    if (response.success) {
                        setAllSongs(response.data || []);
                    } else {
                        toast.error(response.message || "Không thể tải danh sách bài hát.");
                    }
                })
                .catch(() => toast.error("Lỗi khi tải danh sách bài hát."))
                .finally(() => setIsSongListLoading(false));
        } else {
            setSearchTerm('');
            setSelectedSongs([]);
            setAllSongs([]);
        }
    }, [isOpen, playlist]);

    const displayedSongs = useMemo(() => {
        if (!debouncedSearchTerm.trim()) {
            return allSongs;
        }
        const lowercasedFilter = debouncedSearchTerm.toLowerCase();
        return allSongs.filter(song =>
            song.title.toLowerCase().includes(lowercasedFilter) ||
            (song.singers && song.singers.some(singer => singer.name.toLowerCase().includes(lowercasedFilter)))
        );
    }, [debouncedSearchTerm, allSongs]);

    const addSong = (song) => {
        setSelectedSongs(prev => [...prev, song]);
    };

    const removeSelectedSong = (songId) => {
        setSelectedSongs(prev => prev.filter(s => s.id !== songId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedSongs.length === 0) {
            toast.info('Vui lòng chọn ít nhất một bài hát để thêm.');
            return;
        }

        const newSongsToAdd = selectedSongs.filter(song => !existingSongIds.has(song.id));

        if (newSongsToAdd.length === 0) {
            toast.info('Tất cả các bài hát bạn chọn đã có trong playlist.');
            return;
        }

        setIsLoading(true);
        try {
            const songIds = newSongsToAdd.map(s => s.id);
            const response = await musicService.addSongsToPlaylist(playlist.id, songIds);
            if (response.success) {
                toast.success(`Đã thêm ${songIds.length} bài hát mới vào playlist "${playlist.name}"`);
                onSuccess(response.data);
                onClose();
            } else {
                toast.error(response.message || 'Thêm bài hát thất bại.');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra khi thêm bài hát.';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const selectedSongIds = new Set(selectedSongs.map(s => s.id));

    const renderSongList = () => {
        if (isSongListLoading) return <p className="text-center text-slate-400 py-4">Đang tải...</p>;
        if (displayedSongs.length > 0) return displayedSongs.map(song => (
            <SongItem
                key={song.id}
                song={song}
                onAdd={addSong}
                isExisting={existingSongIds.has(song.id)}
                isSelected={selectedSongIds.has(song.id)}
            />
        ));
        return <p className="text-center text-slate-400 py-4">Không có bài hát nào phù hợp.</p>;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Thêm bài hát vào "${playlist?.name}"`} size="md">
            <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-4">
                    <Input
                        id="song-search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm kiếm theo tên bài hát, ca sĩ..."
                        icon={<Search size={18} />}
                    />
                    <div className="h-80 overflow-y-auto space-y-2 p-2 border dark:border-slate-700 rounded-lg">
                        {renderSongList()}
                    </div>
                    {selectedSongs.length > 0 && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-900 dark:text-white">
                                Sẽ thêm ({selectedSongs.length} bài hát)
                            </label>
                            <div className="max-h-32 overflow-y-auto space-y-1 p-1">
                                {selectedSongs.map(song => (
                                    <div key={song.id} className="flex items-center justify-between text-sm p-1.5 rounded-md bg-slate-100 dark:bg-slate-700/50">
                                        <span className="truncate">{song.title}</span>
                                        <Button variant="ghost" size="icon" onClick={() => removeSelectedSong(song.id)} className="h-6 w-6 text-red-500">
                                            <X size={14} />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex items-center justify-end p-4 border-t border-gray-200 rounded-b dark:border-gray-600 space-x-2">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Hủy
                    </Button>
                    <Button type="submit" isLoading={isLoading} disabled={isLoading || selectedSongs.length === 0}>
                        Thêm
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddSongsToPlaylistModal;