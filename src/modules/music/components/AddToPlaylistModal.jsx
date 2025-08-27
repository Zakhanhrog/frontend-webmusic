import React, { useState, useEffect } from 'react';
import { musicService } from '../services/musicService';
import { toast } from 'react-toastify';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import { Plus, Loader2, Music } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.muzo.com.vn';

export const AddToPlaylistModal = ({ isOpen, onClose, songToAdd }) => {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(null);

    useEffect(() => {
        if (isOpen) {
            const fetchUserPlaylists = async () => {
                setLoading(true);
                try {
                    const response = await musicService.getMyPlaylists();
                    if (response.success) {
                        setPlaylists(response.data);
                    } else {
                        toast.error(response.message || "Không thể tải danh sách playlist.");
                    }
                } catch (error) {
                    toast.error("Lỗi khi tải danh sách playlist.");
                } finally {
                    setLoading(false);
                }
            };
            fetchUserPlaylists();
        }
    }, [isOpen]);

    const handleAddToPlaylist = async (playlistId) => {
        if (!songToAdd || !songToAdd.id) return;
        setSubmitting(playlistId);
        try {
            const response = await musicService.addSongsToPlaylist(playlistId, [songToAdd.id]);
            if (response.success) {
                toast.success(`Đã thêm "${songToAdd.title}" vào playlist!`);
                onClose();
            } else {
                toast.error(response.message || "Thêm bài hát thất bại.");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Đã có lỗi xảy ra.");
        } finally {
            setSubmitting(null);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Thêm vào playlist">
            <div className="mt-4 max-h-80 overflow-y-auto pr-2">
                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="w-8 h-8 animate-spin text-music-500" />
                    </div>
                ) : playlists.length > 0 ? (
                    <ul className="space-y-2">
                        {playlists.map((playlist) => (
                            <li key={playlist.id}>
                                <button
                                    onClick={() => handleAddToPlaylist(playlist.id)}
                                    disabled={submitting === playlist.id}
                                    className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors duration-200 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <img
                                        src={playlist.thumbnailPath ? `${API_BASE_URL}${playlist.thumbnailPath}` : `https://via.placeholder.com/100/1e293b/FFFFFF?text=${playlist.name.charAt(0)}`}
                                        alt={playlist.name}
                                        className="w-12 h-12 rounded-md object-cover flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{playlist.name}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{playlist.songCount} bài hát</p>
                                    </div>
                                    {submitting === playlist.id ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Plus className="w-5 h-5 text-slate-500" />
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-10 text-slate-500">
                        <Music className="w-12 h-12 mx-auto mb-3" />
                        <p>Bạn chưa có playlist nào.</p>
                        <p className="text-sm mt-1">Hãy tạo một playlist để thêm bài hát nhé.</p>
                    </div>
                )}
            </div>
            <div className="mt-6 flex justify-end">
                <Button variant="secondary" onClick={onClose}>
                    Đóng
                </Button>
            </div>
        </Modal>
    );
};