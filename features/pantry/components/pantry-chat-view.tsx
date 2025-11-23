import { Colors } from "@/constants/theme";
import { RecipeCard } from "@/features/home";
import { useAuthContext } from "@/hooks/use-auth-context";
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
import { Markdown } from "react-native-remark";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function PantryChatView() {
  const [input, setInput] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session } = useAuthContext();

  const { messages, error, sendMessage, status, addToolOutput } = useChat({
    transport: new DefaultChatTransport({
      fetch: expoFetch as unknown as typeof globalThis.fetch,
      api: generateAPIUrl("/api/chat"),
      body: session?.user
        ? { userId: session.user.id, accessToken: session.access_token }
        : {},
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
                      const isUser = m.role === "user";
                      const textColor = isUser
                        ? "#FFFFFF"
                        : Colors.text.primary;

                      return (
                        <View key={`${m.id}-${i}`}>
                          <Markdown
                            markdown={part.text}
                            customStyles={{
                              text: {
                                fontSize: 16,
                                lineHeight: 24,
                                color: textColor,
                              },
                              strong: {
                                fontWeight: "bold",
                                color: textColor,
                              },
                              emphasis: {
                                fontStyle: "italic",
                                color: textColor,
                              },
                              paragraph: {
                                marginTop: 0,
                                marginBottom: 8,
                              },
                              link: {
                                color: isUser ? "#FFFFFF" : Colors.lilac[600],
                              },
                              list: {
                                marginBottom: 8,
                              },
                            }}
                          />
                        </View>
                      );
                    case "tool-askForMealPlanConfirmation": {
                      const toolCallId = part.toolCallId;

                      switch (part.state) {
                        case "input-streaming":
                          return (
                            <View
                              key={`${m.id}-${i}`}
                              style={styles.confirmationContainer}
                            >
                              <ActivityIndicator
                                size="small"
                                color={Colors.lilac[600]}
                              />
                            </View>
                          );
                        case "input-available":
                          return (
                            <View
                              key={`${m.id}-${i}`}
                              style={styles.confirmationContainer}
                            >
                              <Text style={styles.confirmationMessage}>
                                {(part.input as { message: string }).message}
                              </Text>
                              <View style={styles.confirmationButtons}>
                                <TouchableOpacity
                                  style={[
                                    styles.confirmationButton,
                                    styles.confirmationButtonYes,
                                  ]}
                                  onPress={() =>
                                    addToolOutput({
                                      tool: "askForMealPlanConfirmation",
                                      toolCallId,
                                      output: "yes",
                                    })
                                  }
                                >
                                  <Text
                                    style={styles.confirmationButtonTextYes}
                                  >
                                    Yes, create meal plan
                                  </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={[
                                    styles.confirmationButton,
                                    styles.confirmationButtonNo,
                                  ]}
                                  onPress={() =>
                                    addToolOutput({
                                      tool: "askForMealPlanConfirmation",
                                      toolCallId,
                                      output: "no",
                                    })
                                  }
                                >
                                  <Text style={styles.confirmationButtonTextNo}>
                                    No, thanks
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          );
                        case "output-available":
                          return (
                            <View
                              key={`${m.id}-${i}`}
                              style={styles.confirmationContainer}
                            >
                              <Text style={styles.confirmationResult}>
                                <Feather name="check-circle" size={14} />{" "}
                                {part.output === "yes"
                                  ? "Creating meal plan..."
                                  : "Okay, let me know if you need anything else!"}
                              </Text>
                            </View>
                          );
                      }
                      return null;
                    }
                    case "tool-invocation":
                    case "tool-searchRecipes":
                    case "tool-searchRecipesWithPantryItems":
                    case "tool-getPantryItems":
                      const toolInvocation =
                        part.type === "tool-invocation"
                          ? (part as any).toolInvocation
                          : part;
                      const toolName =
                        toolInvocation.toolName ||
                        (part.type === "tool-searchRecipes"
                          ? "searchRecipes"
                          : part.type === "tool-searchRecipesWithPantryItems"
                          ? "searchRecipesWithPantryItems"
                          : part.type === "tool-getPantryItems"
                          ? "getPantryItems"
                          : "");

                      // Handle searchRecipes and searchRecipesWithPantryItems (they share similar UI)
                      if (
                        toolName === "searchRecipes" ||
                        toolName === "searchRecipesWithPantryItems"
                      ) {
                        const state = toolInvocation.state;
                        const args = toolInvocation.args || {};
                        // For pantry search, query might not exist, use default
                        const query =
                          args.query ||
                          (toolName === "searchRecipesWithPantryItems"
                            ? "pantry recipes"
                            : "recipes");

                        // Loading state
                        if (state === "input-available" || state === "call") {
                          return (
                            <View
                              key={`${m.id}-${i}`}
                              style={styles.toolContainer}
                            >
                              <Text style={styles.toolTitle}>
                                <Feather name="search" size={14} />{" "}
                                {toolName === "searchRecipesWithPantryItems"
                                  ? "Finding recipes with your ingredients..."
                                  : `Searching for "${query}"...`}
                              </Text>
                            </View>
                          );
                        }

                        // Result state
                        if (
                          state === "result" ||
                          state === "output-available"
                        ) {
                          const result =
                            toolInvocation.result || toolInvocation.output;

                          // Check if result is an array (recipes) or something else (error object)
                          const recipes = Array.isArray(result) ? result : [];
                          const error = !Array.isArray(result) && result?.error;

                          if (error) {
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
                                  {error || "Error searching for recipes."}
                                </Text>
                              </View>
                            );
                          }

                          if (recipes.length === 0) {
                            return (
                              <View
                                key={`${m.id}-${i}`}
                                style={styles.toolContainer}
                              >
                                <Text style={styles.toolTitle}>
                                  No recipes found.
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
                                {recipes.length} recipes:
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
                                  <View key={r.id} style={{ width: 152 }}>
                                    <RecipeCard
                                      variant="chat"
                                      recipe={{ ...r, imageType: "jpg" }}
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
                                Error searching for recipes.
                              </Text>
                            </View>
                          );
                        }
                      }

                      // Handle getPantryItems UI
                      if (toolName === "getPantryItems") {
                        const state = toolInvocation.state;

                        if (state === "input-available" || state === "call") {
                          return (
                            <View
                              key={`${m.id}-${i}`}
                              style={styles.toolContainer}
                            >
                              <Text style={styles.toolTitle}>
                                <Feather name="package" size={14} /> Checking
                                pantry...
                              </Text>
                            </View>
                          );
                        }

                        if (
                          state === "result" ||
                          state === "output-available"
                        ) {
                          const result = toolInvocation.result ||
                            toolInvocation.output || { count: 0 };
                          return (
                            <View
                              key={`${m.id}-${i}`}
                              style={styles.toolContainer}
                            >
                              <Text style={styles.toolTitle}>
                                <Feather name="check" size={14} /> Checked
                                pantry: Found {result.count} items.
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
          {
            paddingBottom: isKeyboardVisible
              ? 16
              : Math.max(insets.bottom * 3, 80),
          },
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
    backgroundColor: Colors.lilac[900],
    borderTopRightRadius: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
  },
  assistantBubble: {
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
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: Colors.lilac[400],
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.51,
    shadowRadius: 13.16,

    elevation: 20,
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
  confirmationContainer: {
    backgroundColor: Colors.lilac[100],
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.lilac[200],
  },
  confirmationMessage: {
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 12,
    fontWeight: "500",
  },
  confirmationButtons: {
    flexDirection: "row",
    gap: 8,
  },
  confirmationButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmationButtonYes: {
    backgroundColor: Colors.lilac[900],
  },
  confirmationButtonNo: {
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.gray[300],
  },
  confirmationButtonTextYes: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  confirmationButtonTextNo: {
    color: Colors.text.primary,
    fontSize: 15,
    fontWeight: "600",
  },
  confirmationResult: {
    fontSize: 14,
    color: Colors.lilac[900],
    fontWeight: "500",
  },
});
