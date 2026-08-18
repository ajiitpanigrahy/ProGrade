import { axiosClient } from '../../api/axiosClient';

export const chatService = {
    searchUser: async (email: string) => {
        const res = await axiosClient.get(`/chat/search?email=${email}`);
        return res.data;
    },
    getRooms: async () => {
        const res = await axiosClient.get('/chat/rooms');
        return res.data;
    },
    getMessages: async (roomId: number) => {
        const res = await axiosClient.get(`/chat/room/${roomId}/messages`);
        return res.data;
    },
    sendMessage: async (targetEmail: string, content: string, fileUrl?: string, fileName?: string, isViewOnce: boolean = false) => {
        const res = await axiosClient.post('/chat/send', { targetEmail, content, fileUrl, fileName, isViewOnce });
        return res.data;
    },
    updateRoomStatus: async (roomId: number, action: 'ACCEPT' | 'BLOCK' | 'UNBLOCK') => {
        const res = await axiosClient.patch(`/chat/room/${roomId}/status?action=${action}`);
        return res.data;
    },
    markSeen: async (roomId: number) => {
        await axiosClient.patch(`/chat/room/${roomId}/seen`);
    },
    sendTyping: async (roomId: number, isTyping: boolean) => {
        await axiosClient.post(`/chat/room/${roomId}/typing?isTyping=${isTyping}`);
    }
};