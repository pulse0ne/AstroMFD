import { invoke } from "@tauri-apps/api/core";
import { CSSProperties, useEffect, useState } from "react";
import { MdAdd, MdDeleteForever, MdEditDocument } from "react-icons/md";
import { useNavigate } from "react-router";

import "./screen-set-selector.css";

import { ScreenSet } from "@common/shared/models";

import { EditableTitle } from "../editor/EditableTitle.tsx";
import { Modal } from "../Modal.tsx";

const bigText: CSSProperties = {
  fontSize: 24,
  fontWeight: "bold",
};

type ScreenSetMeta = {
  id: string;
  name: string;
  screenImgId: string | null;
};

export function ScreenSetSelector() {
  const [screenSets, setScreenSets] = useState<ScreenSetMeta[]>([]);
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [createScreenSetModalOpen, setCreateScreenSetModalOpen] =
    useState(false);
  const [screenImages, setScreenImages] = useState<Record<string, string>>({});
  const nav = useNavigate();

  useEffect(() => {
    invoke<ScreenSetMeta[]>("list_screen_sets").then(setScreenSets);
  }, []);

  useEffect(() => {
    screenSets
      .filter((ss) => Boolean(ss.screenImgId))
      .forEach((screenSet) => {
        invoke<ArrayBuffer>("get_screen_img", {
          id: screenSet.screenImgId,
        }).then((buf) => {
          const blob = new Blob([buf], { type: "application/octet-stream" });
          const url = URL.createObjectURL(blob);
          setScreenImages((ov) => ({ ...ov, [screenSet.id]: url }));
        });
      });
  }, [screenSets]);

  const handleRename = (id: string, name: string) => {
    invoke<ScreenSetMeta[]>("rename_screen_set", { id, name }).then(
      setScreenSets,
    );
  };

  const handleDelete = (id: string) => {
    setToDelete(id);
    setConfirmModalOpen(true);
  };

  const doDelete = () => {
    if (!toDelete) return;
    invoke<ScreenSetMeta[]>("delete_screen_set", { id: toDelete })
      .then(setScreenSets)
      .finally(() => setToDelete(null));
  };

  const createScreenSet = (name: string) => {
    invoke<ScreenSet>("create_screen_set", { name }).then((ss) =>
      nav(`/creator/${ss.id}`),
    );
  };

  const handleCreate = () => {
    setCreateScreenSetModalOpen(true);
  };

  return (
    <div className="no-overflow fill">
      <h1 className="text-center p16 border-b">Screen Sets</h1>
      <div className="scroll-y">
        <div className="screen-set-selector-container gap-24">
          {screenSets.map((ss) => (
            <ScreenSetItem
              key={ss.id}
              screenSet={ss}
              imgUrl={screenImages[ss.id]}
              onEdit={(id) => nav(`/creator/${id}`)}
              onRename={handleRename}
              onDelete={handleDelete}
            />
          ))}
          <div className="col align-items-center gap-8 p24">
            <div
              className="pointer col justify-content-center align-items-center screen-set-add-new-container border"
              onClick={handleCreate}
            >
              <MdAdd size={128} style={{ opacity: 0.7 }} />
            </div>
            <span style={bigText}>New</span>
          </div>
        </div>
      </div>
      <DeleteConfirmation
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={doDelete}
      />
      <CreateModal
        open={createScreenSetModalOpen}
        onClose={() => setCreateScreenSetModalOpen(false)}
        onConfirm={createScreenSet}
      />
    </div>
  );
}

type ScreenSetItemProps = {
  screenSet: ScreenSetMeta;
  imgUrl: string | undefined;
  onEdit: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
};

function ScreenSetItem({
  screenSet,
  imgUrl,
  onEdit,
  onRename,
  onDelete,
}: ScreenSetItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div className="col align-items-center gap-8 p24">
      <div
        className="screen-set-img-container border relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {imgUrl && (
          <img src={imgUrl} alt={screenSet.id} width="100%" height="100%" />
        )}
        {isHovered && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              backdropFilter: "blur(3px)",
            }}
            className="row justify-content-space-around p16"
          >
            <MdEditDocument
              onClick={() => onEdit(screenSet.id)}
              className="pointer"
              color="rgba(255, 255, 255, 0.8)"
              size={64}
            />
            <MdDeleteForever
              onClick={() => onDelete(screenSet.id)}
              className="pointer"
              color="rgba(255, 0, 0, 0.8)"
              size={64}
            />
          </div>
        )}
      </div>
      <EditableTitle
        className="text-center"
        style={bigText}
        inputStyle={{ textAlign: "center", ...bigText }}
        value={screenSet.name}
        onChange={(name) => onRename(screenSet.id, name)}
      />
    </div>
  );
}

type DeleteConfirmationProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

function DeleteConfirmation({
  open,
  onClose,
  onConfirm,
}: DeleteConfirmationProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      header={<h2 className="text-center">Confirm Delete</h2>}
      footer={
        <div className="row align-items-center justify-content-center gap-12">
          <button onClick={onClose}>Cancel</button>
          <button onClick={onConfirm} style={{ background: "rgb(255,0,59)" }}>
            Delete
          </button>
        </div>
      }
    >
      <div>Are you sure you want to permanently delete this Screen Set?</div>
    </Modal>
  );
}

type CreateModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
};

function CreateModal({ open, onClose, onConfirm }: CreateModalProps) {
  const [proposedName, setProposedName] = useState("Untitled ScreenSet");
  return (
    <Modal
      open={open}
      onClose={onClose}
      header={<h2 className="text-center">Create ScreenSet</h2>}
      footer={
        <div className="row align-items-center justify-content-center gap-16">
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={() => onConfirm(proposedName)}
            disabled={!proposedName}
          >
            Create
          </button>
        </div>
      }
    >
      <div>
        <p>Enter a name for the new ScreenSet:</p>
        <input
          value={proposedName}
          onChange={(evt) => setProposedName(evt.target.value)}
        />
      </div>
    </Modal>
  );
}
