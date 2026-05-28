import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { MdOutlineQrCode2 } from "react-icons/md";

import { useDevices } from "../hooks/useDevices.tsx";
import { LogsProvider } from "../hooks/useLogs.tsx";
import { LogsModal } from "./LogsModal.tsx";
import { QrCodeModal } from "./QrCodeModal.tsx";

import "./status-bar.css";

type ModalType = "qr" | "logs";

export default function StatusBar() {
  const [serverIp, setServerIp] = useState("");
  const [modal, setModal] = useState<ModalType | null>(null);
  const { devices } = useDevices();

  useEffect(() => {
    invoke<string>("get_mobile_client_server_address")
      .then(setServerIp)
      .catch(() => setServerIp("unknown"));
  }, []);

  return (
    <LogsProvider>
      <div className="status-bar row justify-content-space-between relative">
        <div>{devices.length} client(s) connected</div>
        <div className="row align-items-center gap-16">
          <span>http://{serverIp}</span>
          <MdOutlineQrCode2
            size={20}
            onClick={() => setModal("qr")}
            className="pointer qr-icon"
          />
        </div>

        <div className="centered-statusbar-container row justify-content-center align-items-center">
          <a href="#" onClick={() => setModal("logs")}>
            Logs
          </a>
        </div>
      </div>
      <QrCodeModal
        open={modal === "qr"}
        serverIp={serverIp}
        onClose={() => setModal(null)}
      />
      <LogsModal open={modal === "logs"} onClose={() => setModal(null)} />
    </LogsProvider>
  );
}
