// frontend-webmusic/src/components/layout/AICommandPalette.jsx

import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, Send } from 'lucide-react';
import { useDarkMode } from '../../hooks/useDarkMode';
import { aiService } from '../../modules/ai/services/aiService';
import { toast } from 'react-toastify';

export const AICommandPalette = ({ isOpen, onClose }) => {
    const [mood, setMood] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { isDarkMode } = useDarkMode();

    useEffect(() => {
        if (!isOpen) {
            // Reset state khi modal đóng
            setTimeout(() => {
                setMood('');
                setLoading(false);
            }, 300); // Đợi transition hoàn tất
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!mood.trim() || loading) return;

        setLoading(true);
        try {
            const response = await aiService.getAIRecommendations(mood.trim());
            if (response.success) {
                // Chuyển hướng đến trang kết quả với state
                navigate(`/ai-results?mood=${encodeURIComponent(mood.trim())}`, { state: { results: response.data } });
                onClose();
            } else {
                toast.error(response.message || "AI không thể xử lý yêu cầu của bạn lúc này.");
            }
        } catch (error) {
            toast.error("Đã có lỗi xảy ra. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-start justify-center p-4 pt-[15vh] text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className={`w-full max-w-xl transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-xl transition-all ${isDarkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white'}`}>
                                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-slate-900 dark:text-white flex items-center gap-2">
                                    <Sparkles className="text-cyan-500" />
                                    MuzoAI - Tìm nhạc theo cảm xúc
                                </Dialog.Title>
                                <div className="mt-2">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Hãy cho tôi biết bạn đang cảm thấy thế nào, tôi sẽ tìm những bản nhạc phù hợp nhất.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="mt-4">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={mood}
                                            onChange={(e) => setMood(e.target.value)}
                                            placeholder="Ví dụ: một buổi chiều mưa thật buồn..."
                                            disabled={loading}
                                            className={`w-full rounded-lg border py-3 pl-4 pr-12 text-base transition-colors focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:ring-cyan-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-blue-500'}`}
                                            autoFocus
                                        />
                                        <button
                                            type="submit"
                                            disabled={loading || !mood.trim()}
                                            className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-slate-400 hover:text-cyan-500 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {loading ? <Loader2 className="animate-spin" /> : <Send />}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};