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

  const { messages, error, sendMessage, isLoading } = useChat({
    transport: new DefaultChatTransport({
      fetch: expoFetch as unknown as typeof globalThis.fetch,
      api: generateAPIUrl("/api/chat"),
    }),
    onError: (error) => console.error(error, "ERROR"),
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hi! I'm your AI kitchen assistant. I can help you find recipes based on your ingredients, suggest meal plans, or answer cooking questions. What's on your mind?",
      },
    ],
  });

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

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
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
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
        {messages.map((m) => (
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
              {m.parts ? (
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
                      const toolInvocation = part.toolInvocation;
                      if (toolInvocation.toolName === "searchRecipes") {
                        if (toolInvocation.state === "result") {
                          const recipes = toolInvocation.result as any[];
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
                        return (
                          <View
                            key={`${m.id}-${i}`}
                            style={styles.toolContainer}
                          >
                            <Text style={styles.toolTitle}>
                              <Feather name="search" size={14} /> Searching for
                              recipes...
                            </Text>
                          </View>
                        );
                      }
                      return null;
                    default:
                      return null;
                  }
                })
              ) : (
                <Text
                  style={[
                    styles.messageText,
                    m.role === "user"
                      ? styles.userMessageText
                      : styles.assistantMessageText,
                  ]}
                >
                  {m.content}
                </Text>
              )}
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
        style={[styles.inputContainer, { paddingBottom: insets.bottom * 3 }]}
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
