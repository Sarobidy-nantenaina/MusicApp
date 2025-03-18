import { View, StyleSheet } from 'react-native';
import { Music } from 'lucide-react-native';
import { useColorScheme } from '@/stores/themeStore';

type LogoProps = {
  size?: number;
  showBackground?: boolean;
};

export function Logo({ size = 48, showBackground = true }: LogoProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View 
      style={[
        styles.container,
        {
          width: size,
          height: size,
          backgroundColor: showBackground ? '#007AFF' : 'transparent',
        }
      ]}
    >
      <Music 
        size={size * 0.6} 
        color={showBackground ? '#fff' : '#007AFF'}
        strokeWidth={2.5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});