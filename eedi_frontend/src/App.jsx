import { useState } from 'react';
import QuestionForm from './components/QuestionForm';
import { QuizAnalysis } from './components/QuizAnalysis';
import { analyzeAnswer } from './services/misconceptionService';

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleFormSubmit = async (formData) => {
    try {
      console.log('Form data being sent:', formData);
      
      // Call the API with the form data
      const result = await analyzeAnswer({
        question: formData.question,
        correct_answer: formData.correctAnswer,
        incorrect_answer: formData.incorrectAnswer,
        subject: formData.subject,
        topic: formData.topic
      });

      console.log('API Response:', result);
      setAnalysisResult(result);
      
    } catch (error) {
      console.error('Error analyzing answer:', error);
    }
  };

  // return (
  //   <div className="min-h-screen bg-gray-50 py-8">
  //     <div className="container mx-auto">
  //       <h1 className="text-3xl font-bold text-center mb-8">
  //         EEDI - Math Misconceptions Analyzer
  //       </h1>
  //       <QuestionForm onSubmit={handleFormSubmit} />
  //       <div className="mt-8">
  //         {analysisResult && <QuizAnalysis analysis={analysisResult} />}
  //       </div>
  //     </div>
  //   </div>
  // );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-4">
          EEDI - Math Misconceptions Analyzer
        </h1>
        <div className="text-center text-sm text-gray-600 mb-8">
          EEDI Kaggle Competition (Rank 13th) ➡️ Team - Nicholas, Abdullah, Benedikt, Rashmi
        </div>
        <QuestionForm onSubmit={handleFormSubmit} />
        <div className="mt-8">
          {analysisResult && <QuizAnalysis analysis={analysisResult} />}
        </div>
      </div>
    </div>
);

}

export default App;
