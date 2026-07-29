import React, { useState } from "react";

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
      <a href={src} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
      {isHovering && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: "0",
            zIndex: 1,
            border: "1px solid #ccc",
            background: "#fff",
            padding: "5px",
          }}
        >
          <img src={src} alt={alt} style={{ maxWidth: "200px" }} />
        </div>
      )}
    </div>
  );
}
