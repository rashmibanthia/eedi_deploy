import React from 'react';


interface Misconception {
  id: number;
  title: string;
  confidence: number;
}

interface QuestionInfo {
  subject: string;
  topic: string;
  student_answer: string;
}

interface Analysis {
  question_info: QuestionInfo;
  misconceptions: Misconception[];
  total_misconceptions: number;
}

interface QuizAnalysisProps {
  analysis?: {
    analysis: Analysis;
  };
}

export const QuizAnalysis: React.FC<QuizAnalysisProps> = ({ analysis }) => {
  if (!analysis?.analysis?.misconceptions) {
    return null;
  }

  const { misconceptions, question_info } = analysis.analysis;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Analysis Results</h2>
        <div className="bg-gray-50 p-4 rounded-md mb-4">
          <p><span className="font-semibold">Subject:</span> {question_info.subject}</p>
          <p><span className="font-semibold">Topic:</span> {question_info.topic}</p>
          <p><span className="font-semibold">Student Answer:</span> {question_info.student_answer}</p>
        </div>
      </div>

      <div className="space-y-4">
        {misconceptions.map((misconception: Misconception) => (
          <div 
            key={misconception.id} 
            className="border-l-4 border-blue-500 pl-4 py-2 bg-white rounded-md shadow-sm"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg">{misconception.title}</h3>
              {/* <span className="text-sm text-gray-500">
                {(misconception.confidence * 100).toFixed(1)}%
              </span> */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
