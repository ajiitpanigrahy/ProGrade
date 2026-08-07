import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../features/profile/profileService';
import { X, User, Camera, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ProfileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ProfileDrawer({ isOpen, onClose }: ProfileDrawerProps) {
    const { user, updateUser } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // State
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        gender: '',
        highestQualification: ''
    });
    
    const [status, setStatus] = useState<{type: 'error' | 'success' | '', msg: string}>({ type: '', msg: '' });
    const [isUpdating, setIsUpdating] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    // Initialize form when opened
    useEffect(() => {
        if (user && isOpen) {
            setFormData({
                fullName: user.fullName || '',
                phoneNumber: user.phoneNumber || '',
                gender: user.gender || '',
                highestQualification: user.highestQualification || ''
            });
            setStatus({ type: '', msg: '' });
        }
    }, [user, isOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        setStatus({ type: '', msg: '' });

        try {
            const updatedUser = await profileService.updateProfile(formData);
            updateUser(updatedUser);
            setStatus({ type: 'success', msg: 'Profile updated successfully!' });
            setTimeout(onClose, 1500);
        } catch (error) {
            setStatus({ type: 'error', msg: 'Failed to update profile.' });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setStatus({ type: 'error', msg: 'Please upload a valid image file.' });
            return;
        }

        setIsUploadingImage(true);
        setStatus({ type: '', msg: '' });

        try {
            const imageUrl = await profileService.uploadProfilePicture(file);
            updateUser({ ...user, profilePictureUrl: imageUrl });
            setStatus({ type: 'success', msg: 'Profile picture updated!' });
        } catch (error) {
            setStatus({ type: 'error', msg: 'Failed to upload picture.' });
        } finally {
            setIsUploadingImage(false);
        }
    };

    const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : 'U';

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Slide-out Panel */}
            <div className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white dark:bg-[#0f0a1c] z-[60] shadow-2xl transform transition-transform duration-300 ease-in-out border-l border-gray-200 dark:border-purple-900/30 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-200 dark:border-purple-900/30 flex justify-between items-center bg-gray-50 dark:bg-[#150a29] shrink-0">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        My Profile
                    </h3>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-full transition-colors cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 flex-1 overflow-y-auto">
                    
                    {/* Status Message */}
                    {status.msg && (
                        <div className={`mb-6 p-3 text-sm rounded-xl flex items-center gap-2 ${
                            status.type === 'error' 
                                ? 'text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50' 
                                : 'text-green-600 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-900/50'
                        }`}>
                            {status.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                            <span>{status.msg}</span>
                        </div>
                    )}

                    {/* Profile Picture Section */}
                    <div className="flex flex-col items-center justify-center mb-8">
                        {/* Wrapper enforces strict circular bounds */}
                        <div 
                            className="relative group cursor-pointer w-24 h-24 rounded-full overflow-hidden border-4 border-purple-100 dark:border-purple-900/50 shadow-md" 
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {user?.profilePictureUrl ? (
                                <img 
                                    src={user.profilePictureUrl} 
                                    alt="Profile" 
                                    className={`w-full h-full object-cover transition-opacity ${isUploadingImage ? 'opacity-50' : 'group-hover:opacity-75'}`}
                                />
                            ) : (
                                <div className={`w-full h-full bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center text-white text-3xl font-bold transition-opacity ${isUploadingImage ? 'opacity-50' : 'group-hover:opacity-75'}`}>
                                    {getInitials(user?.fullName || '')}
                                </div>
                            )}
                            
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-6 h-6 text-white mb-1" />
                                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Change</span>
                            </div>
                        </div>
                        
                        {/* Hidden File Input */}
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleImageUpload} 
                            accept="image/jpeg, image/png, image/webp" 
                            className="hidden" 
                        />
                        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 font-semibold tracking-wider uppercase">
                            {user?.role} Account
                        </p>
                    </div>

                    {/* Form Details */}
                    <form id="profile-form" onSubmit={handleUpdateProfile} className="space-y-5">
                        
                        {/* Email (Read-only) */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
                            <input
                                type="email"
                                disabled
                                value={user?.email || ''}
                                className="block w-full px-4 py-3 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400 cursor-not-allowed"
                            />
                        </div>

                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                required
                                value={formData.fullName}
                                onChange={handleInputChange}
                                className="block w-full px-4 py-3 bg-white dark:bg-[#1a0d36] border border-gray-200 dark:border-purple-900/50 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none text-gray-900 dark:text-white transition-all"
                            />
                        </div>

                        {/* Phone Number with Flag and Limit */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Phone Number</label>
                            <div className="flex">
                                <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-gray-200 dark:border-purple-900/50 bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 sm:text-sm font-medium">
                                    🇮🇳 +91
                                </span>
                                <input
                                    type="text"
                                    name="phoneNumber"
                                    maxLength={10}
                                    placeholder="9876543210"
                                    value={formData.phoneNumber || ''}
                                    onChange={(e) => {
                                        // Strips out letters and special characters instantly
                                        const onlyDigits = e.target.value.replace(/\D/g, '');
                                        setFormData({ ...formData, phoneNumber: onlyDigits });
                                    }}
                                    className="block w-full px-4 py-3 bg-white dark:bg-[#1a0d36] border border-gray-200 dark:border-purple-900/50 rounded-r-xl focus:ring-2 focus:ring-purple-600 outline-none text-gray-900 dark:text-white transition-all"
                                />
                            </div>
                        </div>

                        {/* Gender Dropdown */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Gender</label>
                            <select
                                name="gender"
                                value={formData.gender || ''}
                                onChange={handleInputChange}
                                className="block w-full px-4 py-3 bg-white dark:bg-[#1a0d36] border border-gray-200 dark:border-purple-900/50 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none text-gray-900 dark:text-white transition-all appearance-none"
                            >
                                <option value="" disabled>Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                                <option value="Prefer not to say">Prefer not to say</option>
                            </select>
                        </div>

                        {/* Highest Qualification */}
                        {user?.role === 'STUDENT' && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Highest Qualification</label>
                                <select
                                    name="highestQualification"
                                    value={formData.highestQualification || ''}
                                    onChange={handleInputChange}
                                    className="block w-full px-4 py-3 bg-white dark:bg-[#1a0d36] border border-gray-200 dark:border-purple-900/50 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none text-gray-900 dark:text-white transition-all appearance-none"
                                >
                                    <option value="" disabled>Select Qualification</option>
                                    <option value="High School">High School</option>
                                    <option value="Diploma">Diploma</option>
                                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                                    <option value="Master's Degree">Master's Degree</option>
                                    <option value="PhD">PhD</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-200 dark:border-purple-900/30 bg-gray-50 dark:bg-[#150a29] shrink-0">
                    <button
                        type="submit"
                        form="profile-form"
                        disabled={isUpdating}
                        className="w-full flex justify-center py-3 px-4 rounded-xl shadow-sm text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 focus:ring-2 focus:ring-purple-600 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                    >
                        {isUpdating ? 'Saving Changes...' : 'Save Profile'}
                    </button>
                </div>
            </div>
        </>
    );
}