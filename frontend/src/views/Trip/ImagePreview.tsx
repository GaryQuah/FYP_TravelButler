import React, { useState } from "react";
import "../../assets/css/ImagePreview.css";

interface ImagePreviewProps {
  src: string;
  alt: string;
  children: React.ReactNode;
}

export function ImagePreview({ src, alt, children }: ImagePreviewProps) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{ position: "relative", display: "inline-block" }}
    >
      {/* _blank: Open in a new tab , noreferrer: Prevents referrer information from being sent with the request. */}
      <a href={src} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
      {isHovering && (
        <div className="image-preview-container">
          <img src={src} alt={alt} style={{ maxWidth: "200px" }} />
        </div>
      )}
    </div>
  );
}
