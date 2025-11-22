import { Colors } from "@/constants/theme";
import { RecipeCard } from "@/features/home";
import { generateAPIUrl } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { Feather } from "@expo/vector-icons";
import { DefaultChatTransport } from "ai";
import { useRouter } from "expo-router";
import { fetch as expoFetch } from "expo/fetch";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function PantryChatView() {
  const [input, setInput] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { messages, error, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      fetch: expoFetch as unknown as typeof globalThis.fetch,
      api: generateAPIUrl("/api/chat"),
    }),
    onError: (error) => console.error(error, "ERROR"),
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Initial welcome message
  const welcomeMessage = {
    id: "welcome",
    role: "assistant" as const,
    content: "",
    parts: [
      {
        type: "text" as const,
        text: "Hi! I'm your AI kitchen assistant. I can help you find recipes based on your ingredients, suggest meal plans, or answer cooking questions. What's on your mind?",
      },
    ],
  };

  const displayMessages = messages.length === 0 ? [welcomeMessage] : messages;

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setKeyboardVisible(true)
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardVisible(false)
    );
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput("");
    Keyboard.dismiss();
  };

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error.message}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={[
          styles.messagesContent,
          { paddingBottom: 20 }, // Add some padding at the bottom
        ]}
        showsVerticalScrollIndicator={false}
      >
        {displayMessages.map((m) => (
          <View
            key={m.id}
            style={[
              styles.messageWrapper,
              m.role === "user" ? styles.userMessage : styles.assistantMessage,
              // Allow full width for tool results if needed, but keeping consistent structure is better
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                m.role === "user" ? styles.userBubble : styles.assistantBubble,
              ]}
            >
              {m.parts &&
                m.parts.map((part, i) => {
                  switch (part.type) {
                    case "text":
                      return (
                        <Text
                          key={`${m.id}-${i}`}
                          style={[
                            styles.messageText,
                            m.role === "user"
                              ? styles.userMessageText
                              : styles.assistantMessageText,
                          ]}
                        >
                          {part.text}
                        </Text>
                      );
                    case "tool-invocation":
                    case "tool-searchRecipes":
                      const toolInvocation =
                        part.type === "tool-invocation"
                          ? (part as any).toolInvocation
                          : part;
                      const toolName =
                        toolInvocation.toolName ||
                        (part.type === "tool-searchRecipes"
                          ? "searchRecipes"
                          : "");

                      if (toolName === "searchRecipes") {
                        // Handle different states of the tool execution
                        const state = toolInvocation.state;
                        const args = toolInvocation.args || {};
                        const query = args.query || "recipes";

                        // Loading state
                        if (state === "input-available" || state === "call") {
                          return (
                            <View
                              key={`${m.id}-${i}`}
                              style={styles.toolContainer}
                            >
                              <Text style={styles.toolTitle}>
                                <Feather name="search" size={14} /> Searching
                                for &quot;{query}&quot;...
                              </Text>
                            </View>
                          );
                        }

                        // Result state
                        if (
                          state === "result" ||
                          state === "output-available"
                        ) {
                          const recipes = (toolInvocation.result ||
                            toolInvocation.output) as any[];

                          if (!recipes || recipes.length === 0) {
                            return (
                              <View
                                key={`${m.id}-${i}`}
                                style={styles.toolContainer}
                              >
                                <Text style={styles.toolTitle}>
                                  No recipes found for &quot;{query}&quot;.
                                </Text>
                              </View>
                            );
                          }

                          return (
                            <View
                              key={`${m.id}-${i}`}
                              style={styles.toolResultContainer}
                            >
                              <Text style={styles.toolTitle}>
                                <Feather name="check" size={14} /> Found{" "}
                                {recipes.length} recipes for &quot;{query}&quot;
                                :
                              </Text>
                              <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{
                                  gap: 12,
                                  paddingVertical: 8,
                                }}
                              >
                                {recipes.map((r) => (
                                  <View key={r.id} style={{ width: 220 }}>
                                    <RecipeCard
                                      recipe={{ ...r, imageType: "jpg" }} // Patch imageType
                                      onPress={() =>
                                        router.push(`/(meal)/${r.id}`)
                                      }
                                    />
                                  </View>
                                ))}
                              </ScrollView>
                            </View>
                          );
                        }

                        // Error state
                        if (state === "output-error") {
                          return (
                            <View
                              key={`${m.id}-${i}`}
                              style={styles.toolContainer}
                            >
                              <Text
                                style={[
                                  styles.toolTitle,
                                  { color: Colors.semantic.error.main },
                                ]}
                              >
                                Error searching for &quot;{query}&quot;.
                              </Text>
                            </View>
                          );
                        }
                      }
                      return null;
                    default:
                      return null;
                  }
                })}
            </View>
          </View>
        ))}
        {isLoading && (
          <View style={[styles.messageWrapper, styles.assistantMessage]}>
            <View
              style={[
                styles.messageBubble,
                styles.assistantBubble,
                { flexDirection: "row", alignItems: "center", gap: 8 },
              ]}
            >
              <ActivityIndicator size="small" color={Colors.lilac[600]} />
              <Text style={styles.assistantMessageText}>Thinking...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View
        style={[
          styles.inputContainer,
          { paddingBottom: isKeyboardVisible ? 16 : Math.max(insets.bottom * 3, 80) },
        ]}
      >
        <TextInput
          style={styles.input}
          placeholder="Ask about recipes, ingredients..."
          placeholderTextColor={Colors.gray[400]}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !input.trim() && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!input.trim()}
        >
          <Feather
            name="arrow-up"
            size={20}
            color={input.trim() ? "#FFFFFF" : Colors.gray[400]}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: Colors.semantic.error.main,
    fontSize: 16,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 16,
  },
  messageWrapper: {
    flexDirection: "row",
    maxWidth: "100%", // Changed to 100% to allow card scroll to feel spacious, but bubble is constrained
  },
  userMessage: {
    alignSelf: "flex-end",
    justifyContent: "flex-end",
    maxWidth: "85%", // User messages are text only usually
  },
  assistantMessage: {
    alignSelf: "flex-start",
    justifyContent: "flex-start",
    maxWidth: "100%", // Assistant messages might have cards
  },
  messageBubble: {
    padding: 12,
    borderRadius: 20,
    maxWidth: "100%",
  },
  userBubble: {
    backgroundColor: Colors.lilac[600],
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: Colors.background.primary,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    width: "100%", // Ensure it takes available space for cards
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
  },
  userMessageText: {
    color: "#FFFFFF",
  },
  assistantMessageText: {
    color: Colors.text.primary,
  },
  toolContainer: {
    backgroundColor: Colors.lilac[100],
    padding: 8,
    borderRadius: 8,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  toolResultContainer: {
    marginTop: 4,
    width: "100%",
  },
  toolTitle: {
    fontSize: 12,
    color: Colors.lilac[900],
    fontWeight: "600",
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 16,
    backgroundColor: Colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingTop: 10, // for multiline
    minHeight: 44,
    maxHeight: 100,
    fontSize: 16,
    color: Colors.text.primary,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.lilac[900],
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: Colors.gray[200],
  },
});
