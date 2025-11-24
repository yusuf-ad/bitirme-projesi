import { Colors } from "@/constants/theme";
import { RecipeCard } from "@/features/home";
import { useAuthContext } from "@/hooks/use-auth-context";
import { generateAPIUrl } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { Feather } from "@expo/vector-icons";
import { DefaultChatTransport } from "ai";
import { useRouter } from "expo-router";
import { fetch as expoFetch } from "expo/fetch";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

type RecipeToolContext = {
  appliedMealType?: string | null;
  requestedMealType?: string | null;
  activeMealSlot?: string | null;
  cookingSkill?: string | null;
  diet?: string | null;
  cuisinePreferences?: string[] | null;
  allergies?: string[] | null;
  usingPantryItems?: boolean;
  mealTimes?: Record<string, { hour: number; minute: number; period: string }>;
};

type NormalizedRecipeToolResult = {
  recipes: any[];
  context?: RecipeToolContext;
  error?: string;
};

const normalizeRecipeToolResult = (result: any): NormalizedRecipeToolResult => {
  if (!result) {
    return { recipes: [] };
  }

  if (Array.isArray(result)) {
    return { recipes: result };
  }

  if (Array.isArray(result.recipes)) {
    return {
      recipes: result.recipes,
      context: result.context,
      error: result.error,
    };
  }

  return {
    recipes: [],
    error: result.error,
  };
};

const formatMealTime = (time?: {
  hour: number;
  minute: number;
  period: string;
}) => {
  if (!time) {
    return "Not set";
  }
  return `${time.hour}:${String(time.minute).padStart(2, "0")} ${time.period}`;
};

