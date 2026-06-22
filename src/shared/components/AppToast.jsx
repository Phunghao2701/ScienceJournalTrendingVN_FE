/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: shared\components\AppToast.jsx
 */
import { useEffect, useState } from "react";
import { Toast, ToastContainer } from "react-bootstrap";
import { Icon } from "@iconify/react";
import { registerToast } from "../utils/toast";

const TOAST_CONFIG = {
  success: {
    icon: "solar:check-circle-bold",
    bg: "#f0fdf4",
    border: "#22c55e",
    color: "#166534",
  },
  error: {
    icon: "solar:close-circle-bold",
    bg: "#fef2f2",
    border: "#ef4444",
    color: "#991b1b",
  },
  warning: {
    icon: "solar:danger-triangle-bold",
    bg: "#fffbeb",
    border: "#f59e0b",
    color: "#92400e",
  },
  info: {
    icon: "solar:info-circle-bold",
    bg: "#eff6ff",
    border: "#3b82f6",
    color: "#1e40af",
  },
};

export default function AppToast() {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("info");

  useEffect(() => {
    registerToast(({ message, variant = "info" }) => {
      setMessage(message);
      setVariant(variant);
      setShow(true);
    });
  }, []);

  const config = TOAST_CONFIG[variant] || TOAST_CONFIG.info;

  return (
    <ToastContainer
      position="top-end"
      className="p-4"
      style={{ zIndex: 9999 }}
    >
      <Toast
        show={show}
        autohide
        delay={3500}
        onClose={() => setShow(false)}
        animation
        className="border-0 shadow-lg"
        style={{
          minWidth: 360,
          background: config.bg,
          borderLeft: `4px solid ${config.border}`,
          borderRadius: 16,
        }}
      >
        <Toast.Body className="d-flex align-items-center gap-3 p-3">
          <Icon
            icon={config.icon}
            width={24}
            style={{
              color: config.border,
              flexShrink: 0,
            }}
          />

          <div
            className="flex-grow-1"
            style={{
              color: config.color,
              fontSize: 14,
              fontWeight: 500,
              lineHeight: 1.5,
            }}
          >
            {message}
          </div>

          <button
            onClick={() => setShow(false)}
            className="btn btn-sm p-0 border-0 bg-transparent"
          >
            <Icon
              icon="solar:close-circle-outline"
              width={20}
              color="#94a3b8"
            />
          </button>
        </Toast.Body>
      </Toast>
    </ToastContainer>
  );
}