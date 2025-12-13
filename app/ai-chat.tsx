import { Colors, ContentDarkColors } from "@/constants/theme";
import { useAuthContext } from "@/hooks/use-auth-context";
import { useTheme } from "@/providers/theme-provider";
import { MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import Constants from "expo-constants";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { fetch as expoFetch } from "expo/fetch";
import { useCallback, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";
import Markdown from "react-native-markdown-display";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const getBaseUrl = () => {
    // Production: use EXPO_PUBLIC_API_BASE_URL
    if (process.env.EXPO_PUBLIC_API_BASE_URL) {
        return process.env.EXPO_PUBLIC_API_BASE_URL;
    }
    
    // Development: use local dev server
    const debuggerHost = Constants.expoConfig?.hostUri;
    const localhost = debuggerHost?.split(":")[0];
    if (!localhost) {
        return "http://localhost:8081";
    }
    return `http://${localhost}:8081`;
};

interface RecipeSuggestion {
    id: number;
    title: string;
    image: string;
    readyInMinutes?: number;
}

interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    recipes?: RecipeSuggestion[];
}

interface MessageBubbleProps {
    content: string;
    role: "user" | "assistant";
    isDark: boolean;
    userAvatarUrl?: string | null;
    recipes?: RecipeSuggestion[];
    onRecipePress?: (recipeId: number) => void;
}

const QUICK_SUGGESTIONS = [
    { icon: "restaurant-menu", text: "What should I cook today?", color: "#FF6B6B" },
    { icon: "local-fire-department", text: "Low calorie recipes", color: "#4ECDC4" },
    { icon: "timer", text: "Quick 15-minute meals", color: "#FFE66D" },
    { icon: "eco", text: "Healthy snacks", color: "#95E1D3" },
];

function RecipeCard({ recipe, isDark, onPress, isCompact = false }: { 
    recipe: RecipeSuggestion; 
    isDark: boolean;
    onPress: () => void;
    isCompact?: boolean;
}) {
    const colors = isDark ? ContentDarkColors : Colors;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const arrowAnim = useRef(new Animated.Value(0)).current;
    
    const handlePressIn = () => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 0.97,
                useNativeDriver: true,
                speed: 50,
                bounciness: 4,
            }),
            Animated.timing(arrowAnim, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start();
    };
    
    const handlePressOut = () => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                speed: 50,
                bounciness: 4,
            }),
            Animated.timing(arrowAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start();
    };
    
    const arrowTranslate = arrowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 4],
    });
    
    if (isCompact) {
        // Compact horizontal card for multiple recipes
        return (
            <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
                <Animated.View
                    style={[
                        styles.recipeCardCompact,
                        {
                            backgroundColor: isDark ? ContentDarkColors.card.backgroundElevated : "#FFFFFF",
                            borderColor: isDark ? ContentDarkColors.border.light : colors.gray[200],
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}
                >
                    <ExpoImage
                        source={{ uri: recipe.image }}
                        style={styles.recipeImageCompact}
                        contentFit="cover"
                    />
                    <LinearGradient
                        colors={["transparent", "rgba(0,0,0,0.75)"]}
                        style={styles.recipeGradientOverlay}
                    />
                    <View style={styles.recipeInfoCompact}>
                        <Text 
                            style={styles.recipeTitleCompact}
                            numberOfLines={2}
                        >
                            {recipe.title}
                        </Text>
                        {recipe.readyInMinutes && (
                            <View style={styles.recipeMetaRowCompact}>
                                <MaterialIcons name="schedule" size={12} color="rgba(255,255,255,0.9)" />
                                <Text style={styles.recipeMetaCompact}>
                                    {recipe.readyInMinutes} min
                                </Text>
                            </View>
                        )}
                    </View>
                    <Animated.View 
                        style={[
                            styles.recipeViewButton,
                            { transform: [{ translateX: arrowTranslate }] }
                        ]}
                    >
                        <MaterialIcons name="arrow-forward" size={14} color="#FFFFFF" />
                    </Animated.View>
                </Animated.View>
            </Pressable>
        );
    }
    
    // Full width card for single recipe - eski güzel tasarım
    return (
        <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
            <Animated.View
                style={[
                    styles.recipeCard,
                    {
                        backgroundColor: isDark ? ContentDarkColors.card.backgroundElevated : "#FFFFFF",
                        borderColor: isDark ? ContentDarkColors.border.light : colors.gray[200],
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                <ExpoImage
                    source={{ uri: recipe.image }}
                    style={styles.recipeImage}
                    contentFit="cover"
                />
                <View style={styles.recipeInfo}>
                    <Text 
                        style={[styles.recipeTitle, { color: colors.text.primary }]}
                        numberOfLines={2}
                    >
                        {recipe.title}
                    </Text>
                    {recipe.readyInMinutes && (
                        <View style={styles.recipeMetaRow}>
                            <MaterialIcons name="schedule" size={14} color={colors.text.tertiary} />
                            <Text style={[styles.recipeMeta, { color: colors.text.tertiary }]}>
                                {recipe.readyInMinutes} min
                            </Text>
                        </View>
                    )}
                </View>
                <Animated.View 
                    style={[
                        styles.recipeArrow, 
                        { 
                            backgroundColor: colors.lilac[100],
                            transform: [{ translateX: arrowTranslate }],
                        }
                    ]}
                >
                    <MaterialIcons name="arrow-forward" size={16} color={colors.lilac[700]} />
                </Animated.View>
            </Animated.View>
        </Pressable>
    );
}

function RecipeCarousel({ recipes, isDark, onRecipePress }: {
    recipes: RecipeSuggestion[];
    isDark: boolean;
    onRecipePress: (id: number) => void;
}) {
    const colors = isDark ? ContentDarkColors : Colors;
    
    if (recipes.length === 1) {
        return (
            <View style={styles.recipesContainerSingle}>
                <RecipeCard
                    recipe={recipes[0]}
                    isDark={isDark}
                    onPress={() => onRecipePress(recipes[0].id)}
                />
            </View>
        );
    }
    
    return (
        <View style={styles.recipesContainerMultiple}>
            <FlatList
                data={recipes}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recipesScrollContent}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <RecipeCard
                        recipe={item}
                        isDark={isDark}
                        onPress={() => onRecipePress(item.id)}
                        isCompact
                    />
                )}
            />
        </View>
    );
}

function TypingIndicator({ isDark }: { isDark: boolean }) {
    const colors = isDark ? ContentDarkColors : Colors;
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;

    useState(() => {
        const animate = (dot: Animated.Value, delay: number) => {
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(dot, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(dot, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        };
        animate(dot1, 0);
        animate(dot2, 150);
        animate(dot3, 300);
    });

    const dotStyle = (anim: Animated.Value) => ({
        opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
        transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.2] }) }],
    });

    return (
        <View style={[styles.messageRow]}>
            <LinearGradient
                colors={[colors.lilac[600], colors.lilac[800]]}
                style={styles.avatarGradient}
            >
                <MaterialIcons name="auto-awesome" size={14} color="#FFFFFF" />
            </LinearGradient>
            <View style={[styles.typingBubble, { 
                backgroundColor: isDark ? ContentDarkColors.card.background : colors.gray[100] 
            }]}>
                <Animated.View style={[styles.typingDot, { backgroundColor: colors.lilac[600] }, dotStyle(dot1)]} />
                <Animated.View style={[styles.typingDot, { backgroundColor: colors.lilac[600] }, dotStyle(dot2)]} />
                <Animated.View style={[styles.typingDot, { backgroundColor: colors.lilac[600] }, dotStyle(dot3)]} />
            </View>
        </View>
    );
}

