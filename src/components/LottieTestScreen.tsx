import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AnimatedIcon from "./AnimatedIcon";
import SuccessModal from "./SuccessModal";

/**
 * LottieTestScreen - Test component to verify all Lottie animations work correctly
 *
 * This component can be used to test all available animations and their properties.
 * Useful for debugging and demonstrating animation capabilities.
 */
const LottieTestScreen: React.FC = () => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const animations = [
    { type: "loading" as const, label: "Loading Animation", loop: true },
    { type: "success" as const, label: "Success Animation", loop: false },
    { type: "error" as const, label: "Error Animation", loop: false },
    { type: "empty" as const, label: "Empty State Animation", loop: true },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Lottie Animations Test</Text>
        <Text style={styles.subtitle}>
          Testing all available Lottie animations in the app
        </Text>

        <View style={styles.animationsGrid}>
          {animations.map((anim, index) => (
            <View key={index} style={styles.animationCard}>
              <Text style={styles.animationLabel}>{anim.label}</Text>
              <AnimatedIcon
                type={anim.type}
                size={80}
                loop={anim.loop}
                autoPlay={true}
              />
              <Text style={styles.animationDetails}>
                Size: 80px | Loop: {anim.loop ? "Yes" : "No"}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.modalTests}>
          <Text style={styles.sectionTitle}>Modal Tests</Text>

          <TouchableOpacity
            style={[styles.testButton, styles.successButton]}
            onPress={() => setShowSuccessModal(true)}
          >
            <Text style={styles.buttonText}>Test Success Modal</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.testButton, styles.errorButton]}
            onPress={() => setShowErrorModal(true)}
          >
            <Text style={styles.buttonText}>Test Error Modal</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sizeTests}>
          <Text style={styles.sectionTitle}>Size Variations</Text>
          <View style={styles.sizeRow}>
            <View style={styles.sizeItem}>
              <Text style={styles.sizeLabel}>Small (40px)</Text>
              <AnimatedIcon type="loading" size={40} />
            </View>
            <View style={styles.sizeItem}>
              <Text style={styles.sizeLabel}>Medium (80px)</Text>
              <AnimatedIcon type="loading" size={80} />
            </View>
            <View style={styles.sizeItem}>
              <Text style={styles.sizeLabel}>Large (120px)</Text>
              <AnimatedIcon type="loading" size={120} />
            </View>
          </View>
        </View>
      </ScrollView>

      <SuccessModal
        visible={showSuccessModal}
        message="Success modal test completed!"
        onClose={() => setShowSuccessModal(false)}
        type="success"
      />

      <SuccessModal
        visible={showErrorModal}
        message="Error modal test completed!"
        onClose={() => setShowErrorModal(false)}
        type="error"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 32,
  },
  animationsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  animationCard: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  animationLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
    textAlign: "center",
  },
  animationDetails: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 8,
    textAlign: "center",
  },
  modalTests: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 16,
  },
  testButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  successButton: {
    backgroundColor: "#10b981",
  },
  errorButton: {
    backgroundColor: "#ef4444",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  sizeTests: {
    marginBottom: 32,
  },
  sizeRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  sizeItem: {
    alignItems: "center",
  },
  sizeLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 8,
  },
});

export default LottieTestScreen;
