import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "../assets/css/LoadingOverlay.css";

export const MIN_LOADING_DURATION_MS = 600;

/**
 * Translucent full-screen loading overlay with an animated hourglass.
 *
 * Usage:
 *   <LoadingOverlay show={isLoading} label="Saving…" />
 */

export interface LoadingOverlayProps {
  /** Whether the overlay should be showing. */
  show?: boolean;
  /** Text under the hourglass. Pass "" to hide it. */
  label?: string;
}

export default function LoadingOverlay({
  show = true,
  label = "Loading…",
}: LoadingOverlayProps) {
  const [isVisible, setIsVisible] = useState(show);
  const shownAtRef = useRef<number | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    if (show) {
      shownAtRef.current = Date.now();
      return;
    }

    if (!shownAtRef.current) {
      return;
    }

    const elapsed = Date.now() - shownAtRef.current;
    const remaining = Math.max(MIN_LOADING_DURATION_MS - elapsed, 0);

    hideTimerRef.current = setTimeout(() => {
      setIsVisible(false);
      shownAtRef.current = null;
      hideTimerRef.current = null;
    }, remaining);

    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [show]);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  if (!show && !isVisible) return null;

  const overlay = (
    <div
      className="lo-backdrop"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <svg
        className="lo-hourglass"
        viewBox="0 0 56 80"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          {/* Clip sand to the glass interior */}
          <clipPath id="lo-top-bulb">
            <path d="M10 8 H46 L30 38 H26 Z" />
          </clipPath>
          <clipPath id="lo-bottom-bulb">
            <path d="M26 42 H30 L46 72 H10 Z" />
          </clipPath>
        </defs>

        {/* Sand */}
        <g clipPath="url(#lo-top-bulb)">
          <rect
            className="lo-sand-top"
            x="8"
            y="8"
            width="40"
            height="30"
            fill="#f5c26b"
          />
        </g>
        <g clipPath="url(#lo-bottom-bulb)">
          <rect
            className="lo-sand-bottom"
            x="8"
            y="42"
            width="40"
            height="30"
            fill="#f5c26b"
          />
        </g>
        <line
          className="lo-stream"
          x1="28"
          y1="38"
          x2="28"
          y2="68"
          stroke="#f5c26b"
          strokeWidth="1.5"
        />

        {/* Glass outline */}
        <path
          d="M10 8 H46 L30 38 V42 L46 72 H10 L26 42 V38 Z"
          stroke="#fff"
          strokeWidth="2.5"
          strokeLinejoin="round"
          fill="rgba(255,255,255,0.08)"
        />

        {/* Caps */}
        <rect x="6" y="3" width="44" height="5" rx="2.5" fill="#fff" />
        <rect x="6" y="72" width="44" height="5" rx="2.5" fill="#fff" />
      </svg>

      {label && <div className="lo-label">{label}</div>}
    </div>
  );

  // Render straight into <body> so parent transforms, overflow or z-index
  // can't clip or hide the fixed-position overlay.
  return typeof document === "undefined"
    ? overlay
    : createPortal(overlay, document.body);
}
