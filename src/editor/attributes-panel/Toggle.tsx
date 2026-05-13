import { MdToggleOff, MdToggleOn } from "react-icons/md";

export type ToggleProps = {
  size?: number;
  onToggle: () => void;
  value: boolean;
  leftLabel?: string;
  rightLabel?: string;
};

export function Toggle({
  size = 32,
  onToggle,
  value,
  leftLabel,
  rightLabel,
}: ToggleProps) {
  const Component = value ? MdToggleOn : MdToggleOff;

  return (
    <div className="row align-items-center gap-8">
      {leftLabel && (
        <span
          style={{
            opacity: value ? 0.4 : 1.0,
            color: value ? undefined : "var(--gradient-stop1)",
          }}
        >
          {leftLabel}
        </span>
      )}
      <Component
        size={size}
        color={
          value && !Boolean(leftLabel) ? "var(--gradient-stop1)" : undefined
        }
        onClick={onToggle}
        className="pointer"
      />
      {rightLabel && (
        <span
          style={{
            opacity: value ? 1.0 : 0.4,
            color: value ? "var(--gradient-stop1)" : undefined,
          }}
        >
          {rightLabel}
        </span>
      )}
    </div>
  );
}
