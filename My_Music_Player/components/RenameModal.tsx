import { View, Text, StyleSheet, Modal, Pressable, TextInput } from 'react-native';
import { useColorScheme } from '@/stores/themeStore';
import { X } from 'lucide-react-native';
import { useState } from 'react';

type RenameModalProps = {
  isVisible: boolean;
  onClose: () => void;
  onRename: (newName: string) => void;
  currentName: string;
  title: string;
};

export function RenameModal({ 
  isVisible, 
  onClose, 
  onRename, 
  currentName,
  title 
}: RenameModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [newName, setNewName] = useState(currentName);

  const handleRename = () => {
    if (newName.trim() && newName !== currentName) {
      onRename(newName.trim());
    }
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View 
          style={[
            styles.container,
            { backgroundColor: isDark ? '#1C1C1E' : '#fff' }
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>
              {title}
            </Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={24} color={isDark ? '#fff' : '#000'} />
            </Pressable>
          </View>

          <TextInput
            style={[
              styles.input,
              { 
                color: isDark ? '#fff' : '#000',
                backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7'
              }
            ]}
            value={newName}
            onChangeText={setNewName}
            placeholder="Enter new name"
            placeholderTextColor={isDark ? '#8E8E93' : '#666'}
            autoFocus
            onSubmitEditing={handleRename}
          />

          <Pressable
            style={[styles.renameButton, { opacity: newName.trim() ? 1 : 0.5 }]}
            onPress={handleRename}
            disabled={!newName.trim() || newName === currentName}
          >
            <Text style={styles.renameButtonText}>Rename</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
  },
  closeButton: {
    padding: 8,
  },
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    marginBottom: 16,
  },
  renameButton: {
    backgroundColor: '#007AFF',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  renameButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
});