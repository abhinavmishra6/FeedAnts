import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from './ui';
const value = (target) => { const seconds = Math.max(0, Math.floor((new Date(target) - Date.now()) / 1000)); const d = Math.floor(seconds / 86400); const h = Math.floor(seconds % 86400 / 3600); const m = Math.floor(seconds % 3600 / 60); const s = seconds % 60; return `${d}d : ${String(h).padStart(2, '0')}h : ${String(m).padStart(2, '0')}m : ${String(s).padStart(2, '0')}s`; };
export function Countdown({ target }) { const [time, setTime] = useState(value(target)); useEffect(() => { const id = setInterval(() => setTime(value(target)), 1000); return () => clearInterval(id); }, [target]); return <View style={styles.box}><Ionicons name="hourglass-outline" size={25} color={colors.teal} /><Text style={styles.label}>Registration closes in</Text><Text style={styles.time}>{time}</Text></View>; }
const styles = StyleSheet.create({ box: { backgroundColor: colors.pale, borderRadius: 12, minHeight: 52, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }, label: { color: colors.ink, fontWeight: '700', fontSize: 13 }, time: { color: colors.teal, fontWeight: '800', fontSize: 14, marginLeft: 'auto' } });
