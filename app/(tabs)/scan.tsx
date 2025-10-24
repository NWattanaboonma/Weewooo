import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Header } from "@/components/Header";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useInventory } from "@/contexts/InventoryContext"; // Import useInventory hook
// Import the code scanner component
import { CodeScanner } from "@/components/CodeScanner";

const QUICK_TEST_SCANS = [
  "MED001",
  "EQP001",
  "MED002", // Added MED002 to quick scans for testing
  "SUP001",
  "EQP002",
  "SUP002",
];

// Allowed set for validation
const VALID_QR_CODES = new Set(QUICK_TEST_SCANS);

export default function ScanScreen() {
  const [barcode, setBarcode] = useState("");
  const [scanned, setScanned] = useState(false);
  const { logInventoryAction } = useInventory(); // Get logInventoryAction from context
  const [permission, requestPermission] = useCameraPermissions();

  // NOTE: Removed the useEffect dependency array to prevent rapid re-runs during navigation.
  // The permission logic is now integrated into the render logic instead.

  const handleBarcodeScan = (data: string) => {
    const code = data?.trim() ?? "";
    if (!scanned) {
      // Validate against allowed codes
      if (!VALID_QR_CODES.has(code)) {
        // show error and debounce short period so user sees feedback
        setScanned(true);
        setTimeout(() => setScanned(false), 2000);
        alert(`Invalid QR code: "${code}".`);
        return;
      }

      setScanned(true);
      setBarcode(code);
      // Wait 2 seconds before allowing another scan
      setTimeout(() => setScanned(false), 2000);
    }
  };

  const handleSubmit = () => {
    const code = barcode.trim();
    if (!code) return;

    if (!VALID_QR_CODES.has(code)) {
      alert(`Invalid QR code: "${code}". Please scan or enter a valid code.`);
      return;
    }

    // For demonstration, we'll log a "Check In" of 1 unit.
    // In a real application, you would have UI to select the action (Check In/Out) and quantity.
    logInventoryAction(code, "Check In", 1);
    alert(`Logged action for item: ${code} (Check In, Quantity 1)`);
    setBarcode("");
  };

  const handleQuickScan = (code: string) => {
    setBarcode(code);
  };

  const renderCamera = () => {
    // --- WEB LOGIC (Using external component) ---
    if (Platform.OS === "web") {
      // IMPORTANT: The web component handles its own permissions and loading.
      // We only render it and pass the success handler.
      return (
        <CodeScanner onDetected={handleBarcodeScan} hasScanned={scanned} />
      );
    }

    // --- MOBILE (Android/iOS) LOGIC ---
    // Handle permission check statuses

    if (!permission) {
      return (
        <View style={styles.cameraPlaceholder}>
          <IconSymbol name="camera.fill" size={80} color="#9CA3AF" />
          <Text style={styles.cameraText}>Loading camera...</Text>
        </View>
      );
    }

    if (!permission.granted) {
      // Defer the request until the button is pressed, preventing transition conflict
      return (
        <View style={styles.cameraPlaceholder}>
          <IconSymbol name="camera.fill" size={80} color="#9CA3AF" />
          <Text style={styles.cameraText}>Camera permission required</Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <>
        <CameraView
          style={styles.camera}
          facing="back"
          // Adapter function for expo-camera output format
          onBarcodeScanned={({ data }) => handleBarcodeScan(data)}
          barcodeScannerSettings={{
            barcodeTypes: [
              "qr",
              "pdf417",
              "aztec",
              "ean13",
              "ean8",
              "upc_e",
              "datamatrix",
              "code39",
              "code93",
              "itf14",
              "codabar",
              "code128",
              "upc_a",
            ],
          }}
        />
        {scanned && (
          <View style={styles.scanIndicator}>
            <IconSymbol
              name="checkmark.circle.fill"
              size={40}
              color="#4ADE80"
            />
            <Text style={styles.scanIndicatorText}>Scanned!</Text>
          </View>
        )}
        <View style={styles.scanOverlay}>
          <View style={styles.scanFrame} />
        </View>
      </>
    );
  };

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.cameraContainer}>{renderCamera()}</View>

        <View style={styles.manualEntryContainer}>
          <View style={styles.manualEntryHeader}>
            <IconSymbol name="viewfinder" size={24} color="#4F7FFF" />
            <Text style={styles.manualEntryTitle}>Manual Entry</Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Enter barcode or scan..."
            placeholderTextColor="#9CA3AF"
            value={barcode}
            onChangeText={setBarcode}
            autoCapitalize="characters"
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit Scan</Text>
          </TouchableOpacity>

          <Text style={styles.quickTestTitle}>Quick Test Scans</Text>
          <View style={styles.quickTestGrid}>
            {QUICK_TEST_SCANS.map((code) => (
              <TouchableOpacity
                key={code}
                style={styles.quickTestButton}
                onPress={() => handleQuickScan(code)}
              >
                <Text style={styles.quickTestText}>{code}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    flex: 1,
  },
  cameraContainer: {
    backgroundColor: "#1F2937",
    height: 400,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  camera: {
    width: "100%",
    height: "100%",
  },
  cameraPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  cameraText: {
    color: "#9CA3AF",
    fontSize: 18,
    marginTop: 16,
    textAlign: "center",
  },
  cameraSubtext: {
    color: "#6B7280",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  permissionButton: {
    backgroundColor: "#4F7FFF",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  permissionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  scanOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: "#4F7FFF",
    borderRadius: 16,
    backgroundColor: "transparent",
  },
  scanIndicator: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -50 }, { translateY: -50 }],
    backgroundColor: "rgba(31, 41, 55, 0.9)",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  scanIndicatorText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 8,
  },
  manualEntryContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    padding: 20,
    paddingBottom: 40,
  },
  manualEntryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  manualEntryTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginLeft: 8,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1F2937",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: "#4F7FFF",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    marginBottom: 24,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  quickTestTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 12,
  },
  quickTestGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickTestButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    minWidth: "30%",
    alignItems: "center",
  },
  quickTestText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
});
