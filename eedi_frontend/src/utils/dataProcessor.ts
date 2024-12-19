import axios from 'axios';
import { API_BASE_URL } from '../services/misconceptionService';

interface SubjectsAndConstructsResponse {
  subjects: string[];
  constructs: string[];
}

export const loadSubjectsAndConstructs = async (): Promise<SubjectsAndConstructsResponse> => {
  try {
    const response = await axios.get<SubjectsAndConstructsResponse>(
      `${API_BASE_URL}/subjects-and-constructs`,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );
    
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
      axios.isAxiosError(error) ? error.response?.data : (error as Error).message
    );
    throw error;
  }
};