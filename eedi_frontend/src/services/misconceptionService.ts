import axios from 'axios';


const isProd = import.meta.env.PROD;
const modalUrl = 'https://rashmibanthia--eedi-misconception-analyzer.modal.run';

export const API_BASE_URL = isProd
  ? `${modalUrl}/api`
  : 'http://localhost:8000/api';

// Debug the environment
console.log('Environment:', {
    isProd: import.meta.env.PROD,
    isDev: import.meta.env.DEV,
    mode: import.meta.env.MODE,
    baseUrl: API_BASE_URL
});

export const analyzeAnswer = async (quizData: {
    question: string;
    correct_answer: string;
    incorrect_answer: string;
    subject: string;
    topic: string;
}) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/misconceptions/analyze`,
            quizData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 10000,
            }
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('API Error:', error.response?.data || error.message);
        }
        throw error;
    }
};