import React, { useState, useEffect } from 'react';
import Modal from '../../../components/common/Modal';
import { adminService } from '../services/adminService';
import { Loader2, Music, User, Tag, Crown } from 'lucide-react';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.muzo.com.vn';

const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start">
        <Icon className="w-4 h-4 mr-3 mt-1 text-slate-400 flex-shrink-0" />
        <div className="flex-grow">
            <span className="font-semibold text-slate-600 dark:text-slate-300">{label}:</span>
            <span className="ml-2">{value}</span>
        </div>
    </div>
);

const SubmissionDetailModal = ({ isOpen, onClose, submissionId }) => {
    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && submissionId) {
            const fetchDetails = async () => {
                setLoading(true);
                try {
                    const response = await adminService.getSubmissionDetails(submissionId);
                    if (response.success) {
                        setSubmission(response.data);
                    } else {
                        toast.error(response.message || "Không thể tải chi tiết.");
                    }
                } catch (error) {
                    toast.error("Lỗi khi tải chi tiết yêu cầu.");
                } finally {
                    setLoading(false);
                }
            };
            fetchDetails();
        }
    }, [isOpen, submissionId]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết Yêu cầu" size="2xl">
            {loading && <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin w-8 h-8 text-cyan-500" /></div>}

            {!loading && submission && (
                <div className="space-y-6 p-2">
                    <div className="flex flex-col md:flex-row gap-6">
                        <img
                            src={submission.thumbnailPath ? `${API_BASE_URL}${submission.thumbnailPath}` : 'https://via.placeholder.com/150'}
                            alt={submission.title}
                            className="w-full md:w-48 h-48 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-grow space-y-2">
                            <h3 className="text-2xl font-bold">{submission.title}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Gửi bởi: <strong>{submission.creatorName}</strong></p>
                            {submission.description && <p className="text-sm pt-2 whitespace-pre-wrap">{submission.description}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <InfoRow
                            icon={Music}
                            label="Ca sĩ"
                            value={submission.singers?.map(s => s.name).join(', ') || 'N/A'}
                        />
                        <InfoRow
                            icon={Tag}
                            label="Thể loại"
                            value={submission.tags?.map(t => t.name).join(', ') || 'N/A'}
                        />
                        <InfoRow
                            icon={Crown}
                            label="Loại"
                            value={submission.isPremium ? 'Premium' : 'Free'}
                        />
                    </div>

                    <div>
                        <h4 className="font-semibold mb-2">Audio Preview</h4>
                        <audio controls className="w-full">
                            <source src={`${API_BASE_URL}${submission.filePath}`} type="audio/mpeg" />
                            Trình duyệt của bạn không hỗ trợ phát audio.
                        </audio>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default SubmissionDetailModal;