import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { useColorScheme, useThemeStore } from '@/stores/themeStore';
import { Moon, Sun, Smartphone, Type, X, AlignLeft, Bold, Italic, Palette } from 'lucide-react-native';

type SettingsModalProps = {
  isVisible: boolean;
  onClose: () => void;
};

const FONT_STYLES = [
  { family: 'Inter', title: 'Regular', icon: AlignLeft },
  { family: 'Inter_Light', title: 'Light', icon: AlignLeft },
  { family: 'Inter_ExtraLight', title: 'Extra Light', icon: AlignLeft },
  { family: 'Inter_Medium', title: 'Medium', icon: AlignLeft },
  { family: 'Inter_SemiBold', title: 'Semi Bold', icon: Bold },
  { family: 'Inter_Bold', title: 'Bold', icon: Bold },
  { family: 'Inter_Black', title: 'Black', icon: Bold },
  { family: 'Inter_Italic', title: 'Italic', icon: Italic },
] as const;

const BACKGROUND_THEMES = [
  { 
    id: 'default',
    name: 'Default',
    colors: ['#4A148C', '#311B92', '#1A237E'],
  },
  {
    id: 'sunset',
    name: 'Sunset',
    colors: ['#FF512F', '#DD2476', '#FF0080'],
  },
  {
    id: 'ocean',
    name: 'Ocean',
    colors: ['#2E3192', '#1BFFFF', '#D4FFFF'],
  },
  {
    id: 'forest',
    name: 'Forest',
    colors: ['#134E5E', '#71B280', '#2ECC71'],
  },
  {
    id: 'aurora',
    name: 'Aurora',
    colors: ['#1D976C', '#93F9B9', '#2ECC71'],
  },
  {
    id: 'midnight',
    name: 'Midnight',
    colors: ['#232526', '#414345', '#000000'],
  },
] as const;

export function SettingsModal({ isVisible, onClose }: SettingsModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { 
    setTheme, 
    setFontSize, 
    setFontFamily, 
    fontSize, 
    fontFamily,
    backgroundTheme,
    setBackgroundTheme 
  } = useThemeStore();

  const ThemeOption = ({ 
    title, 
    icon: Icon, 
    theme 
  }: { 
    title: string; 
    icon: typeof Moon; 
    theme: 'light' | 'dark' | 'system';
  }) => (
    <Pressable
      onPress={() => setTheme(theme)}
      style={[
        styles.option,
        {
          backgroundColor: isDark ? '#1C1C1E' : '#fff',
          borderColor: isDark ? '#2C2C2E' : '#E5E5EA',
        }
      ]}
    >
      <Icon size={24} color={isDark ? '#fff' : '#000'} />
      <Text style={[styles.optionText, { color: isDark ? '#fff' : '#000' }]}>
        {title}
      </Text>
    </Pressable>
  );

  const FontSizeOption = ({ size, title }: { size: 'small' | 'medium' | 'large'; title: string }) => (
    <Pressable
      onPress={() => setFontSize(size)}
      style={[
        styles.option,
        {
          backgroundColor: isDark ? '#1C1C1E' : '#fff',
          borderColor: isDark ? '#2C2C2E' : '#E5E5EA',
          opacity: fontSize === size ? 1 : 0.7,
        }
      ]}
    >
      <Type size={size === 'small' ? 20 : size === 'large' ? 28 : 24} color={isDark ? '#fff' : '#000'} />
      <Text style={[styles.optionText, { color: isDark ? '#fff' : '#000' }]}>
        {title}
      </Text>
    </Pressable>
  );

  const FontStyleOption = ({ family, title, icon: Icon }: { family: string; title: string; icon: typeof AlignLeft }) => (
    <Pressable
      onPress={() => setFontFamily(family as any)}
      style={[
        styles.option,
        {
          backgroundColor: isDark ? '#1C1C1E' : '#fff',
          borderColor: isDark ? '#2C2C2E' : '#E5E5EA',
          opacity: fontFamily === family ? 1 : 0.7,
        }
      ]}
    >
      <Icon size={24} color={isDark ? '#fff' : '#000'} />
      <Text style={[styles.fontPreview, { fontFamily: family, color: isDark ? '#fff' : '#000' }]}>
        Aa
      </Text>
      <Text style={[styles.optionText, { color: isDark ? '#fff' : '#000' }]}>
        {title}
      </Text>
    </Pressable>
  );

  const BackgroundThemeOption = ({ theme }: { theme: typeof BACKGROUND_THEMES[number] }) => (
    <Pressable
      onPress={() => setBackgroundTheme(theme.id)}
      style={[
        styles.backgroundOption,
        {
          backgroundColor: isDark ? '#1C1C1E' : '#fff',
          borderColor: isDark ? '#2C2C2E' : '#E5E5EA',
          opacity: backgroundTheme === theme.id ? 1 : 0.7,
        }
      ]}
    >
      <View style={styles.gradientPreview}>
        {theme.colors.map((color, index) => (
          <View 
            key={index}
            style={[styles.colorBlock, { backgroundColor: color }]}
          />
        ))}
      </View>
      <Text style={[styles.optionText, { color: isDark ? '#fff' : '#000' }]}>
        {theme.name}
      </Text>
    </Pressable>
  );

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F2F2F7' }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>
              Settings
            </Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={24} color={isDark ? '#fff' : '#000'} />
            </Pressable>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
                Background Theme
              </Text>
              <View style={styles.backgroundGrid}>
                {BACKGROUND_THEMES.map(theme => (
                  <BackgroundThemeOption key={theme.id} theme={theme} />
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
                Appearance
              </Text>
              <View style={styles.optionsGrid}>
                <ThemeOption title="Light" icon={Sun} theme="light" />
                <ThemeOption title="Dark" icon={Moon} theme="dark" />
                <ThemeOption title="System" icon={Smartphone} theme="system" />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
                Font Size
              </Text>
              <View style={styles.optionsGrid}>
                <FontSizeOption size="small" title="Small" />
                <FontSizeOption size="medium" title="Medium" />
                <FontSizeOption size="large" title="Large" />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
                Font Style
              </Text>
              <View style={styles.optionsGrid}>
                {FONT_STYLES.map(style => (
                  <FontStyleOption
                    key={style.family}
                    family={style.family}
                    title={style.title}
                    icon={style.icon}
                  />
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    flex: 1,
    marginTop: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  backgroundGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  option: {
    flex: 1,
    minWidth: 100,
    flexDirection: 'column',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  backgroundOption: {
    width: '48%',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  gradientPreview: {
    flexDirection: 'row',
    height: 40,
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  colorBlock: {
    flex: 1,
    height: '100%',
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
  fontPreview: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
  },
});