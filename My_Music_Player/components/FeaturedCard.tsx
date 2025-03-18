import { View, Text, Image, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from '@/stores/themeStore';
import { useOrientation } from '@/hooks/useOrientation';

type FeaturedCardProps = {
  title: string;
  description: string;
  imageUrl: string;
  onPress: () => void;
};

export function FeaturedCard({ title, description, imageUrl, onPress }: FeaturedCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const orientation = useOrientation();
  const { width } = useWindowDimensions();

  const cardHeight = orientation === 'landscape' ? 220 : 200;

  return (
    <Pressable 
      onPress={onPress} 
      style={[
        styles.card,
        {
          height: cardHeight,
          shadowColor: isDark ? '#000' : '#000',
          shadowOpacity: isDark ? 0.3 : 0.1,
        }
      ]}
    >
      <Image 
        source={{ uri: imageUrl }} 
        style={styles.image}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 3,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
    justifyContent: 'flex-end',
  },
  content: {
    padding: 16,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 4,
  },
  description: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
});