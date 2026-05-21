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

const TermsOfServiceScreen: React.FC = () => {
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
        <Text style={styles.headerTitle}>Terms of Service</Text>
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
            <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
            <Text style={styles.paragraph}>
              By accessing or using PrimeChem Pharmacy's digital platform, you
              agree to be bound by these Terms of Service. If you do not agree
              to these terms, please do not use our services. These terms
              constitute a legally binding agreement between you and PrimeChem
              Pharmacy.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Service Description</Text>
            <Text style={styles.paragraph}>
              PrimeChem provides a digital pharmacy management platform that
              enables:{"\n\n"}• Medication refill requests and management{"\n"}•
              Prescription verification and processing{"\n"}• Medication
              inventory search{"\n"}• AI-powered health information assistant
              {"\n"}• Order tracking and notifications{"\n"}• Communication with
              licensed pharmacists{"\n"}• Health record management
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. User Eligibility</Text>
            <Text style={styles.paragraph}>
              To use our services, you must:{"\n\n"}• Be at least 18 years of
              age{"\n"}• Have legal capacity to enter into binding contracts
              {"\n"}• Provide accurate and complete registration information
              {"\n"}• Maintain the security of your account credentials{"\n"}•
              Comply with all applicable laws and regulations{"\n\n"}
              Parents or guardians may create accounts on behalf of minors under
              their care.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Account Responsibilities</Text>
            <Text style={styles.paragraph}>
              You are responsible for:{"\n\n"}• Maintaining the confidentiality
              of your password{"\n"}• All activities that occur under your
              account{"\n"}• Notifying us immediately of unauthorized access
              {"\n"}• Providing accurate health and contact information{"\n"}•
              Updating your information when it changes{"\n"}• Not sharing your
              account with others
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Medical Disclaimer</Text>
            <Text style={styles.importantBox}>
              <Ionicons name="warning" size={16} color="#dc2626" /> IMPORTANT
              MEDICAL NOTICE
            </Text>
            <Text style={styles.paragraph}>
              • Our AI assistant provides general health information only{"\n"}•
              It does NOT provide medical diagnosis or treatment advice{"\n"}•
              Always consult licensed healthcare professionals{"\n"}• In
              emergencies, call emergency services immediately{"\n"}• We are not
              liable for decisions based on AI information{"\n"}• Prescription
              verification is performed by licensed pharmacists
              {"\n"}• Follow your doctor's instructions for all medications
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              6. Prescription Requirements
            </Text>
            <Text style={styles.paragraph}>
              For prescription medications:{"\n\n"}• Valid prescription from
              licensed healthcare provider required
              {"\n"}• Prescriptions must be current and not expired{"\n"}• We
              verify all prescriptions before dispensing{"\n"}• Controlled
              substances require additional verification{"\n"}• We reserve the
              right to refuse any prescription{"\n"}• Prescription documents
              must be clear and legible{"\n"}• False prescriptions will be
              reported to authorities
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Refill Requests</Text>
            <Text style={styles.paragraph}>
              When requesting refills:{"\n\n"}• Ensure you have refills
              remaining on your prescription{"\n"}• Provide accurate medication
              and dosage information{"\n"}• Allow adequate processing time
              (24-48 hours){"\n"}• Pharmacists may contact you for clarification
              {"\n"}• Refills may be denied for safety or legal reasons{"\n"}•
              You will be notified of approval or rejection{"\n"}• Urgent
              requests are prioritized but not guaranteed
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Payment and Pricing</Text>
            <Text style={styles.paragraph}>
              • Prices are subject to change without notice{"\n"}• Payment is
              required before medication dispensing{"\n"}• We accept various
              payment methods{"\n"}• Insurance claims are processed separately
              {"\n"}• Refunds follow our refund policy{"\n"}• You are
              responsible for all charges on your account{"\n"}• Disputed
              charges must be reported within 30 days
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. Prohibited Activities</Text>
            <Text style={styles.paragraph}>
              You may NOT:{"\n\n"}• Use the platform for illegal purposes{"\n"}•
              Submit false or fraudulent prescriptions{"\n"}• Share or resell
              medications{"\n"}• Attempt to circumvent security measures{"\n"}•
              Harass or abuse staff or other users{"\n"}• Use automated systems
              to access the platform{"\n"}• Reverse engineer or copy our
              software{"\n"}• Violate any applicable laws or regulations
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>10. Intellectual Property</Text>
            <Text style={styles.paragraph}>
              All content, features, and functionality are owned by PrimeChem
              and protected by copyright, trademark, and other laws. You may
              not:{"\n\n"}• Copy, modify, or distribute our content{"\n"}• Use
              our trademarks without permission{"\n"}• Create derivative works
              {"\n"}• Remove copyright or proprietary notices{"\n\n"}
              Limited license is granted for personal, non-commercial use only.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>11. Service Availability</Text>
            <Text style={styles.paragraph}>
              We strive for 24/7 availability but:{"\n\n"}• Services may be
              interrupted for maintenance{"\n"}• We do not guarantee
              uninterrupted access{"\n"}• Features may be modified or
              discontinued{"\n"}• Emergency services are not provided through
              the app{"\n"}• Technical issues may cause delays{"\n"}• We are not
              liable for service interruptions
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>12. Limitation of Liability</Text>
            <Text style={styles.paragraph}>
              To the maximum extent permitted by law:{"\n\n"}• We are not liable
              for indirect or consequential damages{"\n"}• Our liability is
              limited to the amount you paid us{"\n"}• We do not guarantee
              medication effectiveness{"\n"}• We are not responsible for
              third-party services{"\n"}• You use the service at your own risk
              {"\n"}• Some jurisdictions do not allow liability limitations
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>13. Indemnification</Text>
            <Text style={styles.paragraph}>
              You agree to indemnify and hold PrimeChem harmless from any
              claims, damages, or expenses arising from:{"\n\n"}• Your use of
              the platform{"\n"}• Your violation of these terms{"\n"}• Your
              violation of any laws{"\n"}• Your infringement of third-party
              rights{"\n"}• Information you provide to us
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>14. Termination</Text>
            <Text style={styles.paragraph}>
              We may suspend or terminate your account if:{"\n\n"}• You violate
              these terms{"\n"}• You engage in fraudulent activity{"\n"}•
              Required by law or regulatory authorities{"\n"}• Your account is
              inactive for extended periods{"\n\n"}
              You may terminate your account at any time through app settings.
              Upon termination, your data will be handled per our Privacy
              Policy.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>15. Dispute Resolution</Text>
            <Text style={styles.paragraph}>
              For disputes:{"\n\n"}• Contact us first to resolve informally
              {"\n"}• Mediation may be required before litigation{"\n"}•
              Arbitration may be used for certain disputes{"\n"}• Class action
              waivers may apply{"\n"}• Governing law: Federal Republic of
              Nigeria{"\n"}• Jurisdiction: Nigerian courts
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>16. Changes to Terms</Text>
            <Text style={styles.paragraph}>
              We may modify these terms at any time. Changes will be effective
              upon:{"\n\n"}• Posting updated terms in the app{"\n"}•
              Notification via email or push notification{"\n"}• Your continued
              use after changes{"\n\n"}
              Material changes will be highlighted and require acceptance.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>17. Contact Information</Text>
            <Text style={styles.paragraph}>
              For questions about these Terms:{"\n\n"}
              Email: legal@primechem.com{"\n"}
              Phone: +234 907 190 6688{"\n"}
              Address: PrimeChem Pharmacy, Nigeria{"\n"}
              Business Hours: Monday-Saturday, 8AM-9PM
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>18. Severability</Text>
            <Text style={styles.paragraph}>
              If any provision of these terms is found to be unenforceable, the
              remaining provisions will continue in full force and effect.
            </Text>
          </View>

          <View style={styles.acknowledgment}>
            <Ionicons name="document-text" size={32} color="#2563eb" />
            <Text style={styles.acknowledgmentText}>
              By using PrimeChem, you acknowledge that you have read,
              understood, and agree to be bound by these Terms of Service.
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
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: "#475569",
  },
  importantBox: {
    fontSize: 14,
    fontWeight: "700",
    color: "#dc2626",
    backgroundColor: "#fee2e2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#dc2626",
  },
  acknowledgment: {
    backgroundColor: "#eff6ff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  acknowledgmentText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#1e40af",
    textAlign: "center",
    marginTop: 12,
    fontWeight: "500",
  },
});

export default TermsOfServiceScreen;
