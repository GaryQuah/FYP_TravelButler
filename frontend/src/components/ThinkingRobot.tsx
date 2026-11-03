import "../assets/css/ThinkingRobot.css";

interface ThinkingRobotProps {
  label?: string;
}

export default function ThinkingRobot({
  label = "Analyzing your response...",
}: ThinkingRobotProps) {
  return (
    <div className="thinking-robot" role="status" aria-live="polite">
      <div className="thinking-robot-icon" aria-hidden="true">
        <i className="bi bi-robot"></i>
        <i className="bi bi-three-dots thinking-robot-dots"></i>
      </div>
      <span>{label}</span>
    </div>
  );
}
