import { Colors, ContentDarkColors } from "@/constants/theme";
import { useAuthContext } from "@/hooks/use-auth-context";
import { useTheme } from "@/providers/theme-provider";
import { MaterialIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { Image as ExpoImage } from "expo-image";
import { useRouter } from "expo-router";
import { fetch as expoFetch } from "expo/fetch";
import { useCallback, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
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
    const debuggerHost = Constants.expoConfig?.hostUri;
    const localhost = debuggerHost?.split(":")[0];
    if (!localhost) {
        return "http://localhost:8081";
    }
    return `http://${localhost}:8081`;
};

interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
}

interface MessageBubbleProps {
    content: string;
    role: "user" | "assistant";
    isDark: boolean;
    userAvatarUrl?: string | null;
}

function MessageBubble({ content, role, isDark, userAvatarUrl }: MessageBubbleProps) {
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
        <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
            {!isUser && (
                <View style={[styles.avatarContainer, { backgroundColor: colors.lilac[600] }]}>
                    <MaterialIcons name="auto-awesome" size={14} color="#FFFFFF" />
                </View>
            )}
            <View
                style={[
                    styles.messageBubble,
                    isUser ? styles.userBubble : styles.assistantBubble,
                    {
                        backgroundColor: isUser
                            ? colors.lilac[700]
                            : isDark
                                ? ContentDarkColors.card.background
                                : colors.gray[100],
                    },
                ]}
            >
                {isUser ? (
                    <Text style={[styles.messageText, { color: textColor }]}>
                        {content}
                    </Text>
                ) : (
                    <Markdown style={markdownStyles}>{content}</Markdown>
                )}
            </View>
            {isUser && (
                <View style={[styles.avatarContainer, { backgroundColor: colors.lilac[400] }]}>
                    {userAvatarUrl ? (
                        <ExpoImage source={{ uri: userAvatarUrl }} style={styles.userAvatarImage} />
                    ) : (
                        <MaterialIcons name="person" size={16} color="#FFFFFF" />
                    )}
                </View>
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
            
            const response = await expoFetch(`${baseUrl}/api/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messages: [...messages, newUserMessage].map((m) => ({
                        role: m.role,
                        content: m.content,
                    })),
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
            };

            setMessages((prev) => [...prev, assistantMessage]);

            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        } catch (err) {
            console.error("Chat error:", err);
            setError("Bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setIsLoading(false);
        }
    }, [inputText, isLoading, messages]);

    const renderMessage = useCallback(
        ({ item }: { item: ChatMessage }) => (
            <MessageBubble 
                content={item.content} 
                role={item.role} 
                isDark={isDark} 
                userAvatarUrl={profile?.avatar_url}
            />
        ),
        [isDark, profile?.avatar_url]
    );

    return (
        <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background.primary }]}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={0}
        >
            {/* Header */}
            <View
                style={[
                    styles.header,
                    {
                        paddingTop: insets.top + 8,
                        backgroundColor: colors.background.primary,
                        borderBottomColor: isDark
                            ? ContentDarkColors.border.light
                            : colors.gray[200],
                    },
                ]}
            >
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <MaterialIcons
                        name="arrow-back"
                        size={24}
                        color={colors.text.primary}
                    />
                </Pressable>
                <View style={styles.headerCenter}>
                    <View
                        style={[styles.aiAvatar, { backgroundColor: colors.lilac[600] }]}
                    >
                        <MaterialIcons name="auto-awesome" size={18} color="#FFFFFF" />
                    </View>
                    <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
                        AI Assistant
                    </Text>
                </View>
                <View style={styles.headerSpacer} />
            </View>

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
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View
                            style={[
                                styles.emptyIconContainer,
                                { backgroundColor: colors.lilac[100] },
                            ]}
                        >
                            <MaterialIcons
                                name="chat-bubble-outline"
                                size={48}
                                color={colors.lilac[600]}
                            />
                        </View>
                        <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
                            Merhaba! 👋
                        </Text>
                        <Text
                            style={[styles.emptySubtitle, { color: colors.text.secondary }]}
                        >
                            Yemek tarifleri, beslenme önerileri veya mutfakla ilgili her
                            konuda sana yardımcı olabilirim.
                        </Text>
                    </View>
                }
            />

            {/* Loading indicator */}
            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={colors.lilac[600]} />
                    <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
                        Düşünüyor...
                    </Text>
                </View>
            )}

            {/* Error message */}
            {error && (
                <View
                    style={[
                        styles.errorContainer,
                        { backgroundColor: colors.semantic.error.light },
                    ]}
                >
                    <Text
                        style={[styles.errorText, { color: colors.semantic.error.main }]}
                    >
                        {error}
                    </Text>
                </View>
            )}

            {/* Input */}
            <View
                style={[
                    styles.inputContainer,
                    {
                        paddingBottom: Math.max(insets.bottom, 8),
                        backgroundColor: colors.background.primary,
                        borderTopColor: isDark
                            ? ContentDarkColors.border.light
                            : colors.gray[200],
                    },
                ]}
            >
                <View
                    style={[
                        styles.inputWrapper,
                        {
                            backgroundColor: isDark
                                ? ContentDarkColors.card.background
                                : colors.gray[100],
                            borderColor: isDark
                                ? ContentDarkColors.border.light
                                : colors.gray[200],
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
                        placeholder="Mesajınızı yazın..."
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
                        style={[
                            styles.sendButton,
                            {
                                backgroundColor:
                                    inputText.trim() && !isLoading
                                        ? colors.lilac[700]
                                        : isDark
                                            ? colors.gray[600]
                                            : colors.gray[300],
                            },
                        ]}
                    >
                        <MaterialIcons name="send" size={20} color="#FFFFFF" />
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
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 4,
        width: 40,
    },
    headerCenter: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    aiAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: "600",
    },
    headerSpacer: {
        width: 40,
    },
    messagesList: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 12,
    },
    emptyList: {
        flex: 1,
        justifyContent: "center",
    },
    messageRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 8,
    },
    messageRowUser: {
        justifyContent: "flex-end",
    },
    avatarContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 2,
        overflow: "hidden",
    },
    userAvatarImage: {
        width: 28,
        height: 28,
        borderRadius: 14,
    },
    messageBubble: {
        maxWidth: "85%",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 18,
        flex: 1,
    },
    userBubble: {
        alignSelf: "flex-end",
        borderBottomRightRadius: 4,
        flex: 0,
        maxWidth: "75%",
    },
    assistantBubble: {
        alignSelf: "flex-start",
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 21,
    },
    emptyContainer: {
        alignItems: "center",
        paddingHorizontal: 32,
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 15,
        textAlign: "center",
        lineHeight: 22,
    },
    loadingContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 8,
    },
    loadingText: {
        fontSize: 13,
    },
    errorContainer: {
        marginHorizontal: 16,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginBottom: 8,
    },
    errorText: {
        fontSize: 13,
        textAlign: "center",
    },
    inputContainer: {
        paddingHorizontal: 16,
        paddingTop: 12,
        borderTopWidth: 1,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "flex-end",
        borderRadius: 24,
        borderWidth: 1,
        paddingLeft: 16,
        paddingRight: 6,
        paddingVertical: 6,
        gap: 8,
    },
    textInput: {
        flex: 1,
        fontSize: 15,
        paddingVertical: 6,
    },
    sendButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
    },
});
