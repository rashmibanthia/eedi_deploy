interface MisconceptionResultsProps {
  misconceptions: string[];
}

const MisconceptionResults: React.FC<MisconceptionResultsProps> = ({ misconceptions }) => {
  if (!misconceptions || misconceptions.length === 0) {
    return null;
  }

  return (
    <div className="max-w-lg mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Top 25 Misconceptions</h2>
      <div className="space-y-2">
        {misconceptions.map((misconception, index) => (
          <div 
            key={index}
            className="p-3 bg-gray-100 rounded"
          >
            <span className="font-bold">{index + 1}.</span> {misconception}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MisconceptionResults;