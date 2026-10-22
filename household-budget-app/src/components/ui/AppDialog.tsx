import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { appDialogStyles } from './appDialogStyles';

export interface AppDialogAction {
    label: string;
    onPress: () => void;
    destructive?: boolean;
    primary?: boolean;
}

interface AppDialogProps {
    visible: boolean;
    title: string;
    message: string;
    icon?: keyof typeof Ionicons.glyphMap;
    tone?: 'info' | 'success' | 'warning' | 'danger';
    actions: AppDialogAction[];
    onRequestClose?: () => void;
}

export function AppDialog({
    visible,
    title,
    message,
    icon = 'information-circle-outline',
    tone = 'info',
    actions,
    onRequestClose,
}: AppDialogProps) {
    const { isDarkMode } = useAppTheme();
    const iconColor = tone === 'success' ? '#16A34A' : tone === 'warning' ? '#D97706' : tone === 'danger' ? '#DC2626' : '#2563EB';

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose}>
            <View style={appDialogStyles.overlay}>
                <View style={[appDialogStyles.card, isDarkMode && appDialogStyles.cardDark]}>
                    <View style={[appDialogStyles.iconBox, { backgroundColor: isDarkMode ? '#334155' : '#EFF6FF' }]}>
                        <Ionicons name={icon} size={28} color={iconColor} />
                    </View>
                    <Text style={[appDialogStyles.title, isDarkMode && appDialogStyles.titleDark]}>{title}</Text>
                    <Text style={[appDialogStyles.message, isDarkMode && appDialogStyles.messageDark]}>{message}</Text>
                    <View style={appDialogStyles.actionRow}>
                        {actions.map((action) => (
                            <TouchableOpacity
                                key={action.label}
                                style={[
                                    appDialogStyles.action,
                                    action.primary && appDialogStyles.primaryAction,
                                    action.destructive && appDialogStyles.destructiveAction,
                                    isDarkMode && !action.primary && appDialogStyles.actionDark,
                                ]}
                                onPress={action.onPress}
                            >
                                <Text
                                    style={[
                                        appDialogStyles.actionText,
                                        action.primary && appDialogStyles.primaryActionText,
                                        action.destructive && appDialogStyles.destructiveActionText,
                                        isDarkMode && !action.primary && appDialogStyles.actionTextDark,
                                    ]}
                                >
                                    {action.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        </Modal>
    );
}
