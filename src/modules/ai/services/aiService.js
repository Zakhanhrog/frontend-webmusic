// frontend-webmusic/src/modules/ai/services/aiService.js

import { apiService } from "../../../shared/services/apiService";

const getAIRecommendations = async (moodDescription) => {
    try {
        const response = await apiService.post('/api/v1/ai/recommendations', { moodDescription });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch AI recommendations:", error);
        throw error;
    }
};

export const aiService = {
    getAIRecommendations,
};