import { getThemeColors } from "@/constants/theme";
import { useTheme } from "@/providers/theme-provider";
import React, { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

interface NumericInputModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (value: string) => void;
  title: string;
  initialValue: string;
  unit: string;
  placeholder?: string;
}

export function NumericInputModal({
  visible,
  onClose,
  onSave,
  title,
  initialValue,
  unit,
  placeholder = "0",
}: NumericInputModalProps) {
  const { isDark } = useTheme();
  const Colors = getThemeColors(isDark);
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (visible) {
      setValue(initialValue);
    }
  }, [visible, initialValue]);

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.modalView, { backgroundColor: Colors.background.surface }]}>
          <Text style={[styles.modalTitle, { color: Colors.text.primary }]}>{title}</Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { color: Colors.text.primary, borderBottomColor: Colors.border.light }]}
              onChangeText={setValue}
              value={value}
              keyboardType="numeric"
              placeholder={placeholder}
              placeholderTextColor={Colors.text.tertiary}
              autoFocus={true}
              selectTextOnFocus={true}
            />
            <Text style={[styles.unitText, { color: Colors.text.secondary }]}>{unit}</Text>
          </View>

          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.button, styles.buttonCancel, { borderColor: Colors.border.light }]}
              onPress={onClose}
            >
              <Text style={[styles.textStyle, { color: Colors.text.primary }]}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.buttonSave, { backgroundColor: Colors.lilac[900] }]}
              onPress={() => onSave(value)}
            >
              <Text style={styles.textStyle}>Save</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalView: {
    width: "80%",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
    justifyContent: 'center',
  },
  input: {
    fontSize: 32,
    fontWeight: '700',
    borderBottomWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    textAlign: 'center',
    minWidth: 100,
  },
  unitText: {
    fontSize: 18,
    marginLeft: 12,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    gap: 12,
  },
  button: {
    borderRadius: 16,
    paddingVertical: 16,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonCancel: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  buttonSave: {
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  textStyle: {
    color: "white",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 16,
  },
});
