import React from "react";
import { View, StyleSheet } from "react-native";
// Note: @lottiefiles/dotlottie-react is primarily for web React applications
// For React Native, we'll continue using lottie-react-native as the primary package
// This component serves as an example of how you could integrate dotlottie if needed

interface DotLottieIconProps {
  size?: number;
  source: any;
  loop?: boolean;
  autoPlay?: boolean;
}

/**
 * DotLottieIcon - Example component for advanced Lottie features
 *
 * Note: @lottiefiles/dotlottie-react is designed for web React applications.
 * For React Native apps, lottie-react-native remains the recommended choice.
 *
 * This component is provided as an example of how you might integrate
 * dotlottie features if needed in a web version of your app.
 */
const DotLottieIcon: React.FC<DotLottieIconProps> = ({
  size = 100,
  source,
  loop = true,
  autoPlay = true,
}) => {
  // For React Native, we'll use the standard LottieView
  // The dotlottie package would be used in a web React environment

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* This is where you would use DotLottieReact in a web environment */}
      {/* For React Native, continue using LottieView from lottie-react-native */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default DotLottieIcon;
