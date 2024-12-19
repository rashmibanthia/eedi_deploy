// src/utils/dataProcessor.js
import axios from 'axios';
import { API_BASE_URL } from '../services/misconceptionService';

export const loadSubjectsAndConstructs = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/subjects-and-constructs`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    const data = response.data;
    if (!data.subjects || !data.constructs) {
      throw new Error('Invalid data format received');
    }
    
    return {
      subjects: data.subjects.filter(Boolean),
      constructs: data.constructs.filter(Boolean)
    };
  } catch (error) {
    console.error('Failed to load subjects and constructs:', 
      axios.isAxiosError(error) ? error.response?.data : error.message
    );
    throw error;
  }
};