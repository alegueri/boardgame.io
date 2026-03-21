interface ProblemDisplayProps {
  question: string;
  techniqueId: string;
  problemIndex: number;
  totalProblems: number;
}

export function ProblemDisplay({ question, problemIndex, totalProblems }: ProblemDisplayProps) {
  return (
    <div className="mm-problem-display">
      <div className="mm-problem-counter">{problemIndex + 1} / {totalProblems}</div>
      <div className="mm-problem-question">{question} = ?</div>
    </div>
  );
}
