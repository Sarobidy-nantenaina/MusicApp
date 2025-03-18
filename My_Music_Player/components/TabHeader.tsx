import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useColorScheme } from '@/stores/themeStore';
import { MoveVertical as MoreVertical } from 'lucide-react-native';
import { useState } from 'react';
import { SettingsModal } from './SettingsModal';

type TabHeaderProps = {
  title: string;
  subtitle?: string;
};

export function TabHeader({ title, subtitle }: TabHeaderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: isDark ? '#8E8E93' : '#666' }]}>
              {subtitle}
            </Text>
          )}
        </View>
        <Pressable 
          onPress={() => setShowSettings(true)}
          style={({ pressed }) => [
            styles.settingsButton,
            { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' },
            pressed && { opacity: 0.7 }
          ]}
        >
          <MoreVertical size={24} color={isDark ? '#fff' : '#000'} />
        </Pressable>
      </View>

      <SettingsModal
        isVisible={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});