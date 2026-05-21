import React, { useRef, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";

type AnimationType = "loading" | "success" | "error" | "empty";

interface AnimatedIconProps {
  type: AnimationType;
  size?: number;
  loop?: boolean;
  autoPlay?: boolean;
  speed?: number;
  onAnimationFinish?: () => void;
}

const animations = {
  loading: require("../assets/lottie/Loading animation blue.json"),
  success: require("../assets/lottie/Successfully done.json"),
  error: require("../assets/lottie/error.json"),
  empty: require("../assets/lottie/empty.json"),
};

const AnimatedIcon: React.FC<AnimatedIconProps> = ({
  type,
  size = 100,
  loop = true,
  autoPlay = true,
  speed = 1,
  onAnimationFinish,
}) => {
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    if (autoPlay && animationRef.current) {
      animationRef.current.play();
    }
  }, [autoPlay]);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <LottieView
        ref={animationRef}
        source={animations[type]}
        autoPlay={autoPlay}
        loop={loop}
        speed={speed}
        style={{ width: size, height: size }}
        onAnimationFinish={onAnimationFinish}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AnimatedIcon;
