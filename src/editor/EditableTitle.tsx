import {CSSProperties, useEffect, useRef, useState} from "react";
import {MdEdit} from "react-icons/md";

export type EditableTitleProps = {
  value: string;
  onChange: (newValue: string) => void;
  className?: string;
  style?: CSSProperties;
  inputStyle?: CSSProperties;
  editIcon?: boolean;
  iconSize?: number;
};

export function EditableTitle({ value, onChange, className, style, inputStyle, editIcon, iconSize }: EditableTitleProps) {
  const [ editing, setEditing ] = useState(false);
  const [ draft, setDraft ] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleDoubleClick = () => {
    setDraft(value);
    setEditing(true);
  };

  const handleBlur = () => {
    setEditing(false);
    if (draft !== value) {
      onChange(draft.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleBlur();
    } else if (e.key === "Escape") {
      setEditing(false);
      setDraft(value);
    }
  };

  const mergedStyle = Object.assign({
    background: "transparent",
    border: "var(--border-light)",
    margin: 0,
    padding: 0
  } as CSSProperties, inputStyle ?? {});

  return (
    <div className={className} style={style} onDoubleClick={handleDoubleClick}>
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={mergedStyle}
        />
      ) : (
        <div className="row align-items-center gap-16">
          <span>{value}</span>
          {editIcon && (<MdEdit className="pointer" size={iconSize} onClick={handleDoubleClick} />)}
        </div>
      )}
    </div>
  );
}
