import {MdToggleOff, MdToggleOn} from "react-icons/md";

export type ToggleProps = {
  size?: number;
  onToggle: () => void;
  value: boolean;
  leftLabel?: string;
  rightLabel?: string;
};

export function Toggle({ size = 32, onToggle, value, leftLabel, rightLabel }: ToggleProps) {
  const Component = value ? MdToggleOn : MdToggleOff;

  return (
    <div className="row align-items-center gap-12">
      {leftLabel && <span style={{ opacity: value ? 0.5 : 1.0 }}>{leftLabel}</span>}
      <Component
        size={size}
        color={value && !Boolean(leftLabel) ? "var(--gradient-stop1)" : undefined}
        onClick={onToggle}
        className="pointer"
      />
      {rightLabel && <span style={{ opacity: value ? 1.0 : 0.5 }}>{rightLabel}</span>}
    </div>
  );
}
