import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useTheme from '../../hooks/useTheme';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

export const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  icon,
  style,
  inputStyle,
  onBlur,
  multiline = false,
  ...props
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const getBorderColor = () => {
    if (error) return colors.error;
    if (isFocused) return colors.primary;
    return colors.border;
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          multiline && styles.inputContainerMultiline,
          {
            borderColor: getBorderColor(),
            backgroundColor: colors.surface,
          },
        ]}
      >
        {icon && (
          <View style={[styles.iconContainer, multiline && styles.iconContainerMultiline]}>
            <MaterialCommunityIcons name={icon} size={20} color={error ? colors.error : colors.textSecondary} />
          </View>
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          multiline={multiline}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            if (onBlur) onBlur();
          }}
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            {
              color: colors.text,
              fontFamily: typography.fontFamily,
            },
            inputStyle,
          ]}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity activeOpacity={0.7} onPress={togglePasswordVisibility} style={styles.passwordToggle}>
            <MaterialCommunityIcons
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: spacing.borderRadius.md,
    height: 52,
    paddingHorizontal: spacing.md,
  },
  inputContainerMultiline: {
    height: undefined,
    minHeight: 52,
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  iconContainerMultiline: {
    marginTop: 2,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: typography.sizes.md,
  },
  inputMultiline: {
    height: undefined,
    textAlignVertical: 'top',
  },
  passwordToggle: {
    padding: spacing.xs,
  },
  errorText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    marginTop: spacing.xs,
  },
});
export default Input;
