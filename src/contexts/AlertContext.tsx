import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { useColors } from './ThemeContext';

// ─── Types ──────────────────────────────────────────────────────────────────

type AlertType = 'info' | 'success' | 'warning' | 'error';

interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

interface AlertConfig {
  title: string;
  message?: string;
  type?: AlertType;
  buttons?: AlertButton[];
}

interface AlertContextType {
  showAlert: (config: AlertConfig) => void;
}

const AlertContext = createContext<AlertContextType>({ showAlert: () => {} });

export const useAlert = () => useContext(AlertContext);

// ─── Icons & Colors per type ────────────────────────────────────────────────

const TYPE_CONFIG: Record<AlertType, { icon: string; bgColor: string; iconColor: string }> = {
  info: { icon: 'information-circle', bgColor: '#EBF5FF', iconColor: '#3B82F6' },
  success: { icon: 'checkmark-circle', bgColor: '#ECFDF5', iconColor: '#10B981' },
  warning: { icon: 'warning', bgColor: '#FFFBEB', iconColor: '#F59E0B' },
  error: { icon: 'close-circle', bgColor: '#FEF2F2', iconColor: '#EF4444' },
};

// ─── Provider ───────────────────────────────────────────────────────────────

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const C = useColors();
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<AlertConfig>({ title: '' });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const showAlert = useCallback((cfg: AlertConfig) => {
    setConfig(cfg);
    setVisible(true);
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.9);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const handleClose = useCallback((onPress?: () => void) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setVisible(false);
      onPress?.();
    });
  }, [fadeAnim]);

  const type = config.type || 'info';
  const typeConfig = TYPE_CONFIG[type];
  const buttons = config.buttons || [{ text: 'OK', style: 'default' }];

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <Modal visible={visible} transparent statusBarTranslucent animationType="none">
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
            {/* Icon */}
            <View style={[styles.iconWrap, { backgroundColor: typeConfig.bgColor }]}>
              <Ionicons name={typeConfig.icon as any} size={32} color={typeConfig.iconColor} />
            </View>

            {/* Title */}
            <Text style={styles.title}>{config.title}</Text>

            {/* Message */}
            {config.message ? (
              <Text style={styles.message}>{config.message}</Text>
            ) : null}

            {/* Buttons */}
            <View style={[styles.buttonRow, buttons.length === 1 && { justifyContent: 'center' }]}>
              {buttons.map((btn, i) => {
                const isDestructive = btn.style === 'destructive';
                const isCancel = btn.style === 'cancel';
                const isPrimary = !isDestructive && !isCancel;

                return (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.button,
                      buttons.length === 1 && { flex: 0, minWidth: 140 },
                      isCancel && styles.buttonCancel,
                      isDestructive && styles.buttonDestructive,
                      isPrimary && { backgroundColor: C.PRIMARY },
                    ]}
                    onPress={() => handleClose(btn.onPress)}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.buttonText,
                      isCancel && styles.buttonTextCancel,
                      isDestructive && { color: '#fff' },
                    ]}>
                      {btn.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </AlertContext.Provider>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
  },
  container: {
    backgroundColor: COLORS.CARD,
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.TEXT,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonCancel: {
    backgroundColor: COLORS.SURFACE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  buttonDestructive: {
    backgroundColor: '#EF4444',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  buttonTextCancel: {
    color: COLORS.TEXT_SECONDARY,
  },
});
