import {LogEntry} from "../types/websocket.ts";
import {useLogs} from "../hooks/useLogs.tsx";
import {Modal} from "../Modal.tsx";

export type LogsModalProps = {
  open: boolean,
  onClose: () => void;
};

export function LogsModal({ open, onClose }: LogsModalProps) {
  const { logs } = useLogs();
  return (
    <Modal
      open={open}
      onClose={onClose}
      header={<h2 className="text-center">Logs</h2>}
      footer={
        <div className="row justify-content-center align-items-center">
          <button onClick={onClose}>Close</button>
        </div>
      }
    >
      <div className="col flex-grow no-overflow">
        <div className="logs-container flex-grow">
          {logs.length === 0 && "No logs"}
          {logs.map(entry => <LogLine key={entry.timestamp} entry={entry} />)}
        </div>
      </div>
    </Modal>
  );
}

const colorMap: Record<string, string> = {
  ERROR: "#ff4646",
  WARN: "#ffda56",
  INFO: "#00c4ff"
};

type LogLineProps = { entry: LogEntry };

function LogLine({ entry }: LogLineProps) {
  return (
    <div className="log-line">
      <span style={{ color: colorMap[entry.level] ?? "white" }}>[{entry.level}] - {entry.message}</span>
    </div>
  );
}
