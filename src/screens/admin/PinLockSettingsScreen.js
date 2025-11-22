import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Modal, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { usePinLock } from '../../contexts/PinLockContext';
import { alertService } from '../../services/alertService';
import Icon from '../../components/ui/Icon';
import AnimatedButton from '../../components/ui/AnimatedButton';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import { appConfig } from '../../config/appConfig';

const PinLockSettingsScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme, spacing, borderRadius, typography } = useTheme();
  const {
    pinEnabled,
    timeoutMinutes,
    loading: pinLockLoading,
    setPin,
    changePin,
    resetPin,
    setPinEnabled,
    setTimeoutMinutes: setTimeoutMinutesValue,
    checkPinExists,
  } = usePinLock();

  const [loading, setLoading] = useState(false);
  const [pinExists, setPinExists] = useState(false);
  const [checkingPin, setCheckingPin] = useState(true);
  
  // Set PIN states
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showSetPinModal, setShowSetPinModal] = useState(false);
  
  // Change PIN states
  const [currentPin, setCurrentPin] = useState('');
  const [newPinForChange, setNewPinForChange] = useState('');
  const [confirmPinForChange, setConfirmPinForChange] = useState('');
  const [showChangePinModal, setShowChangePinModal] = useState(false);
  
  // Reset PIN states
  const [showResetPinModal, setShowResetPinModal] = useState(false);
  
  // Timeout input
  const [timeoutInput, setTimeoutInput] = useState(timeoutMinutes.toString());

  useEffect(() => {
    checkPin();
  }, []);

  useEffect(() => {
    setTimeoutInput(timeoutMinutes.toString());
  }, [timeoutMinutes]);

  const checkPin = async () => {
    setCheckingPin(true);
    try {
      const exists = await checkPinExists();
      setPinExists(exists);
    } catch (error) {
      console.error('Failed to check PIN:', error);
    } finally {
      setCheckingPin(false);
    }
  };

  const handleEnablePinLock = async (enabled) => {
    if (enabled && !pinExists) {
      alertService.error('Error', 'Please set a PIN first before enabling PIN lock.');
      return;
    }

    setLoading(true);
    try {
      const result = await setPinEnabled(enabled);
      if (result.success) {
        alertService.success('Success', enabled ? 'PIN lock enabled' : 'PIN lock disabled');
      } else {
        alertService.error('Error', result.error || 'Failed to update PIN lock state');
      }
    } catch (error) {
      alertService.error('Error', 'Failed to update PIN lock state');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPin = async () => {
    if (!newPin.trim() || newPin.length < 4) {
      alertService.error('Error', 'PIN must be at least 4 digits');
      return;
    }

    if (newPin !== confirmPin) {
      alertService.error('Error', 'PINs do not match');
      return;
    }

    setLoading(true);
    try {
      const result = await setPin(newPin);
      if (result.success) {
        alertService.success('Success', 'PIN set successfully');
        setNewPin('');
        setConfirmPin('');
        setShowSetPinModal(false);
        setPinExists(true);
        // Auto-enable PIN lock after setting PIN
        await setPinEnabled(true);
      } else {
        alertService.error('Error', result.error || 'Failed to set PIN');
      }
    } catch (error) {
      alertService.error('Error', 'Failed to set PIN');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePin = async () => {
    if (!currentPin.trim()) {
      alertService.error('Error', 'Please enter current PIN');
      return;
    }

    if (!newPinForChange.trim() || newPinForChange.length < 4) {
      alertService.error('Error', 'New PIN must be at least 4 digits');
      return;
    }

    if (newPinForChange !== confirmPinForChange) {
      alertService.error('Error', 'PINs do not match');
      return;
    }

    setLoading(true);
    try {
      const result = await changePin(currentPin, newPinForChange);
      if (result.success) {
        alertService.success('Success', 'PIN changed successfully');
        setCurrentPin('');
        setNewPinForChange('');
        setConfirmPinForChange('');
        setShowChangePinModal(false);
      } else {
        alertService.error('Error', result.error || 'Failed to change PIN');
      }
    } catch (error) {
      alertService.error('Error', 'Failed to change PIN');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPin = async () => {
    setLoading(true);
    try {
      const result = await resetPin();
      if (result.success) {
        alertService.success('Success', 'PIN reset successfully');
        setShowResetPinModal(false);
        setPinExists(false);
      } else {
        alertService.error('Error', result.error || 'Failed to reset PIN');
      }
    } catch (error) {
      alertService.error('Error', 'Failed to reset PIN');
    } finally {
      setLoading(false);
    }
  };

  const handleSetTimeout = async () => {
    const minutes = parseInt(timeoutInput, 10);
    if (isNaN(minutes) || minutes < appConfig.pinLock.minTimeoutMinutes || minutes > appConfig.pinLock.maxTimeoutMinutes) {
      alertService.error(
        'Error',
        `Timeout must be between ${appConfig.pinLock.minTimeoutMinutes} and ${appConfig.pinLock.maxTimeoutMinutes} minutes`
      );
      return;
    }

    setLoading(true);
    try {
      const result = await setTimeoutMinutesValue(minutes);
      if (result.success) {
        alertService.success('Success', `Auto-lock timeout set to ${minutes} minute(s)`);
      } else {
        alertService.error('Error', result.error || 'Failed to update timeout');
        setTimeoutInput(timeoutMinutes.toString()); // Reset to current value
      }
    } catch (error) {
      alertService.error('Error', 'Failed to update timeout');
      setTimeoutInput(timeoutMinutes.toString()); // Reset to current value
    } finally {
      setLoading(false);
    }
  };

  const SettingCard = ({ title, subtitle, children, icon, iconColor }) => (
    <View style={[
      styles.settingCard,
      {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
      }
    ]}>
      <View style={[styles.settingHeader, { marginBottom: spacing.md }]}>
        {icon && (
          <View style={[
            styles.iconWrapper,
            {
              backgroundColor: hexToRgba(iconColor || theme.colors.primary, 0.1),
              borderRadius: borderRadius.round,
              padding: spacing.sm,
              marginRight: spacing.md,
            }
          ]}>
            <Icon
              name={icon}
              library="ionicons"
              size={24}
              color={iconColor || theme.colors.primary}
            />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={[
            styles.settingTitle,
            {
              color: theme.colors.text,
              ...typography.h4,
              marginBottom: spacing.xs / 2,
            }
          ]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[
              styles.settingSubtitle,
              {
                color: theme.colors.textSecondary,
                ...typography.caption,
              }
            ]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {children}
    </View>
  );

  const hexToRgba = (hex, opacity) => {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  if (checkingPin || pinLockLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Icon name="lock-closed" library="ionicons" size={48} color={theme.colors.primary} />
        <Text style={[{ color: theme.colors.text, ...typography.body, marginTop: spacing.md }]}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[
        styles.header,
        {
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.border,
          paddingTop: insets.top + spacing.lg,
          paddingHorizontal: spacing.xl,
          paddingBottom: spacing.lg,
          borderBottomWidth: 1,
        }
      ]}>
        <View style={styles.headerContent}>
          <AnimatedButton
            onPress={() => navigation.goBack()}
            style={[
              styles.backButton,
              {
                backgroundColor: theme.colors.errorLight,
                borderRadius: borderRadius.round,
                width: 40,
                height: 40,
                minWidth: 40,
                minHeight: 40,
                justifyContent: 'center',
                alignItems: 'center',
              }
            ]}
          >
            <Icon 
              name="arrow-back" 
              library="ionicons" 
              size={22} 
              color={theme.colors.error}
              responsive={true}
              hitArea={false}
              style={{ margin: 0 }}
            />
          </AnimatedButton>
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={[
              styles.title,
              {
                color: theme.colors.text,
                ...typography.h2,
                fontWeight: 'bold',
              }
            ]}>
              PIN Lock Settings
            </Text>
            <Text style={[
              styles.subtitle,
              {
                color: theme.colors.textSecondary,
                ...typography.caption,
              }
            ]}>
              Configure app security lock
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            padding: spacing.lg,
            paddingBottom: spacing.xxl,
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Enable/Disable PIN Lock */}
        <SettingCard
          title="Enable PIN Lock"
          subtitle="Automatically lock the app after inactivity"
          icon="lock-closed"
          iconColor={theme.colors.primary}
        >
          <View style={[styles.switchRow, { justifyContent: 'space-between', alignItems: 'center' }]}>
            <View style={{ flex: 1 }}>
              <Text style={[
                styles.switchLabel,
                {
                  color: theme.colors.text,
                  ...typography.body,
                }
              ]}>
                PIN Lock {pinEnabled ? 'Enabled' : 'Disabled'}
              </Text>
              <Text style={[
                styles.switchDescription,
                {
                  color: theme.colors.textSecondary,
                  ...typography.caption,
                  marginTop: spacing.xs,
                }
              ]}>
                {pinEnabled
                  ? 'App will lock automatically after inactivity'
                  : 'PIN lock is currently disabled'}
              </Text>
            </View>
            <Switch
              value={pinEnabled}
              onValueChange={handleEnablePinLock}
              disabled={loading || !pinExists}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary + '80',
              }}
              thumbColor={pinEnabled ? theme.colors.primary : theme.colors.textSecondary}
            />
          </View>
        </SettingCard>

        {/* Auto-lock Timeout */}
        <SettingCard
          title="Auto-lock Timeout"
          subtitle={`Lock app after ${timeoutMinutes} minute(s) of inactivity`}
          icon="time-outline"
          iconColor={theme.colors.info}
        >
          <View style={{ marginBottom: spacing.md }}>
            <Text style={[
              styles.inputLabel,
              {
                color: theme.colors.text,
                ...typography.body,
                marginBottom: spacing.sm,
              }
            ]}>
              Timeout (minutes)
            </Text>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <TextInput
                value={timeoutInput}
                onChangeText={setTimeoutInput}
                keyboardType="numeric"
                placeholder="5"
                style={[
                  styles.timeoutInput,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    borderColor: theme.colors.border,
                    borderRadius: borderRadius.md,
                    borderWidth: 1,
                    padding: spacing.md,
                    color: theme.colors.text,
                    ...typography.body,
                    flex: 1,
                  }
                ]}
              />
              <AnimatedButton
                onPress={handleSetTimeout}
                disabled={loading}
                style={[
                  styles.saveButton,
                  {
                    backgroundColor: theme.colors.primary,
                    borderRadius: borderRadius.md,
                    paddingHorizontal: spacing.lg,
                    paddingVertical: spacing.md,
                  }
                ]}
              >
                <Text style={[
                  {
                    color: theme.colors.onPrimary || '#FFFFFF',
                    ...typography.bodyBold,
                  }
                ]}>
                  Save
                </Text>
              </AnimatedButton>
            </View>
            <Text style={[
              styles.inputHint,
              {
                color: theme.colors.textTertiary,
                ...typography.caption,
                marginTop: spacing.xs,
              }
            ]}>
              Range: {appConfig.pinLock.minTimeoutMinutes} - {appConfig.pinLock.maxTimeoutMinutes} minutes
            </Text>
          </View>
        </SettingCard>

        {/* Set PIN */}
        {!pinExists ? (
          <SettingCard
            title="Set PIN"
            subtitle="Create a 4-digit PIN to secure the app"
            icon="key-outline"
            iconColor={theme.colors.success}
          >
            <AnimatedButton
              onPress={() => setShowSetPinModal(true)}
              style={[
                styles.actionButton,
                {
                  backgroundColor: theme.colors.success,
                  borderRadius: borderRadius.lg,
                  paddingVertical: spacing.md,
                }
              ]}
            >
              <Icon name="add-circle" library="ionicons" size={20} color="#FFFFFF" style={{ marginRight: spacing.sm }} />
              <Text style={[
                {
                  color: '#FFFFFF',
                  ...typography.bodyBold,
                }
              ]}>
                Set PIN
              </Text>
            </AnimatedButton>
          </SettingCard>
        ) : (
          <>
            {/* Change PIN */}
            <SettingCard
              title="Change PIN"
              subtitle="Update your PIN code"
              icon="create-outline"
              iconColor={theme.colors.warning}
            >
              <AnimatedButton
                onPress={() => setShowChangePinModal(true)}
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: theme.colors.warning,
                    borderRadius: borderRadius.lg,
                    paddingVertical: spacing.md,
                  }
                ]}
              >
                <Icon name="create-outline" library="ionicons" size={20} color="#FFFFFF" style={{ marginRight: spacing.sm }} />
                <Text style={[
                  {
                    color: '#FFFFFF',
                    ...typography.bodyBold,
                  }
                ]}>
                  Change PIN
                </Text>
              </AnimatedButton>
            </SettingCard>

            {/* Reset PIN */}
            <SettingCard
              title="Reset PIN"
              subtitle="Remove PIN lock (requires unlocking if currently locked)"
              icon="trash-outline"
              iconColor={theme.colors.error}
            >
              <AnimatedButton
                onPress={() => setShowResetPinModal(true)}
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: theme.colors.error,
                    borderRadius: borderRadius.lg,
                    paddingVertical: spacing.md,
                  }
                ]}
              >
                <Icon name="trash-outline" library="ionicons" size={20} color="#FFFFFF" style={{ marginRight: spacing.sm }} />
                <Text style={[
                  {
                    color: '#FFFFFF',
                    ...typography.bodyBold,
                  }
                ]}>
                  Reset PIN
                </Text>
              </AnimatedButton>
            </SettingCard>
          </>
        )}
      </ScrollView>

      {/* Set PIN Modal */}
      <Modal
        visible={showSetPinModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSetPinModal(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[
            styles.modalContent,
            {
              backgroundColor: theme.colors.surface,
              borderRadius: borderRadius.xl,
              padding: spacing.xl,
            }
          ]}>
            <Text style={[
              styles.modalTitle,
              {
                color: theme.colors.text,
                ...typography.h3,
                marginBottom: spacing.lg,
              }
            ]}>
              Set PIN
            </Text>

            <Text style={[
              styles.modalLabel,
              {
                color: theme.colors.text,
                ...typography.body,
                marginBottom: spacing.sm,
              }
            ]}>
              Enter 4-digit PIN
            </Text>
            <TextInput
              value={newPin}
              onChangeText={(text) => setNewPin(text.replace(/[^0-9]/g, '').slice(0, 4))}
              keyboardType="numeric"
              secureTextEntry
              maxLength={4}
              autoFocus
              style={[
                styles.modalInput,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  borderColor: theme.colors.border,
                  borderRadius: borderRadius.md,
                  borderWidth: 1,
                  padding: spacing.md,
                  color: theme.colors.text,
                  ...typography.h3,
                  textAlign: 'center',
                  letterSpacing: 8,
                }
              ]}
            />

            <Text style={[
              styles.modalLabel,
              {
                color: theme.colors.text,
                ...typography.body,
                marginTop: spacing.md,
                marginBottom: spacing.sm,
              }
            ]}>
              Confirm PIN
            </Text>
            <TextInput
              value={confirmPin}
              onChangeText={(text) => setConfirmPin(text.replace(/[^0-9]/g, '').slice(0, 4))}
              keyboardType="numeric"
              secureTextEntry
              maxLength={4}
              style={[
                styles.modalInput,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  borderColor: theme.colors.border,
                  borderRadius: borderRadius.md,
                  borderWidth: 1,
                  padding: spacing.md,
                  color: theme.colors.text,
                  ...typography.h3,
                  textAlign: 'center',
                  letterSpacing: 8,
                }
              ]}
            />

            <View style={[styles.modalActions, { marginTop: spacing.xl, gap: spacing.md }]}>
              <AnimatedButton
                onPress={() => {
                  setShowSetPinModal(false);
                  setNewPin('');
                  setConfirmPin('');
                }}
                style={[
                  styles.modalButton,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    borderRadius: borderRadius.lg,
                    paddingVertical: spacing.md,
                    flex: 1,
                  }
                ]}
              >
                <Text style={[
                  {
                    color: theme.colors.text,
                    ...typography.bodyBold,
                  }
                ]}>
                  Cancel
                </Text>
              </AnimatedButton>
              <AnimatedButton
                onPress={handleSetPin}
                disabled={loading || newPin.length < 4 || confirmPin.length < 4}
                style={[
                  styles.modalButton,
                  {
                    backgroundColor: theme.colors.primary,
                    borderRadius: borderRadius.lg,
                    paddingVertical: spacing.md,
                    flex: 1,
                    opacity: (loading || newPin.length < 4 || confirmPin.length < 4) ? 0.5 : 1,
                  }
                ]}
              >
                <Text style={[
                  {
                    color: theme.colors.onPrimary || '#FFFFFF',
                    ...typography.bodyBold,
                  }
                ]}>
                  {loading ? 'Setting...' : 'Set PIN'}
                </Text>
              </AnimatedButton>
            </View>
          </View>
        </View>
      </Modal>

      {/* Change PIN Modal */}
      <Modal
        visible={showChangePinModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowChangePinModal(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[
            styles.modalContent,
            {
              backgroundColor: theme.colors.surface,
              borderRadius: borderRadius.xl,
              padding: spacing.xl,
            }
          ]}>
            <Text style={[
              styles.modalTitle,
              {
                color: theme.colors.text,
                ...typography.h3,
                marginBottom: spacing.lg,
              }
            ]}>
              Change PIN
            </Text>

            <Text style={[
              styles.modalLabel,
              {
                color: theme.colors.text,
                ...typography.body,
                marginBottom: spacing.sm,
              }
            ]}>
              Current PIN
            </Text>
            <TextInput
              value={currentPin}
              onChangeText={(text) => setCurrentPin(text.replace(/[^0-9]/g, '').slice(0, 4))}
              keyboardType="numeric"
              secureTextEntry
              maxLength={4}
              autoFocus
              style={[
                styles.modalInput,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  borderColor: theme.colors.border,
                  borderRadius: borderRadius.md,
                  borderWidth: 1,
                  padding: spacing.md,
                  color: theme.colors.text,
                  ...typography.h3,
                  textAlign: 'center',
                  letterSpacing: 8,
                }
              ]}
            />

            <Text style={[
              styles.modalLabel,
              {
                color: theme.colors.text,
                ...typography.body,
                marginTop: spacing.md,
                marginBottom: spacing.sm,
              }
            ]}>
              New PIN
            </Text>
            <TextInput
              value={newPinForChange}
              onChangeText={(text) => setNewPinForChange(text.replace(/[^0-9]/g, '').slice(0, 4))}
              keyboardType="numeric"
              secureTextEntry
              maxLength={4}
              style={[
                styles.modalInput,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  borderColor: theme.colors.border,
                  borderRadius: borderRadius.md,
                  borderWidth: 1,
                  padding: spacing.md,
                  color: theme.colors.text,
                  ...typography.h3,
                  textAlign: 'center',
                  letterSpacing: 8,
                }
              ]}
            />

            <Text style={[
              styles.modalLabel,
              {
                color: theme.colors.text,
                ...typography.body,
                marginTop: spacing.md,
                marginBottom: spacing.sm,
              }
            ]}>
              Confirm New PIN
            </Text>
            <TextInput
              value={confirmPinForChange}
              onChangeText={(text) => setConfirmPinForChange(text.replace(/[^0-9]/g, '').slice(0, 4))}
              keyboardType="numeric"
              secureTextEntry
              maxLength={4}
              style={[
                styles.modalInput,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  borderColor: theme.colors.border,
                  borderRadius: borderRadius.md,
                  borderWidth: 1,
                  padding: spacing.md,
                  color: theme.colors.text,
                  ...typography.h3,
                  textAlign: 'center',
                  letterSpacing: 8,
                }
              ]}
            />

            <View style={[styles.modalActions, { marginTop: spacing.xl, gap: spacing.md }]}>
              <AnimatedButton
                onPress={() => {
                  setShowChangePinModal(false);
                  setCurrentPin('');
                  setNewPinForChange('');
                  setConfirmPinForChange('');
                }}
                style={[
                  styles.modalButton,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    borderRadius: borderRadius.lg,
                    paddingVertical: spacing.md,
                    flex: 1,
                  }
                ]}
              >
                <Text style={[
                  {
                    color: theme.colors.text,
                    ...typography.bodyBold,
                  }
                ]}>
                  Cancel
                </Text>
              </AnimatedButton>
              <AnimatedButton
                onPress={handleChangePin}
                disabled={loading || currentPin.length < 4 || newPinForChange.length < 4 || confirmPinForChange.length < 4}
                style={[
                  styles.modalButton,
                  {
                    backgroundColor: theme.colors.warning,
                    borderRadius: borderRadius.lg,
                    paddingVertical: spacing.md,
                    flex: 1,
                    opacity: (loading || currentPin.length < 4 || newPinForChange.length < 4 || confirmPinForChange.length < 4) ? 0.5 : 1,
                  }
                ]}
              >
                <Text style={[
                  {
                    color: '#FFFFFF',
                    ...typography.bodyBold,
                  }
                ]}>
                  {loading ? 'Changing...' : 'Change PIN'}
                </Text>
              </AnimatedButton>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reset PIN Confirmation Modal */}
      <ConfirmationModal
        visible={showResetPinModal}
        onClose={() => setShowResetPinModal(false)}
        onConfirm={handleResetPin}
        title="Reset PIN"
        message="Are you sure you want to reset the PIN? This will disable PIN lock."
        confirmText="Reset"
        cancelText="Cancel"
        type="warning"
        icon="trash-outline"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
  },
  subtitle: {
    marginTop: 2,
  },
  content: {
    flexGrow: 1,
  },
  settingCard: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingTitle: {
    fontWeight: '600',
  },
  settingSubtitle: {
    marginTop: 2,
  },
  switchRow: {
    flexDirection: 'row',
  },
  switchLabel: {
    fontWeight: '500',
  },
  switchDescription: {
    marginTop: 4,
  },
  inputLabel: {
    fontWeight: '500',
  },
  timeoutInput: {
    fontWeight: '500',
  },
  saveButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputHint: {
    fontStyle: 'italic',
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalLabel: {
    fontWeight: '500',
  },
  modalInput: {
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
  },
  modalButton: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default PinLockSettingsScreen;

