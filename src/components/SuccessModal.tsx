import React, { useEffect } from "react";
import { View, Text, StyleSheet, Modal } from "react-native";
import AnimatedIcon from "./AnimatedIcon";

interface SuccessModalProps {
  visible: boolean;
  message: string;
  onClose: () => void;
  duration?: number;
  type?: "success" | "error";
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  message,
  onClose,
  duration = 2000,
  type = "success",
}) => {
  useEffect(() => {
    if (visible) {
      // Use longer duration for error messages (especially long ones)
      const displayDuration =
        type === "error" && message.length > 100 ? 5000 : duration;
      const timer = setTimeout(() => {
        onClose();
      }, displayDuration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose, type, message]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <AnimatedIcon type={type} size={80} loop={false} />
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    minWidth: 200,
    maxWidth: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  message: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 24,
  },
});

export default SuccessModal;