function MessageBubble({ content, role, isDark, userAvatarUrl, recipes, onRecipePress }: MessageBubbleProps) {
    const isUser = role === "user";
    const colors = isDark ? ContentDarkColors : Colors;
    const textColor = isUser ? "#FFFFFF" : colors.text.primary;

    const markdownStyles = useMemo(
        () => ({
            body: {
                color: textColor,
                fontSize: 15,
                lineHeight: 22,
            },
            paragraph: {
                marginTop: 0,
                marginBottom: 8,
            },
            heading2: {
                color: textColor,
                fontSize: 16,
                fontWeight: "700" as const,
                marginTop: 12,
                marginBottom: 6,
            },
            heading3: {
                color: textColor,
                fontSize: 15,
                fontWeight: "600" as const,
                marginTop: 10,
                marginBottom: 4,
            },
            strong: {
                fontWeight: "700" as const,
                color: textColor,
            },
            bullet_list: {
                marginTop: 4,
                marginBottom: 8,
            },
            ordered_list: {
                marginTop: 4,
                marginBottom: 8,
            },
            list_item: {
                marginTop: 2,
                marginBottom: 2,
            },
            bullet_list_icon: {
                color: textColor,
                fontSize: 8,
                lineHeight: 22,
                marginRight: 8,
            },
            ordered_list_icon: {
                color: textColor,
                fontSize: 14,
                lineHeight: 22,
                marginRight: 6,
            },
            code_inline: {
                backgroundColor: isUser 
                    ? "rgba(255,255,255,0.2)" 
                    : isDark 
                        ? "rgba(255,255,255,0.1)" 
                        : "rgba(0,0,0,0.08)",
                color: textColor,
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 4,
                fontSize: 13,
            },
            fence: {
                backgroundColor: isUser 
                    ? "rgba(255,255,255,0.15)" 
                    : isDark 
                        ? "rgba(255,255,255,0.08)" 
                        : "rgba(0,0,0,0.05)",
                borderRadius: 8,
                padding: 12,
                marginVertical: 8,
            },
            code_block: {
                color: textColor,
                fontSize: 13,
            },
        }),
        [textColor, isUser, isDark]
    );

    return (
        <View style={styles.messageContainer}>
            <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
                {!isUser && (
                    <LinearGradient
                        colors={[colors.lilac[600], colors.lilac[800]]}
                        style={styles.avatarGradient}
                    >
                        <MaterialIcons name="auto-awesome" size={14} color="#FFFFFF" />
                    </LinearGradient>
                )}
                {isUser ? (
                    <LinearGradient
                        colors={[colors.lilac[600], colors.lilac[800]]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.messageBubble, styles.userBubble]}
                    >
                        <Text style={[styles.messageText, { color: textColor }]}>
                            {content}
                        </Text>
                    </LinearGradient>
                ) : (
                    <View
                        style={[
                            styles.messageBubble,
                            styles.assistantBubble,
                            {
                                backgroundColor: isDark
                                    ? ContentDarkColors.card.background
                                    : "#FFFFFF",
                                borderWidth: isDark ? 0 : 1,
                                borderColor: colors.gray[200],
                            },
                        ]}
                    >
                        <Markdown style={markdownStyles}>{content}</Markdown>
                    </View>
                )}
                {isUser && (
                    <View style={[styles.avatarContainer, { backgroundColor: colors.lilac[200] }]}>
                        {userAvatarUrl ? (
                            <ExpoImage source={{ uri: userAvatarUrl }} style={styles.userAvatarImage} />
                        ) : (
                            <MaterialIcons name="person" size={16} color={colors.lilac[700]} />
                        )}
                    </View>
                )}
            </View>
            
            {/* Recipe Cards */}
            {!isUser && recipes && recipes.length > 0 && (
                <RecipeCarousel
                    recipes={recipes}
                    isDark={isDark}
                    onRecipePress={(id) => onRecipePress?.(id)}
                />
            )}
        </View>
    );
}

