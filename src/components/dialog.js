import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

// Dialog component using CSS classes (LESS-friendly)
// No inline styles — all styling moved to classes
// You can now style everything in dialog.less

export default function Dialog({
  open,
  onClose,
  onOk,
  onCancel,
  title = "Dialog",
  children,
  okText = "OK",
  cancelText = "Cancel",
  showCancel = true,
  closeOnBackdrop = true,
  blockBackground = true,
  buttons = null,
  header
}) {
  const dialogRef = useRef(null);
  const previouslyFocused = useRef(null);

  const [pos, setPos] = useState({ x: null, y: null });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!open) return;
    if (pos.x === null && typeof window !== "undefined") {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const width = 400;
      const height = 200;
      setPos({ x: (vw - width) / 2, y: (vh - height) / 2 });
    }
  }, [open]);

  function onMouseDown(e) {
    if (e.button !== 0) return;
    setDragging(true);
    dragStart.current = {
      x: e.clientX - (pos.x || 0),
      y: e.clientY - (pos.y || 0),
    };
  }

  function onMouseMove(e) {
    if (!dragging) return;
    setPos({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  }

  function onMouseUp() {
    setDragging(false);
  }

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragging]);

  // Focus / scroll lock
  useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement;
      requestAnimationFrame(() => {
        const el = dialogRef.current;
        if (!el) return;
        const focusable = el.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        (focusable || el).focus();
      });
      if (blockBackground) document.body.style.overflow = "hidden";
    }
    return () => {
      if (blockBackground) document.body.style.overflow = "";
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  // ESC + focus trap
  useEffect(() => {
    function onKey(e) {
      if (!open) return;
      if (e.key === "Escape") onClose?.();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className={`dialog-backdrop ${blockBackground ? "modal-backdrop" : "no-block"}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (!blockBackground) return;
            // if (e.target === e.currentTarget && closeOnBackdrop) onClose?.();
          }}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal={blockBackground ? "true" : "false"}
            aria-label={title}
            tabIndex={-1}
            className="dialog-window"
            style={{ left: pos.x ?? 0, top: pos.y ?? 0 }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="dialog-header" onMouseDown={onMouseDown}>
              <table style={{ width: "100%"}}>
                <tr>
                  <td style={{ width: "100%", display: "inline-block" }}>
                    <div className="dialog-title" style={{ display: "inline-block" }}>{title}</div>
                    <button className="dialog-close" style={{ display: "inline-block", float:"right" }} onClick={onClose}>×</button>
                  </td>
                </tr>
                <tr>
                  <td>
                      {header}
                  </td>
                </tr>
              </table>

            </div>

            <div className="dialog-body">{children}</div>

            {buttons && buttons.length !== 0 ?
              <div className="dialog-footer">
                {buttons && Array.isArray(buttons) ? (
                  buttons.map((btn, i) => (
                    <button
                      key={i}
                      className={`dialog-btn ${btn.primary ? "primary" : ""}`}
                      onClick={btn.onClick}
                    >
                      {btn.label}
                    </button>
                  ))
                ) : (
                  <>
                    {showCancel && (
                      <button className="dialog-btn" onClick={() => onCancel?.() || onClose?.()}>
                        {cancelText}
                      </button>
                    )}
                    <button className="dialog-btn primary" onClick={() => onOk?.()}>
                      {okText}
                    </button>
                  </>
                )}
              </div> : null}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
