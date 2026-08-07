import { axiosClient } from '../../api/axiosClient';

export interface ProfileUpdateRequest {
    fullName?: string;
    phoneNumber?: string;
    gender?: string;
    highestQualification?: string;
}

export const profileService = {
    updateProfile: async (data: ProfileUpdateRequest) => {
        const response = await axiosClient.put('/profile/update', data);
        return response.data; // Returns the updated User object
    },

    uploadProfilePicture: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        
        // Axios automatically sets the correct multipart/form-data boundary when using FormData
        const response = await axiosClient.post('/profile/picture', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data; // Returns the new image URL string
    }
};