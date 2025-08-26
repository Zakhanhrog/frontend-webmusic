// File: src/modules/music/pages/PlaylistManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { musicService } from '../services/musicService';
import { useAuth } from '../../../hooks/useAuth';
import { useAudio } from '../../../hooks/useAudio';
import { toast } from 'react-toastify';
import { Loader2, Music, Plus, Trash2, Eye, EyeOff, LayoutGrid, List, Play, Heart, Headphones } from 'lucide-react';
import Button from '../../../components/common/Button';
import { CreatePlaylistModal } from '../components/CreatePlaylistModal';
import ConfirmationModal from '../../../components/common/ConfirmationModal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.muzo.com.vn';

const PlaylistCard = ({ playlist, onPlayPlaylist }) => (
    <div className="group relative block">
        <div className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-lg shadow-md overflow-hidden mb-2 relative">
            <Link to={`/playlist/${playlist.id}`}>
                {playlist.thumbnailPath ? (
                    <img src={`${API_BASE_URL}${playlist.thumbnailPath}`} alt={playlist.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Music className="w-1/2 h-1/2 text-slate-400" />
                    </div>
                )}
            </Link>
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <Button
                    size="icon"
                    onClick={() => onPlayPlaylist(playlist.id)}
                    className="w-12 h-12 bg-music-500 hover:bg-music-600 rounded-full flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform duration-300 shadow-lg"
                >
                    <Play size={24} className="ml-1" />
                </Button>
            </div>
        </div>
        <Link to={`/playlist/${playlist.id}`}>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 truncate group-hover:text-cyan-500">{playlist.name}</h3>
        </Link>
        <p className="text-sm text-slate-500 dark:text-slate-400">{playlist.songCount} bài hát</p>
    </div>
);

const PlaylistListItem = ({ playlist, onPlayPlaylist, onToggleVisibility, onDelete }) => (
    <div className="bg-slate-100 dark:bg-slate-800/50 p-3 rounded-lg flex items-center gap-4 group hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors">
        <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-md overflow-hidden relative flex-shrink-0">
            <Link to={`/playlist/${playlist.id}`}>
                {playlist.thumbnailPath ? (
                    <img src={`${API_BASE_URL}${playlist.thumbnailPath}`} alt={playlist.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center"><Music className="w-8 h-8 text-slate-400" /></div>
                )}
            </Link>
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onPlayPlaylist(playlist.id)}
                    className="w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <Play size={20} className="ml-0.5" />
                </Button>
            </div>
        </div>
        <div className="flex-1 min-w-0">
            <Link to={`/playlist/${playlist.id}`} className="font-semibold text-slate-800 dark:text-slate-100 truncate hover:underline block">{playlist.name}</Link>
            <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-3 mt-1">
                <span>{playlist.songCount} bài hát</span>
                {playlist.visibility !== 'PRIVATE' && (
                    <>
                        <span className="flex items-center gap-1"><Headphones size={14} /> {playlist.listenCount?.toLocaleString('vi-VN') || 0}</span>
                        <span className="flex items-center gap-1"><Heart size={14} /> {playlist.likeCount?.toLocaleString('vi-VN') || 0}</span>
                    </>
                )}
                <span>• bởi {playlist.creatorName}</span>
            </div>
        </div>
        {(onToggleVisibility || onDelete) && (
            <div className="flex items-center gap-1">
                {onToggleVisibility && (
                    <Button size="icon" variant="ghost" onClick={() => onToggleVisibility(playlist.id, playlist.visibility)}>
                        {playlist.visibility === 'PUBLIC' ? <Eye size={18} /> : <EyeOff size={18} className="text-yellow-500"/>}
                    </Button>
                )}
                {onDelete && (
                    <Button size="icon" variant="ghost" onClick={() => onDelete(playlist.id, playlist.name)} className="text-red-500 hover:text-red-700">
                        <Trash2 size={18} />
                    </Button>
                )}
            </div>
        )}
    </div>
);

const PlaylistManagement = () => {
    const { user, isAdmin } = useAuth();
    const { playSong } = useAudio();
    const navigate = useNavigate();
    const [myPlaylists, setMyPlaylists] = useState([]);
    const [creatorPlaylists, setCreatorPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [playlistToDelete, setPlaylistToDelete] = useState(null);
    const [viewMode, setViewMode] = useState('list');

    const fetchPlaylists = useCallback(async () => {
        setLoading(true);
        try {
            if (isAdmin()) {
                const response = await musicService.getAdminPlaylistManagement();
                setMyPlaylists(response.data.adminPlaylists || []);
                setCreatorPlaylists(response.data.creatorPlaylists || []);
            } else {
                const response = await musicService.getMyPlaylists();
                setMyPlaylists(response.data || []);
            }
        } catch (error) {
            toast.error("Không thể tải thư viện playlist.");
        } finally {
            setLoading(false);
        }
    }, [isAdmin]);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchPlaylists();
    }, [user, navigate, fetchPlaylists]);

    const handlePlayPlaylist = useCallback(async (playlistId) => {
        try {
            const response = await musicService.getPlaylistDetails(playlistId);
            if (response.success && response.data.songs && response.data.songs.length > 0) {
                playSong(response.data.songs[0], response.data.songs, { playlistId: playlistId });
            } else {
                toast.info("Playlist này không có bài hát nào để phát.");
            }
        } catch (error) {
            toast.error("Không thể phát playlist này.");
        }
    }, [playSong]);

    const handleCreationSuccess = () => {
        setIsCreateModalOpen(false);
        toast.success("Tạo playlist mới thành công!");
        fetchPlaylists();
    };

    const handleToggleVisibility = async (playlistId, currentVisibility) => {
        if (currentVisibility === 'PRIVATE') {
            toast.info("Không thể thay đổi trạng thái của playlist cá nhân.");
            return;
        }
        try {
            const response = await musicService.togglePlaylistVisibility(playlistId);
            toast.success(response.message);
            fetchPlaylists();
        } catch (error) {
            toast.error(error.response?.data?.message || "Đã có lỗi xảy ra.");
        }
    };

    const handleDelete = (playlistId, playlistName) => {
        setPlaylistToDelete({ id: playlistId, name: playlistName });
    };

    const confirmDelete = async () => {
        if (!playlistToDelete) return;
        try {
            await musicService.deletePlaylist(playlistToDelete.id);
            toast.success(`Đã xóa playlist "${playlistToDelete.name}".`);
            setPlaylistToDelete(null);
            fetchPlaylists();
        } catch (error) {
            toast.error(error.response?.data?.message || "Xóa playlist thất bại.");
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-cyan-500" /></div>;
    }

    return (
        <div className="p-4 sm:p-6 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Thư viện Playlist</h1>
                <div className="flex items-center gap-2">
                    <div className="p-1 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center">
                        <Button size="icon" variant={viewMode === 'grid' ? 'solid' : 'ghost'} onClick={() => setViewMode('grid')}>
                            <LayoutGrid size={20} />
                        </Button>
                        <Button size="icon" variant={viewMode === 'list' ? 'solid' : 'ghost'} onClick={() => setViewMode('list')}>
                            <List size={20} />
                        </Button>
                    </div>
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                        <Plus className="mr-2" size={20} />
                        Tạo playlist mới
                    </Button>
                </div>
            </div>

            {/* My Playlists Section */}
            <div>
                <h2 className="text-xl font-semibold mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Playlist của tôi</h2>
                {myPlaylists.length > 0 ? (
                    viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                            {myPlaylists.map(pl => <PlaylistCard key={`my-${pl.id}`} playlist={pl} onPlayPlaylist={handlePlayPlaylist} />)}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {myPlaylists.map(pl => <PlaylistListItem key={`my-list-${pl.id}`} playlist={pl} onPlayPlaylist={handlePlayPlaylist} />)}
                        </div>
                    )
                ) : (
                    <p className="text-slate-500">Bạn chưa tạo playlist nào.</p>
                )}
            </div>

            {/* Creator Playlists Section (for Admins) */}
            {isAdmin() && creatorPlaylists.length > 0 && (
                <div>
                    <h2 className="text-xl font-semibold mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Playlist của Creator</h2>
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                            {creatorPlaylists.map(pl => <PlaylistCard key={`creator-${pl.id}`} playlist={pl} onPlayPlaylist={handlePlayPlaylist} />)}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {creatorPlaylists.map(pl => (
                                <PlaylistListItem
                                    key={`creator-list-${pl.id}`}
                                    playlist={pl}
                                    onPlayPlaylist={handlePlayPlaylist}
                                    onToggleVisibility={handleToggleVisibility}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            <CreatePlaylistModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handleCreationSuccess}
            />

            <ConfirmationModal
                isOpen={!!playlistToDelete}
                onClose={() => setPlaylistToDelete(null)}
                onConfirm={confirmDelete}
                title="Xác nhận xóa playlist"
                message={`Bạn có chắc chắn muốn xóa vĩnh viễn playlist "${playlistToDelete?.name}"? Hành động này không thể hoàn tác.`}
                confirmText="Xóa"
                variant="danger"
            />
        </div>
    );
};

export default PlaylistManagement;