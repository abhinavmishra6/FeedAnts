import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
export const colors = { ink: '#10224d', teal: '#008a96', pale: '#eaf9f7', muted: '#66749b', line: '#e4e8f1', gold: '#e6a600' };
export function Card({ children, style }) { return <View style={[styles.card, style]}>{children}</View>; }
export function Pill({ children }) { return <View style={styles.pill}><Text style={styles.pillText}>{children}</Text></View>; }
export function IconText({ icon, children, color = colors.teal }) { return <View style={styles.iconText}><Ionicons name={icon} size={19} color={color} /><Text style={[styles.iconTextLabel, { color }]}>{children}</Text></View>; }
export function PrimaryButton({ children, onPress, disabled, loading }) { return <Pressable onPress={onPress} disabled={disabled || loading} style={({ pressed }) => [styles.button, (disabled || loading) && styles.disabled, pressed && styles.pressed]}>{loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>{children}</Text>}</Pressable>; }
const styles = StyleSheet.create({ card: { backgroundColor: 'white', borderRadius: 17, padding: 18, marginBottom: 12, shadowColor: '#10224d', shadowOpacity: .06, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 2 }, pill: { backgroundColor: '#f2f4fa', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start' }, pillText: { color: colors.ink, fontWeight: '600', fontSize: 12 }, iconText: { flexDirection: 'row', alignItems: 'center', gap: 7 }, iconTextLabel: { fontSize: 14, fontWeight: '700' }, button: { backgroundColor: colors.teal, borderRadius: 10, minHeight: 53, justifyContent: 'center', alignItems: 'center', shadowColor: colors.teal, shadowOpacity: .2, shadowRadius: 8, elevation: 2 }, buttonText: { color: 'white', fontWeight: '800', fontSize: 16 }, disabled: { opacity: .58 }, pressed: { opacity: .85 } });

