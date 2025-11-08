import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

const RoleSelector = ({ visible, onClose, currentRole, onSelectRole }) => {
  const { theme, spacing, borderRadius, typography } = useTheme();
  const roles = [
    { id: 'customer', label: 'Customer', color: '#3B82F6' },
    { id: 'kitchen', label: 'Kitchen', color: '#EF4444' },
    { id: 'cashier', label: 'Cashier', color: '#10B981' },
    { id: 'admin', label: 'Admin', color: '#8B5CF6' }
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: theme.colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg }]}>
          <Text style={styles.title}>Select Role</Text>
          <Text style={styles.subtitle}>Current: {currentRole || 'None'}</Text>
          {roles.map((role) => (
            <TouchableOpacity
              key={role.id}
              style={[styles.roleBtn, { padding: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.md, backgroundColor: theme.colors.surfaceVariant }, currentRole === role.id && styles.activeBtn]}
              onPress={() => {
                onSelectRole(role.id);
                onClose();
              }}
            >
              <View style={[styles.colorDot, { backgroundColor: role.color }]} />
              <Text style={[styles.roleText, currentRole === role.id && styles.activeText]}>{role.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.closeBtn, { marginTop: spacing.sm, padding: spacing.md }]} onPress={onClose}>
            <Text style={styles.closeText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modal: { width: '80%', maxWidth: 400, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, marginBottom: 20, textAlign: 'center' },
  roleBtn: { flexDirection: 'row', alignItems: 'center' },
  activeBtn: { backgroundColor: '#EFF6FF', borderWidth: 2, borderColor: '#3B82F6' },
  colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  roleText: { fontSize: 16, fontWeight: '600' },
  activeText: { color: '#3B82F6' },
  closeBtn: { alignItems: 'center' },
  closeText: { fontWeight: '600' }
});

export default RoleSelector;

