import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const PrivacyPolicyScreen: React.FC = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <LinearGradient
        colors={["#1e3a8a", "#2563eb"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.lastUpdated}>Last Updated: April 11, 2026</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Introduction</Text>
            <Text style={styles.paragraph}>
              Welcome to PrimeChem Pharmacy. We are committed to protecting your
              privacy and ensuring the security of your personal health
              information. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you use our digital
              pharmacy management system.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Information We Collect</Text>
            <Text style={styles.subheading}>2.1 Personal Information</Text>
            <Text style={styles.paragraph}>
              • Full name, email address, and phone number{"\n"}• Date of birth
              and gender{"\n"}• Physical address for delivery services{"\n"}•
              Profile photo (optional)
            </Text>

            <Text style={styles.subheading}>2.2 Health Information</Text>
            <Text style={styles.paragraph}>
              • Prescription details and medication history{"\n"}• Refill
              requests and medication schedules{"\n"}• Allergy information and
              medical conditions{"\n"}• Prescription documents and images{"\n"}•
              Healthcare provider information
            </Text>

            <Text style={styles.subheading}>2.3 Usage Information</Text>
            <Text style={styles.paragraph}>
              • Device information (type, operating system){"\n"}• IP address
              and location data{"\n"}• App usage patterns and preferences{"\n"}•
              Chat history with AI assistant{"\n"}• Transaction and order
              history
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              3. How We Use Your Information
            </Text>
            <Text style={styles.paragraph}>
              We use your information to:{"\n\n"}• Process and fulfill
              medication refill requests{"\n"}• Verify prescriptions and ensure
              medication safety{"\n"}• Communicate about your orders and account
              {"\n"}• Provide personalized health recommendations{"\n"}• Send
              medication reminders and alerts{"\n"}• Improve our services and
              user experience{"\n"}• Comply with legal and regulatory
              requirements{"\n"}• Prevent fraud and ensure platform security
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Data Security</Text>
            <Text style={styles.paragraph}>
              We implement industry-standard security measures to protect your
              information:{"\n\n"}• End-to-end encryption for sensitive data
              {"\n"}• Secure token-based authentication{"\n"}• Regular security
              audits and updates{"\n"}• HIPAA-compliant data storage{"\n"}•
              Access controls and audit logging{"\n"}• Secure file upload and
              storage systems
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Information Sharing</Text>
            <Text style={styles.paragraph}>
              We do not sell your personal information. We may share your data
              with:{"\n\n"}• Licensed pharmacists for prescription verification
              {"\n"}• Healthcare providers (with your consent){"\n"}• Payment
              processors for transactions{"\n"}• Delivery partners for order
              fulfillment{"\n"}• Legal authorities when required by law{"\n"}•
              Service providers under strict confidentiality agreements
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Your Rights</Text>
            <Text style={styles.paragraph}>
              You have the right to:{"\n\n"}• Access your personal and health
              information{"\n"}• Request corrections to inaccurate data{"\n"}•
              Delete your account and associated data{"\n"}• Opt-out of
              marketing communications{"\n"}• Export your data in a portable
              format{"\n"}• Withdraw consent for data processing{"\n"}• File a
              complaint with regulatory authorities
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Data Retention</Text>
            <Text style={styles.paragraph}>
              We retain your information for as long as necessary to:{"\n\n"}•
              Provide our services to you{"\n"}• Comply with legal obligations
              (minimum 7 years for health records){"\n"}• Resolve disputes and
              enforce agreements{"\n"}• Maintain accurate business records
              {"\n\n"}
              After account deletion, we anonymize or delete your data within 90
              days, except where retention is required by law.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Children's Privacy</Text>
            <Text style={styles.paragraph}>
              Our services are not intended for individuals under 18 years of
              age. We do not knowingly collect personal information from
              children. If you believe we have collected information from a
              child, please contact us immediately.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. Cookies and Tracking</Text>
            <Text style={styles.paragraph}>
              We use cookies and similar technologies to:{"\n\n"}• Maintain your
              session and preferences{"\n"}• Analyze app usage and performance
              {"\n"}• Provide personalized content{"\n"}• Improve security and
              prevent fraud{"\n\n"}
              You can manage cookie preferences in your device settings.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>10. Third-Party Services</Text>
            <Text style={styles.paragraph}>
              Our app integrates with third-party services:{"\n\n"}• AI
              providers for health assistant features{"\n"}• Push notification
              services{"\n"}• Analytics platforms{"\n"}• Payment gateways
              {"\n\n"}
              These services have their own privacy policies. We recommend
              reviewing them.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              11. International Data Transfers
            </Text>
            <Text style={styles.paragraph}>
              Your information may be transferred to and processed in countries
              other than your own. We ensure appropriate safeguards are in place
              to protect your data in accordance with this Privacy Policy and
              applicable laws.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>12. Changes to This Policy</Text>
            <Text style={styles.paragraph}>
              We may update this Privacy Policy periodically. We will notify you
              of significant changes via:{"\n\n"}• In-app notifications{"\n"}•
              Email to your registered address{"\n"}• Prominent notice on our
              platform{"\n\n"}
              Continued use of our services after changes constitutes acceptance
              of the updated policy.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>13. Contact Us</Text>
            <Text style={styles.paragraph}>
              For questions about this Privacy Policy or to exercise your
              rights, contact us:{"\n\n"}
              Email: privacy@primechem.com{"\n"}
              Phone: +234 907 190 6688{"\n"}
              Address: PrimeChem Pharmacy, Nigeria{"\n\n"}
              Data Protection Officer: dpo@primechem.com
            </Text>
          </View>

          <View style={styles.acknowledgment}>
            <Ionicons name="shield-checkmark" size={32} color="#10b981" />
            <Text style={styles.acknowledgmentText}>
              Your privacy and health data security are our top priorities. We
              are committed to maintaining the highest standards of data
              protection.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "white",
    letterSpacing: 0.5,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  lastUpdated: {
    fontSize: 12,
    color: "#64748b",
    fontStyle: "italic",
    marginBottom: 24,
    textAlign: "center",
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 12,
  },
  subheading: {
    fontSize: 15,
    fontWeight: "700",
    color: "#334155",
    marginTop: 12,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: "#475569",
  },
  acknowledgment: {
    backgroundColor: "#f0fdf4",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  acknowledgmentText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#166534",
    textAlign: "center",
    marginTop: 12,
    fontWeight: "500",
  },
});

export default PrivacyPolicyScreen;