export default function AIChatScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { isDark } = useTheme();
    const { session, profile } = useAuthContext();
    const colors = isDark ? ContentDarkColors : Colors;
    const flatListRef = useRef<FlatList>(null);
    const [inputText, setInputText] = useState("");
    const [inputHeight, setInputHeight] = useState(40);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSuggestionPress = useCallback((text: string) => {
        setInputText(text);
    }, []);

    const handleRecipePress = useCallback((recipeId: number) => {
        router.push(`/(meal)/${recipeId}`);
    }, [router]);

    const onSend = useCallback(async () => {
        if (!inputText.trim() || isLoading) return;

        const userMessage = inputText.trim();
        setInputText("");
        setError(null);

        const newUserMessage: ChatMessage = {
            id: Date.now().toString(),
            role: "user",
            content: userMessage,
        };

        setMessages((prev) => [...prev, newUserMessage]);
        setIsLoading(true);

        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);

        try {
            const baseUrl = getBaseUrl();
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000);
            
            // Include recipe names in assistant messages so backend can track them
            const messagesWithRecipes = [...messages, newUserMessage].map((m) => {
                let content = m.content;
                // Add recipe tags back to assistant messages for tracking
                if (m.role === "assistant" && m.recipes && m.recipes.length > 0) {
                    const recipeTags = m.recipes.map(r => `[[RECIPE:${r.title.toLowerCase().replace(/\s+/g, '_')}]]`).join(' ');
                    content = `${content} ${recipeTags}`;
                }
                return { role: m.role, content };
            });

            const response = await expoFetch(`${baseUrl}/api/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messages: messagesWithRecipes,
                    userId: session?.user?.id,
                }),
                signal: controller.signal,
            });
            
            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.text();
                console.error("API Error:", response.status, errorData);
                throw new Error(`API Error: ${response.status} - ${errorData}`);
            }

            const data = await response.json();

            const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: data.content,
                recipes: data.recipes,
            };

            setMessages((prev) => [...prev, assistantMessage]);

            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        } catch (err) {
            console.error("Chat error:", err);
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [inputText, isLoading, messages, session?.user?.id]);

    const renderMessage = useCallback(
        ({ item }: { item: ChatMessage }) => (
            <MessageBubble 
                content={item.content} 
                role={item.role} 
                isDark={isDark} 
                userAvatarUrl={profile?.avatar_url}
                recipes={item.recipes}
                onRecipePress={handleRecipePress}
            />
        ),
        [isDark, profile?.avatar_url, handleRecipePress]
    );

    const EmptyState = useMemo(() => (
        <View style={styles.emptyContainer}>
            {/* AI Avatar with glow effect */}
            <View style={styles.emptyAvatarWrapper}>
                <View style={[styles.avatarGlow, { backgroundColor: colors.lilac[200] }]} />
                <LinearGradient
                    colors={[colors.lilac[500], colors.lilac[800]]}
                    style={styles.emptyAvatar}
                >
                    <MaterialIcons name="auto-awesome" size={36} color="#FFFFFF" />
                </LinearGradient>
            </View>
            
            <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
                Hello! 👋
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.text.secondary }]}>
                I can help you with recipes, nutrition tips, and anything related to cooking.
            </Text>

            {/* Quick Suggestions */}
            <View style={styles.suggestionsContainer}>
                <Text style={[styles.suggestionsTitle, { color: colors.text.tertiary }]}>
                    Quick Suggestions
                </Text>
                <View style={styles.suggestionsGrid}>
                    {QUICK_SUGGESTIONS.map((suggestion, index) => (
                        <Pressable
                            key={index}
                            style={({ pressed }) => [
                                styles.suggestionCard,
                                {
                                    backgroundColor: isDark 
                                        ? ContentDarkColors.card.background 
                                        : "#FFFFFF",
                                    borderColor: isDark 
                                        ? ContentDarkColors.border.light 
                                        : colors.gray[200],
                                    transform: [{ scale: pressed ? 0.97 : 1 }],
                                },
                            ]}
                            onPress={() => handleSuggestionPress(suggestion.text)}
                        >
                            <View style={[styles.suggestionIcon, { backgroundColor: suggestion.color + "20" }]}>
                                <MaterialIcons 
                                    name={suggestion.icon as any} 
                                    size={18} 
                                    color={suggestion.color} 
                                />
                            </View>
                            <Text 
                                style={[styles.suggestionText, { color: colors.text.primary }]}
                                numberOfLines={2}
                            >
                                {suggestion.text}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </View>
        </View>
    ), [colors, isDark, handleSuggestionPress]);

    return (
        <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
            <KeyboardAvoidingView
                style={[styles.container, { backgroundColor: colors.background.primary }]}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={0}
            >
                {/* Header with gradient */}
                <LinearGradient
                    colors={isDark 
                        ? [ContentDarkColors.background.secondary, colors.background.primary]
                        : [colors.lilac[100], colors.background.primary]
                    }
                    style={[styles.headerGradient, { paddingTop: insets.top }]}
                >
                    <View style={styles.header}>
                        <Pressable 
                            onPress={() => router.back()} 
                            style={({ pressed }) => [
                                styles.backButton,
                                { 
                                    backgroundColor: isDark 
                                        ? "rgba(255,255,255,0.1)" 
                                        : "rgba(0,0,0,0.05)",
                                    opacity: pressed ? 0.7 : 1,
                                }
                            ]}
                        >
                            <MaterialIcons
                                name="arrow-back"
                                size={22}
                                color={colors.text.primary}
                            />
                        </Pressable>
                        <View style={styles.headerCenter}>
                            <LinearGradient
                                colors={[colors.lilac[500], colors.lilac[800]]}
                                style={styles.headerAvatar}
                            >
                                <MaterialIcons name="auto-awesome" size={16} color="#FFFFFF" />
                            </LinearGradient>
                            <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
                                AI Asistan
                            </Text>
                        </View>
                        <Pressable 
                            style={({ pressed }) => [
                                styles.menuButton,
                                { 
                                    backgroundColor: isDark 
                                        ? "rgba(255,255,255,0.1)" 
                                        : "rgba(0,0,0,0.05)",
                                    opacity: pressed ? 0.7 : 1,
                                }
                            ]}
                        >
                            <MaterialIcons
                                name="more-vert"
                                size={22}
                                color={colors.text.primary}
                            />
                        </Pressable>
                    </View>
                </LinearGradient>

                {/* Messages */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={[
                        styles.messagesList,
                        messages.length === 0 && styles.emptyList,
                    ]}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() =>
                        flatListRef.current?.scrollToEnd({ animated: true })
                    }
                    ListEmptyComponent={EmptyState}
                    ListFooterComponent={isLoading ? <TypingIndicator isDark={isDark} /> : null}
                />

                {/* Error message */}
                {error && (
                    <View style={[styles.errorContainer, { backgroundColor: colors.semantic.error.light }]}>
                        <MaterialIcons name="error-outline" size={18} color={colors.semantic.error.main} />
                        <Text style={[styles.errorText, { color: colors.semantic.error.main }]}>
                            {error}
                        </Text>
                    </View>
                )}

                {/* Input */}
                <View
                    style={[
                        styles.inputContainer,
                        {
                            paddingBottom: Math.max(insets.bottom, 12),
                            backgroundColor: isDark 
                                ? ContentDarkColors.background.secondary 
                                : colors.background.primary,
                        },
                    ]}
                >
                    {Platform.OS === "ios" && !isDark && (
                        <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="light" />
                    )}
                    <View
                        style={[
                            styles.inputWrapper,
                            {
                                backgroundColor: isDark
                                    ? ContentDarkColors.card.background
                                    : "#FFFFFF",
                                borderColor: isDark
                                    ? ContentDarkColors.border.light
                                    : colors.gray[200],
                                shadowColor: isDark ? "transparent" : "#000",
                            },
                        ]}
                    >
                        <TextInput
                            style={[
                                styles.textInput,
                                {
                                    color: colors.text.primary,
                                    height: Math.min(Math.max(40, inputHeight), 120),
                                },
                            ]}
                            placeholder="Ask me anything..."
                            placeholderTextColor={colors.text.tertiary}
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                            onContentSizeChange={(e) =>
                                setInputHeight(e.nativeEvent.contentSize.height)
                            }
                            editable={!isLoading}
                            autoCapitalize="sentences"
                        />
                        <Pressable
                            onPress={onSend}
                            disabled={!inputText.trim() || isLoading}
                            style={({ pressed }) => [
                                styles.sendButton,
                                {
                                    opacity: pressed ? 0.8 : 1,
                                },
                            ]}
                        >
                            <LinearGradient
                                colors={
                                    inputText.trim() && !isLoading
                                        ? [colors.lilac[600], colors.lilac[800]]
                                        : isDark
                                            ? [colors.gray[600], colors.gray[700]]
                                            : [colors.gray[300], colors.gray[400]]
                                }
                                style={styles.sendButtonGradient}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <MaterialIcons name="arrow-upward" size={20} color="#FFFFFF" />
                                )}
                            </LinearGradient>
                        </Pressable>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerGradient: {
        paddingBottom: 16,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    menuButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    headerCenter: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    headerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: "700",
    },
    messagesList: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 16,
    },
    emptyList: {
        flex: 1,
        justifyContent: "center",
    },
    messageContainer: {
        gap: 12,
    },
    messageRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
    },
    messageRowUser: {
        justifyContent: "flex-end",
    },
    avatarGradient: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 2,
    },
    avatarContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 2,
        overflow: "hidden",
    },
    userAvatarImage: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    messageBubble: {
        maxWidth: "80%",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
    },
    userBubble: {
        alignSelf: "flex-end",
        borderBottomRightRadius: 6,
        maxWidth: "75%",
    },
    assistantBubble: {
        alignSelf: "flex-start",
        borderBottomLeftRadius: 6,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
    },
    typingBubble: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 20,
        borderBottomLeftRadius: 6,
    },
    typingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    // Recipe Card Styles - Single (eski güzel tasarım)
    recipesContainerSingle: {
        marginLeft: 42,
    },
    recipeCard: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 16,
        borderWidth: 1,
        overflow: "hidden",
        padding: 10,
        gap: 12,
    },
    recipeImage: {
        width: 64,
        height: 64,
        borderRadius: 12,
    },
    recipeInfo: {
        flex: 1,
        gap: 4,
    },
    recipeTitle: {
        fontSize: 15,
        fontWeight: "600",
        lineHeight: 20,
    },
    recipeArrow: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    // Recipe Card Styles - Multiple (Compact)
    recipesContainerMultiple: {
        marginLeft: 42,
        gap: 8,
    },
    recipesScrollContent: {
        gap: 10,
        paddingRight: 16,
    },
    recipeCardCompact: {
        width: 140,
        height: 160,
        borderRadius: 16,
        borderWidth: 1,
        overflow: "hidden",
    },
    recipeImageCompact: {
        width: "100%",
        height: "100%",
        position: "absolute",
    },
    recipeGradientOverlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
    },
    recipeInfoCompact: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 10,
    },
    recipeTitleCompact: {
        fontSize: 13,
        fontWeight: "700",
        lineHeight: 16,
        color: "#FFFFFF",
        marginBottom: 4,
    },
    recipeMetaRowCompact: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    recipeMetaCompact: {
        fontSize: 11,
        color: "rgba(255,255,255,0.9)",
    },
    recipeViewButton: {
        position: "absolute",
        top: 8,
        right: 8,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "rgba(0,0,0,0.4)",
        alignItems: "center",
        justifyContent: "center",
    },
    recipeMetaRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    recipeMeta: {
        fontSize: 12,
    },
    // Empty State Styles
    emptyContainer: {
        alignItems: "center",
        paddingHorizontal: 24,
    },
    emptyAvatarWrapper: {
        position: "relative",
        marginBottom: 24,
    },
    avatarGlow: {
        position: "absolute",
        width: 100,
        height: 100,
        borderRadius: 50,
        top: -10,
        left: -10,
        opacity: 0.5,
    },
    emptyAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    emptyTitle: {
        fontSize: 26,
        fontWeight: "700",
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 15,
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 32,
    },
    suggestionsContainer: {
        width: "100%",
    },
    suggestionsTitle: {
        fontSize: 13,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 12,
        textAlign: "center",
    },
    suggestionsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        justifyContent: "center",
    },
    suggestionCard: {
        width: "47%",
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 12,
        paddingVertical: 14,
        borderRadius: 16,
        borderWidth: 1,
    },
    suggestionIcon: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    suggestionText: {
        flex: 1,
        fontSize: 13,
        fontWeight: "500",
        lineHeight: 18,
    },
    errorContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginHorizontal: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        marginBottom: 8,
    },
    errorText: {
        fontSize: 14,
        fontWeight: "500",
    },
    inputContainer: {
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "flex-end",
        borderRadius: 28,
        borderWidth: 1,
        paddingLeft: 18,
        paddingRight: 6,
        paddingVertical: 6,
        gap: 8,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 8,
        paddingHorizontal: 0,
    },
    sendButton: {
        width: 40,
        height: 40,
    },
    sendButtonGradient: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
});
