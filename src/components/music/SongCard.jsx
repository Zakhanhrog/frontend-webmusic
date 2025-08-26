import React, { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Play, Plus, Crown, ListPlus } from "lucide-react";
import { AddToPlaylistModal } from "../../modules/music/components/AddToPlaylistModal";
import { LikeButton } from "../../modules/music/components/LikeButton";
import { musicService } from "../../modules/music/services/musicService";
import { useAuth } from "../../hooks/useAuth";
import { useAudio } from "../../hooks/useAudio";
import { toast } from "react-toastify";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://api.muzo.com.vn";

const SongCard = ({ song, onPlay }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { addToQueue } = useAudio();
  const navigate = useNavigate();

  const handleOpenModal = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để thêm bài hát vào playlist.");
      navigate("/login");
      return;
    }
    setIsModalOpen(true);
  };

  const handleToggleLike = useCallback(async () => {
    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để thích bài hát.");
      navigate("/login");
      return;
    }
    try {
      await musicService.toggleSongLike(song.id);
    } catch (error) {
      console.error("Failed to toggle like:", error);
      throw error;
    }
  }, [song.id, isAuthenticated, navigate]);

  const handlePlayClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onPlay) {
      onPlay(song);
    }
  };

  const handleAddToQueue = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToQueue(song);
  };

  return (
    <>
      <div className="group relative block p-3 rounded-lg bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors duration-300">
        <Link to={`/song/${song.id}`}>
          <div className="relative w-full aspect-square rounded-md overflow-hidden mb-4">
            <img
              src={
                song.thumbnailPath
                  ? `${API_BASE_URL}${song.thumbnailPath}`
                  : "https://via.placeholder.com/150"
              }
              alt={song.title}
              className="w-full h-full object-cover"
            />

            {song.isPremium && (
              <div
                className="absolute top-2 left-2 flex items-center bg-black/40 backdrop-blur-sm rounded-full px-2 py-1"
                title="Nội dung Premium"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              </div>
            )}

            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <button
                onClick={handlePlayClick}
                className="w-12 h-12 bg-music-500 hover:bg-music-600 rounded-full flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform duration-300 shadow-lg"
              >
                <Play size={24} className="ml-1" />
              </button>
            </div>

            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={handleAddToQueue}
                className="w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/40 dark:bg-black/20 dark:hover:bg-black/40 backdrop-blur-sm rounded-full text-white"
                aria-label="Thêm vào hàng đợi"
                data-tooltip-id="global-tooltip"
                data-tooltip-content="Thêm vào hàng đợi"
              >
                <ListPlus size={18} />
              </button>
              <button
                onClick={handleOpenModal}
                className="w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/40 dark:bg-black/20 dark:hover:bg-black/40 backdrop-blur-sm rounded-full text-white"
                aria-label="Thêm vào playlist"
                data-tooltip-id="global-tooltip"
                data-tooltip-content="Thêm vào playlist"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        </Link>
        <div className="flex justify-between items-start">
          <div className="min-w-0 flex-1">
            <Link
              to={`/song/${song.id}`}
              className="font-semibold truncate text-slate-800 dark:text-slate-100 block hover:underline"
            >
              {song.title}
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
              {song.singers && song.singers.length > 0
                ? song.singers.map((s, index) => (
                    <React.Fragment key={s.id}>
                      <Link
                        to={`/singer/${s.id}`}
                        className="hover:underline hover:text-slate-700 dark:hover:text-slate-300"
                      >
                        {s.name}
                      </Link>
                      {index < song.singers.length - 1 && ", "}
                    </React.Fragment>
                  ))
                : song.creatorName}
            </p>
          </div>
          <div className="flex-shrink-0 ml-2">
            <LikeButton
              initialIsLiked={song.isLikedByCurrentUser}
              initialLikeCount={song.likeCount}
              onToggleLike={handleToggleLike}
              showCount={false}
              size={18}
            />
          </div>
        </div>
      </div>
      {isModalOpen && (
        <AddToPlaylistModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          songToAdd={song}
        />
      )}
    </>
  );
};

export default SongCard;
