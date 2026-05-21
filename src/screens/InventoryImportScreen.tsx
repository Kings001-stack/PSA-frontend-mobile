import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import api from "../services/api";

interface ImportError {
  row: number;
  reason: string;
}

interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: ImportError[];
}

const InventoryImportScreen: React.FC = () => {
  const router = useRouter();
  const [file, setFile] = useState<DocumentPicker.DocumentPickerResult | null>(
    null,
  );
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const pickDocument = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ["text/comma-separated-values", "text/csv"],
        copyToCacheDirectory: true,
      });

      if (!res.canceled) {
        setFile(res);
        setResult(null);
      }
    } catch (err) {
      console.error("Error picking document:", err);
      Alert.alert("Error", "Failed to pick document");
    }
  };

  const handleUpload = async () => {
    if (!file || file.canceled) {
      Alert.alert("No file selected", "Please select a CSV file first.");
      return;
    }

    const selectedFile = file.assets[0];

    setIsUploading(true);
    const formData = new FormData();

    // @ts-ignore
    formData.append("file", {
      uri: selectedFile.uri,
      name: selectedFile.name,
      type: selectedFile.mimeType || "text/csv",
    });

    try {
      const response = await api.post("/inventory/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setResult(response.data);
      Alert.alert(
        "Import Complete",
        `Successfully imported ${response.data.imported} items.`,
      );
    } catch (error: any) {
      console.error("Upload failed:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to upload and import CSV.";
      Alert.alert("Upload Failed", errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Import Inventory</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <Ionicons
            name="information-circle-outline"
            size={24}
            color="#2563eb"
          />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>CSV Template Instructions</Text>
            <Text style={styles.infoText}>
              Please ensure your CSV file follows this exact column structure:
            </Text>
            <Text style={styles.templateCode}>
              name, brand, dosage, form, quantity, expiry_date
            </Text>
            <Text style={styles.infoNote}>
              * expiry_date format: YYYY-MM-DD
            </Text>
          </View>
        </View>

        <View style={styles.uploadSection}>
          <TouchableOpacity
            style={[
              styles.pickerBtn,
              file && !file.canceled && styles.pickerBtnActive,
            ]}
            onPress={pickDocument}
          >
            <Ionicons
              name={
                file && !file.canceled
                  ? "document-text"
                  : "cloud-upload-outline"
              }
              size={48}
              color={file && !file.canceled ? "#2563eb" : "#9ca3af"}
            />
            <Text style={styles.pickerText}>
              {file && !file.canceled ? file.assets[0].name : "Select CSV File"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.uploadBtn,
              (!file || file.canceled || isUploading) &&
                styles.uploadBtnDisabled,
            ]}
            onPress={handleUpload}
            disabled={!file || file.canceled || isUploading}
          >
            {isUploading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons
                  name="arrow-up-circle-outline"
                  size={20}
                  color="white"
                />
                <Text style={styles.uploadBtnText}>Start Import</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {result && (
          <View style={styles.resultContainer}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>Import Results</Text>
              <View style={styles.statRow}>
                <View
                  style={[styles.statBadge, { backgroundColor: "#f0fdf4" }]}
                >
                  <Text style={[styles.statText, { color: "#16a34a" }]}>
                    {result.imported} Success
                  </Text>
                </View>
                <View
                  style={[styles.statBadge, { backgroundColor: "#fef2f2" }]}
                >
                  <Text style={[styles.statText, { color: "#dc2626" }]}>
                    {result.failed} Failed
                  </Text>
                </View>
              </View>
            </View>

            {result.errors && result.errors.length > 0 && (
              <View style={styles.errContainer}>
                <Text style={styles.errTitle}>Failure Details</Text>
                {result.errors.map((err, index) => (
                  <View key={index} style={styles.errItem}>
                    <Text style={styles.errRow}>Row {err.row}</Text>
                    <Text style={styles.errReason}>{err.reason}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  infoCard: {
    backgroundColor: "#eff6ff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e40af",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: "#3b82f6",
    lineHeight: 18,
  },
  templateCode: {
    backgroundColor: "rgba(255,255,255,0.5)",
    padding: 8,
    borderRadius: 8,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    fontSize: 11,
    color: "#2563eb",
    marginTop: 10,
    fontWeight: "bold",
  },
  infoNote: {
    fontSize: 11,
    color: "#60a5fa",
    marginTop: 6,
    fontStyle: "italic",
  },
  uploadSection: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 24,
  },
  pickerBtn: {
    width: "100%",
    height: 180,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#f9fafb",
    marginBottom: 20,
  },
  pickerBtnActive: {
    borderColor: "#93c5fd",
    backgroundColor: "#eff6ff",
  },
  pickerText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "600",
  },
  uploadBtn: {
    backgroundColor: "#2563eb",
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  uploadBtnDisabled: {
    backgroundColor: "#9ca3af",
  },
  uploadBtnText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  resultContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  resultHeader: {
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
  },
  statRow: {
    flexDirection: "row",
    gap: 12,
  },
  statBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statText: {
    fontSize: 12,
    fontWeight: "700",
  },
  errContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 16,
  },
  errTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4b5563",
    marginBottom: 12,
  },
  errItem: {
    backgroundColor: "#fff1f2",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#ffe4e6",
  },
  errRow: {
    fontSize: 12,
    fontWeight: "800",
    color: "#be123c",
    marginBottom: 2,
  },
  errReason: {
    fontSize: 12,
    color: "#e11d48",
  },
});

export default InventoryImportScreen;
