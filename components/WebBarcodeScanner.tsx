// components/WebBarcodeScanner.tsx

import React, { useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
// You might need to change the import path if 'html5-qrcode' does not export directly
import { Html5Qrcode } from "html5-qrcode";

// Unique ID for the HTML element where the camera feed will be rendered
const qrcodeRegionId = "html5qr-code-full-region";

interface WebBarcodeScannerProps {
  onScanSuccess: (data: string) => void;
}

export function WebBarcodeScanner({ onScanSuccess }: WebBarcodeScannerProps) {
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  const qrCodeSuccessCallback = (decodedText: string) => {
    // Call the external handler
    if (html5QrCodeRef.current?.isScanning) {
      onScanSuccess(decodedText);
      // Optional: stop scanning after the first successful scan
      html5QrCodeRef.current.stop().catch(console.error);
    }
  };

  useEffect(() => {
    // Ensure the DOM element is available
    const element = document.getElementById(qrcodeRegionId);
    if (!element) return;

    // Initialize the scanner only once
    if (html5QrCodeRef.current === null) {
      html5QrCodeRef.current = new Html5Qrcode(qrcodeRegionId);
    }

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      videoConstraints: { facingMode: "environment" as const }, // Request rear camera
      disableFlip: false,
    };

    // Start scanning session
    if (!html5QrCodeRef.current.isScanning) {
      html5QrCodeRef.current
        .start(
          { facingMode: "environment" as const },
          config,
          qrCodeSuccessCallback,
          // On scan failure (no code detected), do nothing
          (errorMessage) => {
            /* console.log("No code found:", errorMessage) */
          }
        )
        .catch((err) => {
          console.error(
            "Failed to start scanning on web. Ensure your browser grants camera permission.",
            err
          );
        });
    }

    // Cleanup function: stop the camera when the component is unmounted
    return () => {
      if (html5QrCodeRef.current?.isScanning) {
        html5QrCodeRef.current.stop().catch(console.error);
        html5QrCodeRef.current = null;
      }
    };
  }, [onScanSuccess]);

  return (
    <View style={styles.container}>
      {/* The scanner requires a standard HTML div to render the camera feed into */}
      <div id={qrcodeRegionId} style={styles.scannerRegion} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  // The div element must have width/height to show the video feed
  scannerRegion: {
    width: "100%",
    height: "100%",
  },
});
