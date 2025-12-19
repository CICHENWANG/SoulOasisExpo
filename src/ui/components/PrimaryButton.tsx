import React from 'react';
import {
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';

import { colors } from '../theme/colors';

type Variant = 'primary' | 'danger' | 'ghost';

type Props = PressableProps & {
  title: string;
  variant?: Variant;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export function PrimaryButton({
  title,
  variant = 'primary',
  style,
  textStyle,
  ...props
}: Props) {
  return (
    <Pressable
      {...props}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.text, textVariantStyles[variant], textStyle]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
  },
});

const variantStyles: Record<Variant, ViewStyle> = {
  primary: {
    backgroundColor: colors.primary,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
};

const textVariantStyles: Record<Variant, TextStyle> = {
  primary: {
    color: colors.primaryText,
  },
  danger: {
    color: colors.primaryText,
  },
  ghost: {
    color: colors.text,
  },
};
