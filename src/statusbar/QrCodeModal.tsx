import QRCode from "qrcode";
import { useEffect } from "react";

import { Modal } from "../Modal.tsx";

import "./qr-code-modal.css";

export type QrCodeModalProps = {
  open: boolean;
  serverIp: string;
  onClose: () => void;
};

export function QrCodeModal({ open, serverIp, onClose }: QrCodeModalProps) {
  const url = `http://${serverIp}`;

  return (
    <Modal
      open={open}
      onClose={onClose}
      footer={
        <div className="col align-items-center justify-content-center">
          <button onClick={onClose}>CLOSE</button>
        </div>
      }
    >
      <div className="col align-items-center justify-content-center m24-t">
        <div style={{ fontSize: "0.75em" }}>{url}</div>
        <QrCode serverAddress={url} />
      </div>
    </Modal>
  );
}

type QrCodeProps = {
  serverAddress: string;
};

function QrCode({ serverAddress }: QrCodeProps) {
  useEffect(() => {
    const canvas = document.getElementById("qr-code");
    if (canvas) {
      QRCode.toCanvas(canvas, serverAddress, {
        width: 200,
        color: { dark: "#fff", light: "#000" },
      });
    }
  }, []);
  return <canvas id="qr-code"></canvas>;
}
