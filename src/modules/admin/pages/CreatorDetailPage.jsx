import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { toast } from 'react-toastify';
import { Loader2, User, Mail, Phone, Calendar, Music, ShieldCheck, ListMusic, GitCommitVertical } from 'lucide-react';
import { useDarkMode } from '../../../hooks/useDarkMode';
import Button from '../../../components/common/Button';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.muzo.com.vn';

const CreatorDetailPage = () => {
    const { creatorId } = useParams();
    const { currentTheme } = useDarkMode();
    const [creator, setCreator] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchCreatorDetails = useCallback(async () => {
        setLoading(true);
        try {
            const response = await adminService.getCreatorDetails(creatorId);
            if (response.success) {
                setCreator(response.data);
            } else {
                toast.error(response.message || 'Không thể tải thông tin nhà phát triển.');
            }
        } catch (error) {
            toast.error('Đã có lỗi xảy ra khi tải dữ liệu chi tiết.');
        } finally {
            setLoading(false);
        }
    }, [creatorId]);

    useEffect(() => {
        fetchCreatorDetails();
    }, [fetchCreatorDetails]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-cyan-500" />
            </div>
        );
    }

    if (!creator) {
        return <div className="text-center text-slate-500 dark:text-slate-400 mt-10">Không tìm thấy thông tin nhà phát triển.</div>;
    }

    const InfoCard = ({ icon: Icon, label, value }) => (
        <div className="flex items-start gap-4">
            <Icon className="w-5 h-5 mt-1 text-cyan-500 flex-shrink-0" />
            <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                <p className="font-medium text-slate-800 dark:text-slate-200">{value || 'Chưa cập nhật'}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
                <div className={`w-24 h-24 rounded-full ${currentTheme.bgCard} border ${currentTheme.border} flex-shrink-0 flex items-center justify-center`}>
                    {creator.avatarPath ? (
                        <img src={`${API_BASE_URL}${creator.avatarPath}`} alt={creator.displayName} className="w-full h-full object-cover rounded-full" />
                    ) : (
                        <User className="w-12 h-12 text-slate-400" />
                    )}
                </div>
                <div className="flex-grow">
                    <h1 className={`text-4xl font-bold ${currentTheme.text}`}>{creator.displayName}</h1>
                    <p className={`mt-2 text-lg ${currentTheme.textSecondary}`}>{creator.email}</p>
                </div>
                <Link to="/admin/creators">
                    <Button variant="outline">Quay lại danh sách</Button>
                </Link>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 ${currentTheme.bgCard} rounded-xl border ${currentTheme.border}`}>
                <InfoCard icon={User} label="Mã nhà phát triển" value={`#${creator.id}`} />
                <InfoCard icon={Phone} label="Số điện thoại" value={creator.phoneNumber} />
                <InfoCard icon={Calendar} label="Ngày tham gia" value={new Intl.DateTimeFormat('vi-VN').format(new Date(creator.createdAt))} />
                <InfoCard icon={User} label="Giới tính" value={creator.gender} />
                <InfoCard icon={Calendar} label="Ngày sinh" value={creator.dateOfBirth ? new Intl.DateTimeFormat('vi-VN').format(new Date(creator.dateOfBirth)) : 'Chưa cập nhật'} />
            </div>

            <div>
                <h2 className={`text-2xl font-semibold mb-4 flex items-center gap-2 ${currentTheme.text}`}>
                    <ListMusic />
                    Danh sách bài hát đã đăng ({creator.songs.length})
                </h2>
                <div className={`${currentTheme.bgCard} rounded-xl overflow-hidden border ${currentTheme.border}`}>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className={`${currentTheme.bg}`}>
                            <tr>
                                <th className={`px-6 py-3 text-left text-xs font-medium ${currentTheme.textSecondary} uppercase tracking-wider`}>Bài hát</th>
                                <th className={`px-6 py-3 text-center text-xs font-medium ${currentTheme.textSecondary} uppercase tracking-wider`}>Trạng thái</th>
                                <th className={`px-6 py-3 text-center text-xs font-medium ${currentTheme.textSecondary} uppercase tracking-wider`}>Lượt nghe</th>
                                <th className={`px-6 py-3 text-right text-xs font-medium ${currentTheme.textSecondary} uppercase tracking-wider`}>Ngày đăng</th>
                            </tr>
                            </thead>
                            <tbody className={`${currentTheme.bgCard} divide-y divide-gray-200 dark:divide-gray-700`}>
                            {creator.songs.length > 0 ? (
                                creator.songs.map(song => (
                                    <tr key={song.id} className={`hover:${currentTheme.bg}`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-4">
                                                <img src={`${API_BASE_URL}${song.thumbnailPath}`} alt={song.title} className="w-10 h-10 rounded-md object-cover" />
                                                <div>
                                                    <p className={`font-medium ${currentTheme.text}`}>{song.title}</p>
                                                    <p className={`text-sm ${currentTheme.textSecondary}`}>
                                                        {song.singers && song.singers.map(s => s.name).join(', ')}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    song.status === 'APPROVED' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                                                        song.status === 'PENDING' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                                                            'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                                }`}>
                                                    {song.status}
                                                </span>
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-center text-sm ${currentTheme.textSecondary}`}>{song.listenCount.toLocaleString('vi-VN')}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-right text-sm ${currentTheme.textSecondary}`}>
                                            {new Intl.DateTimeFormat('vi-VN').format(new Date(song.createdAt))}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center py-10 text-slate-500 dark:text-slate-400">Nhà phát triển này chưa đăng bài hát nào.</td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatorDetailPage;