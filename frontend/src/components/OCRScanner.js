import React, { useState } from "react";
import Tesseract from "tesseract.js";

const OCRScanner = ({ onScanComplete }) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    Tesseract.recognize(file, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          setProgress(Math.floor(m.progress * 100));
        }
      },
    })
      .then(({ data: { text } }) => {
        setLoading(false);
        console.log("Scanned Text:", text);
        // Simple heuristic to guess medicine name (first meaningful line)
        const lines = text.split("\n").filter((line) => line.trim().length > 3);
        const guessedName = lines[0] || "";
        const guessedDosage =
          lines.find((l) => l.includes("mg") || l.includes("ml")) || "";

        onScanComplete({ name: guessedName, dosage: guessedDosage });
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  return (
    <div
      style={{
        marginBottom: "20px",
        padding: "15px",
        border: "1px dashed #0061f2",
        borderRadius: "8px",
      }}
    >
      <h4>📷 Smart Scan (OCR)</h4>
      <p style={{ fontSize: "0.8rem", color: "#666" }}>
        Upload a prescription to auto-fill details.
      </p>
      <input type="file" onChange={handleImageUpload} accept="image/*" />

      {loading && (
        <div style={{ marginTop: "10px" }}>
          <span>Processing... {progress}%</span>
          <div
            style={{
              width: "100%",
              background: "#eee",
              height: "5px",
              marginTop: "5px",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                background: "#0061f2",
                height: "100%",
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OCRScanner;
