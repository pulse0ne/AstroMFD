import { CSSProperties, ReactNode } from "react";
import Popup from "reactjs-popup";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  contentStyle?: CSSProperties;
  overlayStyle?: CSSProperties;
  className?: string;
};

export function Modal({
  open,
  onClose,
  header,
  footer,
  children,
  contentStyle,
  overlayStyle,
  className,
}: ModalProps) {
  return (
    <Popup
      modal
      open={open}
      onClose={onClose}
      closeOnDocumentClick
      contentStyle={{
        border: "var(--border-light)",
        width: "50%",
        maxWidth: "1000px",
        maxHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 9999999,
        ...contentStyle,
      }}
      overlayStyle={{
        backgroundColor: "rgba(55, 55, 55, 0.25)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999998,
        ...overlayStyle,
      }}
    >
      <div className={`modal-root col fill-x ${className || ""}`}>
        {header && (
          <div
            className="modal-header border-bottom p16"
            style={{ flexShrink: 0 }}
          >
            {header}
          </div>
        )}

        <div className="modal-content flex-grow scroll-y p16">{children}</div>

        {footer && (
          <div className="modal-footer border-t p16" style={{ flexShrink: 0 }}>
            {footer}
          </div>
        )}
      </div>
    </Popup>
  );
}
