import { useState } from "react";
import { PiCaretDown, PiCaretRight } from "react-icons/pi";

export type CollapsibleSectionProps = {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
};

export function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="collapsible-section">
      <button
        className="collapsible-section-header"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <PiCaretDown size={12} /> : <PiCaretRight size={12} />}
        <span>{title}</span>
      </button>
      {open && <div className="collapsible-section-body">{children}</div>}
    </div>
  );
}
