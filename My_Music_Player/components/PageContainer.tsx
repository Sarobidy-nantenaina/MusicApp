import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeStore, useColorScheme } from '@/stores/themeStore';
import { ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

type PageContainerProps = {
  children: ReactNode;
  style?: any;
};

export function PageContainer({ children, style }: PageContainerProps) {
  const { fontSize, fontFamily } = useThemeStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const containerStyle = {
    ...styles.container,
    ...(style || {}),
  };

  const childrenWithFont = React.Children.map(children, child => {
    if (!React.isValidElement(child)) return child;

    return React.cloneElement(child, {
      style: {
        ...(child.props.style || {}),
        fontFamily,
      },
    });
  });

  return (
    <LinearGradient
      colors={['#4A148C', '#311B92', '#1A237E']}
      style={containerStyle}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {childrenWithFont}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});