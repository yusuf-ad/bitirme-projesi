import { Colors } from "@/constants/theme";
import { useState } from "react";
import { Controller } from "react-hook-form";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

interface CustomTextInputProps extends TextInputProps {
  control: any;
  name: string;
  label?: string;
  error?: string;
  placeholder: string;
  containerStyle?: object;
  labelStyle?: object;
  inputStyle?: object;
}

export function CustomTextInput({
  control,
  name,
  label,
  error,
  placeholder,
  containerStyle,
  labelStyle,
  inputStyle,
  style,
  ...props
}: CustomTextInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[containerStyle, { width: "100%" }]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <Controller
        control={control}
        rules={{
          required: true,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            placeholder={placeholder}
            style={[
              styles.textInput,
              inputStyle,
              style,
              isFocused && styles.inputFocused,
              error && styles.inputContainerError,
            ]}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false);
              onBlur();
            }}
            onChangeText={onChange}
            value={value}
            {...props}
          />
        )}
        name={name}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9CA3AF",
    lineHeight: 36,
    paddingLeft: 16,
  },
  inputContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BEC5D1",
    height: 48,
    justifyContent: "center",
  },
  inputContainerError: {
    borderColor: "#EF4444",
  },
  textInput: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    fontSize: 16,
    color: "#000000",
    backgroundColor: "#f1f4ff",
    borderWidth: 2,
    borderColor: "transparent",
  },
  inputFocused: {
    borderColor: Colors.lilac[900],
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    paddingLeft: 16,
    marginTop: 4,
  },
});
