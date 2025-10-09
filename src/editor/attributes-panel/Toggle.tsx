import {MdToggleOff, MdToggleOn} from "react-icons/md";

export type ToggleProps = {
  size?: number;
  onToggle: () => void;
  value: boolean;
};

export function Toggle({ size = 32, onToggle, value }: ToggleProps) {
  const Component = value ? MdToggleOn : MdToggleOff;

  return (
    <Component
      size={size}
      color={value ? "var(--gradient-stop1)" : undefined}
      onClick={onToggle}
      className="pointer"
    />
  );
}
