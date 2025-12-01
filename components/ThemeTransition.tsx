import { getThemeColors } from "@/constants/theme";
import { useTheme } from "@/providers/theme-provider";
import { forwardRef, useImperativeHandle, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
    runOnJS,
    useAnimatedProps,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Defs, Mask, Rect } from "react-native-svg";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const MAX_RADIUS = Math.sqrt(SCREEN_WIDTH ** 2 + SCREEN_HEIGHT ** 2);

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface ThemeTransitionRef {
    startTransition: (cx: number, cy: number) => void;
}

interface ThemeTransitionProps {
    duration?: number;
}

export const ThemeTransition = forwardRef<
    ThemeTransitionRef,
    ThemeTransitionProps
>(({ duration = 500 }, ref) => {
    const { isDark, toggleTheme } = useTheme();
    const [isAnimating, setIsAnimating] = useState(false);
    const [center, setCenter] = useState({ cx: SCREEN_WIDTH / 2, cy: SCREEN_HEIGHT / 2 });
    const [showingNewTheme, setShowingNewTheme] = useState(false);

    const radius = useSharedValue(0);

    const animatedProps = useAnimatedProps(() => ({
        r: radius.value,
    }));

    const startTransition = (cx: number, cy: number) => {
        if (isAnimating) return;

        setCenter({ cx, cy });
        setIsAnimating(true);
        setShowingNewTheme(false);
        radius.value = 0;

        // Start expanding circle
        radius.value = withTiming(
            MAX_RADIUS,
            { duration },
            (finished) => {
                if (finished) {
                    runOnJS(finishTransition)();
                }
            }
        );

        // Toggle theme at midpoint for smooth visual
        setTimeout(() => {
            toggleTheme();
            setShowingNewTheme(true);
        }, duration * 0.3);
    };

    const finishTransition = () => {
        setIsAnimating(false);
        radius.value = 0;
    };

    useImperativeHandle(ref, () => ({
        startTransition,
    }));

    if (!isAnimating) return null;

    // Get colors for the NEW theme (opposite of current)
    const newThemeColors = getThemeColors(!isDark);
    const overlayColor = showingNewTheme
        ? getThemeColors(isDark).background.secondary
        : newThemeColors.background.secondary;

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT}>
                <Defs>
                    <Mask id="circleMask">
                        <Rect width={SCREEN_WIDTH} height={SCREEN_HEIGHT} fill="white" />
                        <AnimatedCircle
                            cx={center.cx}
                            cy={center.cy}
                            fill="black"
                            animatedProps={animatedProps}
                        />
                    </Mask>
                </Defs>
                <Rect
                    width={SCREEN_WIDTH}
                    height={SCREEN_HEIGHT}
                    fill={overlayColor}
                    mask="url(#circleMask)"
                />
            </Svg>
        </View>
    );
});

ThemeTransition.displayName = "ThemeTransition";