const toTitleCase = (value?: string | null) => {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const formatList = (items?: string[] | null, fallback: string = "Not set") => {
  if (!items || items.length === 0) {
    return fallback;
  }
  return items.join(", ");
};

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
  const [confirmationStatus, setConfirmationStatus] = useState<
    Record<string, { loading: boolean; choice?: "yes" | "no" }>
  >({});

  // Initial welcome message
  const welcomeMessage = useMemo(
    () => ({
      id: "welcome",
      role: "assistant" as const,
      content: "",
      parts: [
        {
          type: "text" as const,
          text: "Hi! I'm your AI kitchen assistant. I can help you find recipes based on your ingredients, suggest meal plans, or answer cooking questions. What's on your mind?",
        },
      ],
    }),
    []
  );

  const displayMessages = useMemo(
    () => (messages.length === 0 ? [welcomeMessage] : messages),
    [messages, welcomeMessage]
  );

  const scrollToBottom = useCallback((animated: boolean = true) => {
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollToEnd({ animated });
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

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

  const handleConfirmation = useCallback(
    async (toolCallId: string, choice: "yes" | "no") => {
      if (confirmationStatus[toolCallId]?.loading) {
        return;
      }
      setConfirmationStatus((prev) => ({
        ...prev,
        [toolCallId]: { loading: true, choice },
      }));

      try {
        await addToolOutput({
          tool: "askForMealPlanConfirmation",
          toolCallId,
          output: choice,
        });
      } finally {
        setConfirmationStatus((prev) => ({
          ...prev,
          [toolCallId]: { loading: false, choice },
        }));
      }
    },
    [addToolOutput, confirmationStatus]
  );

  const keyboardOffset = useMemo(
    () => (Platform.OS === "ios" ? insets.top + 64 : 0),
    [insets.top]
  );
  const inputPaddingBottom = isKeyboardVisible
    ? 16
    : Math.max(insets.bottom + 24, 32);
  const scrollContentPadding = Math.max(insets.bottom + 120, 160);

  const handleContentSizeChange = useCallback(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  const handleScrollLayout = useCallback(() => {
    scrollToBottom(false);
  }, [scrollToBottom]);

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
      keyboardVerticalOffset={keyboardOffset}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={[
          styles.messagesContent,
          { paddingBottom: scrollContentPadding },
        ]}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={handleContentSizeChange}
        onLayout={handleScrollLayout}
        keyboardShouldPersistTaps="handled"
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
                        <View
                          key={`${m.id}-${i}`}
                          style={
                            !isUser ? styles.assistantTextBubble : undefined
                          }
                        >
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
                          const confirmationState =
                            confirmationStatus[toolCallId];
                          const isSubmitting = confirmationState?.loading;
                          const pendingChoice = confirmationState?.choice;
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
                                    isSubmitting &&
                                      styles.confirmationButtonDisabled,
                                  ]}
                                  onPress={() =>
                                    handleConfirmation(toolCallId, "yes")
                                  }
                                  disabled={isSubmitting}
                                >
                                  {isSubmitting && pendingChoice === "yes" ? (
                                    <ActivityIndicator
                                      size="small"
                                      color="#FFFFFF"
                                    />
                                  ) : (
                                    <Text
                                      style={styles.confirmationButtonTextYes}
                                    >
                                      Yes, create meal plan
                                    </Text>
                                  )}
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={[
                                    styles.confirmationButton,
                                    styles.confirmationButtonNo,
                                    isSubmitting &&
                                      styles.confirmationButtonDisabled,
                                  ]}
                                  onPress={() =>
                                    handleConfirmation(toolCallId, "no")
                                  }
                                  disabled={isSubmitting}
                                >
                                  {isSubmitting && pendingChoice === "no" ? (
                                    <ActivityIndicator
                                      size="small"
                                      color={Colors.text.primary}
                                    />
                                  ) : (
                                    <Text
                                      style={styles.confirmationButtonTextNo}
                                    >
                                      No, thanks
                                    </Text>
                                  )}
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
                    case "tool-searchPersonalizedRecipes":
                    case "tool-getPantryItems":
                    case "tool-getUserPreferences":
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
                          : part.type === "tool-searchPersonalizedRecipes"
                          ? "searchPersonalizedRecipes"
                          : part.type === "tool-getPantryItems"
                          ? "getPantryItems"
                          : part.type === "tool-getUserPreferences"
                          ? "getUserPreferences"
                          : "");

                      // Handle searchRecipes and searchRecipesWithPantryItems (they share similar UI)
                      if (
                        toolName === "searchRecipes" ||
                        toolName === "searchRecipesWithPantryItems" ||
                        toolName === "searchPersonalizedRecipes"
                      ) {
                        const state = toolInvocation.state;
                        const args = toolInvocation.args || {};
                        // For pantry search, query might not exist, use default
                        const query =
                          args.query ||
                          (toolName === "searchRecipesWithPantryItems"
                            ? "pantry recipes"
                            : toolName === "searchPersonalizedRecipes"
                            ? "personalized picks"
                            : "recipes");
                        const isPersonalized =
                          toolName === "searchPersonalizedRecipes";

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
                                  : isPersonalized
                                  ? "Finding personalized picks..."
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
                          const { recipes, context, error } =
                            normalizeRecipeToolResult(result);

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
                                  {isPersonalized
                                    ? "No recipes matched your preferences."
                                    : "No recipes found."}
                                </Text>
                              </View>
                            );
                          }

                          return (
                            <View
                              key={`${m.id}-${i}`}
                              style={styles.toolResultContainer}
                            >
                              {context && (
                                <View style={styles.recipeContextRow}>
                                  {context.appliedMealType && (
                                    <View style={styles.contextBadge}>
                                      <Text style={styles.contextBadgeText}>
                                        {toTitleCase(context.appliedMealType)}
                                      </Text>
                                    </View>
                                  )}
                                  {context.diet && (
                                    <View style={styles.contextBadge}>
                                      <Text style={styles.contextBadgeText}>
                                        {context.diet}
                                      </Text>
                                    </View>
                                  )}
                                  {context.usingPantryItems && (
                                    <View style={styles.contextBadge}>
                                      <Text style={styles.contextBadgeText}>
                                        Pantry
                                      </Text>
                                    </View>
                                  )}
                                </View>
                              )}
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
                          const preview = Array.isArray(result.ingredients)
                            ? result.ingredients.slice(0, 4)
                            : [];
                          return (
                            <View
                              key={`${m.id}-${i}`}
                              style={styles.toolContainer}
                            >
                              <Text style={styles.toolTitle}>
                                <Feather name="check" size={14} /> Checked
                                pantry: Found {result.count} items.
                              </Text>
                              {preview.length > 0 && (
                                <Text style={styles.toolSubtitle}>
                                  {preview.join(", ")}
                                  {result.count > preview.length
                                    ? ` +${result.count - preview.length} more`
                                    : ""}
                                </Text>
                              )}
                            </View>
                          );
                        }

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
                                Could not load pantry items.
                              </Text>
                            </View>
                          );
                        }
                      }

                      if (toolName === "getUserPreferences") {
                        const state = toolInvocation.state;

                        if (state === "input-available" || state === "call") {
                          return (
                            <View
                              key={`${m.id}-${i}`}
                              style={styles.toolContainer}
                            >
                              <Text style={styles.toolTitle}>
                                <Feather name="user" size={14} /> Loading your
                                preferences...
                              </Text>
                            </View>
                          );
                        }

                        if (
                          state === "result" ||
                          state === "output-available"
                        ) {
                          const result =
                            toolInvocation.result ||
                            toolInvocation.output ||
                            {};

                          if (result?.error) {
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
                                  {result.error}
                                </Text>
                              </View>
                            );
                          }

                          const diet = formatList(
                            result?.preferences?.dietPreferences,
                            "Any diet"
                          );
                          const cuisines = formatList(
                            result?.preferences?.cuisines,
                            "Any cuisines"
                          );
                          const allergies = formatList(
                            result?.preferences?.allergies,
                            "No allergies saved"
                          );
                          const cookingSkill =
                            toTitleCase(result?.preferences?.cookingSkill) ||
                            "Any skill";
                          const mealTypes = formatList(
                            result?.preferences?.mealTypes,
                            "No meal types set"
                          );
                          const mealTimes = result?.mealTimes;

                          return (
                            <View
                              key={`${m.id}-${i}`}
                              style={styles.toolContainer}
                            >
                              <Text style={styles.toolTitle}>
                                <Feather name="user" size={14} /> Preferences
                                synced
                              </Text>
                              <View style={styles.profileSummaryGrid}>
                                <Text style={styles.toolSubtitle}>
                                  Diet: {diet}
                                </Text>
                                <Text style={styles.toolSubtitle}>
                                  Cuisines: {cuisines}
                                </Text>
                              </View>
                              <View style={styles.profileSummaryGrid}>
                                <Text style={styles.toolSubtitle}>
                                  Allergies: {allergies}
                                </Text>
                                <Text style={styles.toolSubtitle}>
                                  Cooking skill: {cookingSkill}
                                </Text>
                              </View>
                              <View style={styles.profileSummaryGrid}>
                                <Text style={styles.toolSubtitle}>
                                  Meals: {mealTypes}
                                </Text>
                              </View>
                              <View style={styles.profileSummaryGrid}>
                                <Text style={styles.toolSubtitle}>
                                  Breakfast:{" "}
                                  {formatMealTime(mealTimes?.breakfast)}
                                </Text>
                                <Text style={styles.toolSubtitle}>
                                  Lunch: {formatMealTime(mealTimes?.lunch)}
                                </Text>
                                <Text style={styles.toolSubtitle}>
                                  Dinner: {formatMealTime(mealTimes?.dinner)}
                                </Text>
                              </View>
                              {result?.activeMealSlot && (
                                <Text style={styles.profileFootnote}>
                                  Current focus:{" "}
                                  {toTitleCase(result.activeMealSlot)}
                                </Text>
                              )}
                            </View>
                          );
                        }

                        return null;
                      }
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
          { paddingBottom: inputPaddingBottom + 52 },
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
    alignSelf: "flex-start",
  },
  userBubble: {
    backgroundColor: Colors.lilac[900],
    borderTopRightRadius: 12,
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderRadius: 24,
  },
  assistantBubble: {
    width: "100%",
    padding: 0,
    gap: 8,
  },
  assistantTextBubble: {
    backgroundColor: Colors.background.primary,
    borderRadius: 18,
    padding: 12,
    maxWidth: "90%",
    borderWidth: 1,
    borderColor: Colors.lilac[100],
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
    gap: 6,
    width: "100%",
  },
  toolResultContainer: {
    marginTop: 4,
    width: "100%",
    gap: 8,
    borderRadius: 16,
    padding: 12,
  },
  toolTitle: {
    fontSize: 12,
    color: Colors.lilac[900],
    fontWeight: "600",
    marginBottom: 4,
  },
  toolSubtitle: {
    fontSize: 13,
    color: Colors.gray[600],
    lineHeight: 18,
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
  confirmationButtonDisabled: {
    opacity: 0.7,
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
  recipeContextRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },
  contextBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: Colors.lilac[100],
  },
  contextBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.lilac[900],
    textTransform: "capitalize",
  },
  profileSummaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  profileFootnote: {
    fontSize: 12,
    color: Colors.gray[600],
    marginTop: 4,
  },
});
