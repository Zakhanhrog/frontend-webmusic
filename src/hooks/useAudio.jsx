// frontend-webmusic/src/hooks/useAudio.jsx

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { musicService } from "../modules/music/services/musicService";
import { useAuth } from "./useAuth";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const AudioContext = createContext();

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};

const LOCAL_STORAGE_KEY = "Muzo-player-state";

export const AudioProvider = ({ children }) => {
  const { isAuthenticated, isPremium, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedTime, setBufferedTime] = useState(0); // <-- STATE MỚI
  const [volume, setVolume] = useState(0.4);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [lyrics, setLyrics] = useState([]);
  const [playContext, setPlayContext] = useState({});

  const audioRef = useRef(null);
  const fadeIntervalRef = useRef(null);
  const isPreviewingRef = useRef(false);
  const isPlayingUpsellRef = useRef(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.muzo.com.vn";
  const UPSELL_AUDIO_URL = "/audio/premium_upsell.mp3";

  const getStreamingUrl = (songId) => {
    return `${API_BASE_URL}/api/v1/stream/songs/${songId}`;
  };

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.src = "";
      }
      setCurrentSong(null);
      setQueue([]);
      setCurrentIndex(-1);
      setLyrics([]);
      setIsPlaying(false);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } else {
      try {
        const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedState) {
          const parsedState = JSON.parse(savedState);
          setCurrentSong(parsedState.currentSong || null);
          setQueue(parsedState.queue || []);
          setCurrentIndex(parsedState.currentIndex ?? -1);
          setVolume(parsedState.volume ?? 0.4);
          setIsRepeat(parsedState.isRepeat || false);
          setIsShuffle(parsedState.isShuffle || false);
        }
      } catch (error) {
        console.error("Lỗi khi tải trạng thái audio:", error);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    const fetchInitialLyrics = async () => {
      if (currentSong?.id && lyrics.length === 0) {
        try {
          const lyricsResponse = await musicService.getSongLyrics(currentSong.id);
          if (lyricsResponse.success) {
            setLyrics(lyricsResponse.data);
          }
        } catch (error) {
          console.error("Không thể tải lại lời bài hát:", error);
        }
      }
    };
    fetchInitialLyrics();
  }, [currentSong?.id, lyrics.length]);

  useEffect(() => {
    if (isAuthenticated && currentSong) {
      const stateToSave = {
        currentSong,
        queue,
        currentIndex,
        volume,
        isRepeat,
        isShuffle,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
    }
  }, [currentSong, queue, currentIndex, volume, isRepeat, isShuffle, isAuthenticated]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
      const streamingUrl = currentSong ? getStreamingUrl(currentSong.id) : '';
      if (currentSong && audio.src !== streamingUrl) {
        audio.src = streamingUrl;
        audio.load();
      }
    }
  }, [volume, currentSong, API_BASE_URL]);

  const FADE_DURATION = 300;
  const FADE_INTERVAL = 30;

  const clearFadeInterval = () => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
  };

  const fadeIn = useCallback(() => {
    clearFadeInterval();
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    if (!audio.src || audio.src === "") {
      audio.src = getStreamingUrl(currentSong.id);
      audio.load();
    }

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
          .then(() => { setIsPlaying(true); })
          .catch((error) => {
            console.error("Play failed:", error);
            setIsPlaying(false);
          });
    }

    if (audio.volume >= volume) return;
    const targetVolume = volume;
    let currentVolume = audio.volume;
    const step = targetVolume / (FADE_DURATION / FADE_INTERVAL);

    fadeIntervalRef.current = setInterval(() => {
      currentVolume += step;
      if (currentVolume < targetVolume) {
        audio.volume = currentVolume;
      } else {
        audio.volume = targetVolume;
        clearFadeInterval();
      }
    }, FADE_INTERVAL);
  }, [volume, currentSong, API_BASE_URL]);

  const fadeOut = useCallback((onComplete) => {
    clearFadeInterval();
    const audio = audioRef.current;
    if (!audio || audio.volume === 0) {
      if (onComplete) onComplete();
      return;
    }
    const startVolume = audio.volume;
    const step = startVolume / (FADE_DURATION / FADE_INTERVAL);
    fadeIntervalRef.current = setInterval(() => {
      const currentVolume = audio.volume;
      if (currentVolume > step) {
        audio.volume -= step;
      } else {
        audio.volume = 0;
        clearFadeInterval();
        if (onComplete) onComplete();
      }
    }, FADE_INTERVAL);
  }, []);

  const stopAndClearPlayer = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.src = "";
      audio.volume = volume;
    }
    setCurrentSong(null);
    setQueue([]);
    setCurrentIndex(-1);
    setCurrentTime(0);
    setDuration(0);
    setBufferedTime(0); // Reset buffer
    setIsPlaying(false);
    setLyrics([]);
    isPreviewingRef.current = false;
    isPlayingUpsellRef.current = false;
  }, [volume]);

  const playUpsellAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    isPlayingUpsellRef.current = true;
    audio.volume = 0;
    fadeOut(() => {
      audio.src = UPSELL_AUDIO_URL;
      audio.load();
      const playAfterLoad = () => {
        fadeIn();
        audio.removeEventListener("canplaythrough", playAfterLoad);
      };
      audio.addEventListener("canplaythrough", playAfterLoad);
    });
  }, [fadeOut, fadeIn]);

  const playSong = useCallback(
      async (song, playlist = [], context = {}) => {
        if (!song) return;
        if (authLoading) {
          toast.info("Đang xác thực, vui lòng chờ...");
          return;
        }

        setLyrics([]);
        const lyricsResponse = await musicService.getSongLyrics(song.id);
        if (lyricsResponse.success) {
          setLyrics(lyricsResponse.data);
        }

        isPreviewingRef.current = false;
        isPlayingUpsellRef.current = false;

        if (song.isPremium && !isAuthenticated) {
          toast.info("Đây là nội dung Premium. Vui lòng đăng nhập để nghe.");
          navigate("/login");
          return;
        }
        if (song.isPremium && isAuthenticated && !isPremium()) {
          isPreviewingRef.current = true;
        }

        const audio = audioRef.current;
        if (!audio) return;
        if (!isPreviewingRef.current) {
          musicService.incrementSongListenCount(song.id);
        }

        const executePlay = () => {
          setLoading(true);
          setCurrentSong(song);
          setPlayContext(context);
          if (playlist.length > 0) {
            setQueue(playlist);
            const index = playlist.findIndex((s) => s.id === song.id);
            setCurrentIndex(index >= 0 ? index : 0);
          } else {
            const queueExists = queue.length > 0;
            const songInQueueIndex = queue.findIndex((s) => s.id === song.id);
            if (queueExists && songInQueueIndex > -1) {
              setCurrentIndex(songInQueueIndex);
            } else {
              const newQueue = queueExists ? [...queue, song] : [song];
              setQueue(newQueue);
              setCurrentIndex(newQueue.length - 1);
            }
          }

          // <-- THAY ĐỔI CỐT LÕI
          audio.src = getStreamingUrl(song.id);
          audio.volume = 0;
          audio.load();

          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise
                .then(() => { fadeIn(); })
                .catch((error) => {
                  console.error("Autoplay was prevented:", error);
                  setIsPlaying(false);
                });
          }
        };

        if (isPlaying) {
          fadeOut(executePlay);
        } else {
          executePlay();
        }
      },
      [isPlaying, fadeIn, fadeOut, isAuthenticated, isPremium, navigate, authLoading, queue]
  );

  const playPlaylist = useCallback((playlistData) => {
    if (!playlistData || !playlistData.songs || playlistData.songs.length === 0) {
      toast.warn("Playlist này không có bài hát nào để phát.");
      return;
    }
    const firstSong = playlistData.songs[0];
    musicService.incrementPlaylistListenCount(playlistData.id);
    playSong(firstSong, playlistData.songs, { playlistId: playlistData.id });
  }, [playSong]);

  const playNext = useCallback(() => {
    if (isPlayingUpsellRef.current) return;
    if (queue.length === 0) return;
    let nextIndex;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
      if (queue.length > 1 && nextIndex === currentIndex) {
        nextIndex = (currentIndex + 1) % queue.length;
      }
    } else {
      nextIndex = (currentIndex + 1) % queue.length;
    }
    playSong(queue[nextIndex], queue, playContext);
  }, [queue, isShuffle, currentIndex, playContext, playSong]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleProgress = () => {
      if (audio.buffered.length > 0) {
        setBufferedTime(audio.buffered.end(audio.buffered.length - 1));
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (isPreviewingRef.current && !isNaN(audio.duration) && audio.currentTime >= audio.duration * 0.15) {
        isPreviewingRef.current = false;
        playUpsellAudio();
      }
    };

    const handleEnded = () => {
      if (isPlayingUpsellRef.current) {
        isPlayingUpsellRef.current = false;
        playNext();
        return;
      }
      if (isRepeat) {
        audio.currentTime = 0;
        const playPromise = audio.play();
        if (playPromise) playPromise.catch((e) => console.error(e));
      } else {
        playNext();
      }
    };

    const updateDuration = () => setDuration(audio.duration);
    const handleLoadStart = () => setLoading(true);
    const handleCanPlayThrough = () => setLoading(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = (e) => {
      console.error("Audio error:", e);
      setLoading(false);
      setIsPlaying(false);
    };

    audio.addEventListener("progress", handleProgress); // <-- EVENT MỚI
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("canplaythrough", handleCanPlayThrough);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("progress", handleProgress);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("canplaythrough", handleCanPlayThrough);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("error", handleError);
      clearFadeInterval();
    };
  }, [isRepeat, fadeIn, playNext, playUpsellAudio]);

  const togglePlay = () => {
    if (!audioRef.current || !currentSong || isPlayingUpsellRef.current) return;
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (!audio.src || audio.src === "") {
        audio.src = getStreamingUrl(currentSong.id);
        audio.load();
      }
      if (audio.volume === 0) {
        audio.volume = volume;
      }
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
            .then(() => { setIsPlaying(true); })
            .catch((error) => {
              console.error("Play was prevented:", error);
              setIsPlaying(false);
            });
      }
    }
  };

  const playPrevious = useCallback(() => {
    if (queue.length === 0) return;
    let prevIndex;
    if (isShuffle) {
      prevIndex = Math.floor(Math.random() * queue.length);
    } else {
      prevIndex = currentIndex === 0 ? queue.length - 1 : currentIndex - 1;
    }
    playSong(queue[prevIndex], queue, playContext);
  }, [queue, isShuffle, currentIndex, playSong, playContext]);

  const seekTo = (time) => {
    if (audioRef.current && !isPlayingUpsellRef.current) {
      const previewTimeLimit = duration * 0.15;
      if (isPreviewingRef.current && time > previewTimeLimit) {
        audioRef.current.currentTime = previewTimeLimit;
        setCurrentTime(previewTimeLimit);
        return;
      }
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const changeVolume = (newVolume) => {
    setVolume(newVolume);
    if (audioRef.current) {
      clearFadeInterval();
      audioRef.current.volume = newVolume;
    }
  };

  const toggleRepeat = () => setIsRepeat((prev) => !prev);
  const toggleShuffle = () => setIsShuffle((prev) => !prev);

  const addToQueue = (song) => {
    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để sử dụng tính năng này.");
      navigate("/login");
      return;
    }
    const toastId = `add-queue-${song.id}`;
    if (queue.some((s) => s.id === song.id)) {
      toast.info(`"${song.title}" đã có trong danh sách phát.`, { toastId });
      return;
    }
    setQueue((prev) => [...prev, song]);
    toast.success(`Đã thêm "${song.title}" vào danh sách phát.`, { toastId });
  };

  const removeFromQueue = useCallback((songId) => {
    const removedIndex = queue.findIndex((song) => song.id === songId);
    if (removedIndex === -1) return;
    const newQueue = queue.filter((song) => song.id !== songId);
    const isRemovingCurrentSong = removedIndex === currentIndex;
    if (newQueue.length === 0) {
      stopAndClearPlayer();
      toast.success("Đã xóa bài hát khỏi danh sách phát.");
      return;
    }
    setQueue(newQueue);
    if (isRemovingCurrentSong) {
      let nextIndex = (removedIndex >= newQueue.length) ? 0 : removedIndex;
      const nextSong = newQueue[nextIndex];
      playSong(nextSong, newQueue, playContext);
    } else if (removedIndex < currentIndex) {
      setCurrentIndex((prev) => prev - 1);
    }
    toast.success("Đã xóa bài hát khỏi danh sách phát.");
  }, [queue, currentIndex, playSong, playContext, stopAndClearPlayer]);


  const clearQueue = () => {
    setQueue([]);
    setCurrentIndex(-1);
    setLyrics([]);
  };

  const formatTime = (time) => {
    if (isNaN(time) || time === 0) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const value = {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    bufferedTime, // <-- Thêm vào context
    volume,
    isRepeat,
    isShuffle,
    queue,
    currentIndex,
    loading,
    audioRef,
    lyrics,
    playSong,
    playPlaylist,
    togglePlay,
    playNext,
    playPrevious,
    seekTo,
    changeVolume,
    toggleRepeat,
    toggleShuffle,
    addToQueue,
    removeFromQueue,
    clearQueue,
    formatTime,
    stopAndClearPlayer,
  };

  return (
      <AudioContext.Provider value={value}>
        {children}
        <audio ref={audioRef} crossOrigin="anonymous" preload="metadata" />
      </AudioContext.Provider>
  );
};