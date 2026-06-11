import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import useTheme from '../../hooks/useTheme';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

export const Avatar = ({ source, name = '', size = 50, style }) => {
  const { colors } = useTheme();

  const getInitials = (fullName) => {
    if (!fullName) return 'XP';
    const names = fullName.trim().split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: colors.primaryContainer,
  };

  if (source) {
    return (
      <Image
        source={{ uri: source }}
        style={[styles.avatar, containerStyle, style]}
      />
    );
  }

  return (
    <View style={[styles.avatar, styles.initialsContainer, containerStyle, style]}>
      <Text
        style={[
          styles.initialsText,
          {
            color: colors.onPrimaryContainer,
            fontSize: size * 0.4,
            fontWeight: typography.weights.bold,
          },
        ]}
      >
        {getInitials(name)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontFamily: typography.fontFamily,
  },
});
export default Avatar;
