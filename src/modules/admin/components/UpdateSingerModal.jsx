import React, { useState, useEffect } from 'react';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import FileUpload from '../../../components/common/FileUpload';
import { adminService } from '../services/adminService';
import { toast } from 'react-toastify';
import { User, Mail } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.muzo.com.vn';

const UpdateSingerModal = ({ isOpen, onClose, singer, onSingerUpdated }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State riêng cho URL xem trước để không bị mất khi chọn lại file
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        if (singer) {
            setName(singer.name);
            setEmail(singer.email);
            setPreviewUrl(singer.avatarPath ? `${API_BASE_URL}${singer.avatarPath}` : '');
            setAvatarFile(null); // Reset file đã chọn khi mở lại modal
        }
    }, [singer, isOpen]);

    const handleFileChange = (file) => {
        setAvatarFile(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim() || !email.trim()) {
            toast.error("Tên và email không được để trống.");
            return;
        }

        setIsSubmitting(true);
        const singerRequest = { name, email };

        try {
            const response = await adminService.updateSingerByAdmin(singer.id, singerRequest, avatarFile);
            if (response.success) {
                toast.success("Cập nhật ca sĩ thành công!");
                onSingerUpdated(response.data);
                onClose();
            } else {
                toast.error(response.message || "Cập nhật ca sĩ thất bại.");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Đã có lỗi xảy ra.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!singer) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Chỉnh sửa ca sĩ: ${singer.name}`}>
            <form onSubmit={handleSubmit}>
                <div className="p-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="w-32 h-32 flex-shrink-0">
                            <FileUpload
                                onFileChange={handleFileChange}
                                existingFileUrl={previewUrl}
                                previewType="image"
                                className="w-full h-full"
                                accept="image/*"
                            />
                        </div>
                        <div className="w-full space-y-4">
                            <Input
                                label="Tên ca sĩ"
                                id="singerName"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                icon={User}
                                required
                            />
                            <Input
                                label="Email"
                                id="singerEmail"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                icon={Mail}
                                required
                            />
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-4 p-4 border-t border-slate-200 dark:border-slate-700">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
                        Hủy
                    </Button>
                    <Button type="submit" isLoading={isSubmitting}>
                        Lưu thay đổi
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default UpdateSingerModal;