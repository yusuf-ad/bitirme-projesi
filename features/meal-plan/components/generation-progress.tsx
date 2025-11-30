import { Colors } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export interface ProgressStep {
  id: string;
  title: string;
  status: "pending" | "in-progress" | "completed" | "error";
}

interface GenerationProgressProps {
  steps: ProgressStep[];
  currentStepId: string;
  error?: string;
  onRetry?: () => void;
}

const StepItem = ({
  step,
  isLast,
}: {
  step: ProgressStep;
  isLast: boolean;
}) => {
  const isCompleted = step.status === "completed";
  const isInProgress = step.status === "in-progress";
  const isError = step.status === "error";
  const isPending = step.status === "pending";

  // todo yarın preview sayfasına bak!!!

  return (
    <Animated.View layout={Layout.springify()} style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        {isCompleted && (
          <Animated.View entering={FadeIn} exiting={FadeOut}>
            <MaterialIcons
              name="check-circle"
              size={24}
              color={Colors.lilac[900]}
            />
          </Animated.View>
        )}
        {isInProgress && (
          <Animated.View entering={FadeIn} exiting={FadeOut}>
            <ActivityIndicator size="small" color={Colors.lilac[900]} />
          </Animated.View>
        )}
        {isError && (
          <Animated.View entering={FadeIn} exiting={FadeOut}>
            <MaterialIcons
              name="error"
              size={24}
              color={Colors.semantic.error.main}
            />
          </Animated.View>
        )}
        {isPending && <View style={styles.pendingDot} />}
      </View>

      <View style={styles.textContainer}>
        <Text
          style={[
            styles.stepTitle,
            (isCompleted || isInProgress) && styles.activeStepTitle,
            isError && styles.errorStepTitle,
            isPending && styles.pendingStepTitle,
          ]}
        >
          {step.title}
        </Text>
      </View>
    </Animated.View>
  );
};

export function GenerationProgress({
  steps,
  currentStepId,
  error,
  onRetry,
}: GenerationProgressProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    const total = steps.length;
    const completed = steps.filter((s) => s.status === "completed").length;
    const current = steps.findIndex((s) => s.id === currentStepId);

    // Calculate progress based on completed steps + partial for current
    let progressValue = 0;
    if (total > 0) {
      progressValue = (completed + (current >= 0 ? 0.5 : 0)) / total;
    }

    progress.value = withTiming(progressValue, { duration: 500 });
  }, [steps, currentStepId, progress]);

  const progressBarStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value * 100}%`,
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.progressBarContainer}>
        <Animated.View style={[styles.progressBar, progressBarStyle]} />
      </View>

      <View style={styles.stepsList}>
        {steps.map((step, index) => (
          <StepItem
            key={step.id}
            step={step}
            isLast={index === steps.length - 1}
          />
        ))}
      </View>

      {error && (
        <Animated.View entering={FadeIn} style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          {onRetry && (
            <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: Colors.gray[200],
    borderRadius: 3,
    marginBottom: 30,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: Colors.lilac[900],
    borderRadius: 3,
  },
  stepsList: {
    gap: 16,
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  pendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gray[300],
  },
  textContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  activeStepTitle: {
    color: Colors.text.primary,
    fontWeight: "600",
  },
  pendingStepTitle: {
    color: Colors.text.secondary,
  },
  errorStepTitle: {
    color: Colors.semantic.error.main,
  },
  errorContainer: {
    marginTop: 30,
    alignItems: "center",
    gap: 12,
  },
  errorText: {
    color: Colors.semantic.error.main,
    textAlign: "center",
    fontSize: 14,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.lilac[900],
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
