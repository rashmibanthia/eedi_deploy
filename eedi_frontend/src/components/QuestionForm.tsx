import React, { useState, useEffect } from 'react';
import { Listbox } from '@headlessui/react';
import { loadSubjectsAndConstructs } from '../utils/dataProcessor.ts';

interface FormData {
  question: string;
  correctAnswer: string;
  incorrectAnswer: string;
  subject: string;
  topic: string;
}

interface AvailableOptions {
  subjects: string[];
  constructs: string[];
}

interface QuestionFormProps {
  onSubmit: (data: FormData) => void;
}

interface SelectDropdownProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}



function QuestionForm({ onSubmit }: QuestionFormProps) {
  const [formData, setFormData] = useState<FormData>({
    question: '',
    correctAnswer: '',
    incorrectAnswer: '',
    subject: '',
    topic: ''
  });
  
  const [availableOptions, setAvailableOptions] = useState<AvailableOptions>({
    subjects: [],
    constructs: []
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await loadSubjectsAndConstructs();
        if (data.subjects.length === 0 && data.constructs.length === 0) {
          throw new Error('No subjects or constructs available');
        }
        setAvailableOptions(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Add error and loading states to the UI
  if (error) {
    return (
      <div className="text-red-500 p-4">
        Error loading options: {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-blue-500 p-4">
        Loading subjects and topics...
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Reusable dropdown component
  const SelectDropdown: React.FC<SelectDropdownProps> = ({ label, options, value, onChange }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <Listbox value={value} onChange={onChange}>
        <div className="relative mt-1">
          <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <span className="block truncate">
              {value || `Select a ${label.toLowerCase()}...`}
            </span>
          </Listbox.Button>
          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {options.map((option) => (
              <Listbox.Option
                key={option}
                value={option}
                className={({ active }) =>
                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                    active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                  }`
                }
              >
                {({ selected }) => (
                  <>
                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                      {option}
                    </span>
                    {selected && (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                        ✓
                      </span>
                    )}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Math Question
          </label>
          <textarea
            name="question"
            value={formData.question}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={2}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correct Answer
            </label>
            <input
              type="text"
              name="correctAnswer"
              value={formData.correctAnswer}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Incorrect Answer
            </label>
            <input
              type="text"
              name="incorrectAnswer"
              value={formData.incorrectAnswer}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectDropdown
            label="Subject"
            options={availableOptions.subjects}
            value={formData.subject}
            onChange={(selected) => setFormData(prev => ({ ...prev, subject: selected }))}
          />

          <SelectDropdown
            label="Topic"
            options={availableOptions.constructs}
            value={formData.topic}
            onChange={(selected) => setFormData(prev => ({ ...prev, topic: selected }))}
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 px-6 rounded-md hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
      >
        Analyze Misconceptions
      </button>
    </form>
  );
}

export default QuestionForm;