import React, { useState } from 'react';
import { StyleSheet, View, type TextInputInstance } from 'react-native';
import { TextInput, type TextInputProps } from 'react-native-paper';
import { Txt } from '@/src/components/ui';
import { radius, spacing, type } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';

type Props = Omit<TextInputProps, 'label' | 'mode' | 'left' | 'error'> & {
  label: string;
  /** Leading glyph. */
  icon: string;
  error?: boolean;
  ref?: React.Ref<TextInputInstance>;
};

/** Sign-in field: a fixed label above a rounded, outlined input with a leading icon. */
export function LoginInput({ label, icon, error, style, ...rest }: Props) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.field}>
      <Txt v="label" color={error ? colors.error : colors.onSurfaceVariant}>
        {label}
      </Txt>
      <TextInput
        mode="outlined"
        accessibilityLabel={label}
        error={error}
        autoCapitalize="none"
        autoCorrect={false}
        placeholderTextColor={colors.muted}
        outlineColor={colors.border}
        outlineStyle={styles.outline}
        left={<TextInput.Icon icon={icon} color={error ? colors.error : colors.muted} />}
        style={[styles.input, { backgroundColor: colors.card }, style]}
        {...rest}
      />
    </View>
  );
}

/** LoginInput for a password, with the show/hide toggle. */
export function PasswordInput(props: Omit<Props, 'icon' | 'right' | 'secureTextEntry'>) {
  const [hidden, setHidden] = useState(true);
  return (
    <LoginInput
      icon="lock-outline"
      secureTextEntry={hidden}
      right={
        <TextInput.Icon
          icon={hidden ? 'eye-outline' : 'eye-off-outline'}
          onPress={() => setHidden((h) => !h)}
          accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
        />
      }
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.xs + 2 },
  outline: { borderRadius: radius.md },
  input: { ...type.body, height: 52 },
});
