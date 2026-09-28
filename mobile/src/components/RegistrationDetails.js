import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import { Card, colors, PrimaryButton } from './ui';
import { competitionRegistrations, myRegistration } from '../api/extended';

export function MyRegistration({ competitionId }) {
  const [entry, setEntry] = useState(null);
  useEffect(() => { let alive = true; myRegistration(competitionId).then((row) => alive && setEntry(row)).catch(() => alive && setEntry(false)); return () => { alive = false; }; }, [competitionId]);
  if (entry === null) return <Card><ActivityIndicator color={colors.teal} /></Card>;
  if (!entry) return null;
  return <Card><Text style={s.title}>My Registration</Text><Text style={s.line}>ID: {entry._id}</Text><Text style={s.line}>Status: {entry.status}{entry.submission ? ` · Submission ${entry.submission.status}` : ' · No submission yet'}</Text><Text style={s.line}>{entry.fullName} · {entry.email}</Text><Text style={s.line}>{entry.phone} · {entry.institution}</Text><Text style={s.line}>{entry.course}, {entry.yearSemester} · {entry.city}</Text>{entry.teamName ? <Text style={s.line}>Team: {entry.teamName}</Text> : null}<Text style={s.line}>Registered: {new Date(entry.createdAt).toLocaleString()}</Text>{entry.referralCode ? <Text style={s.line}>Referral: {entry.referralCode}</Text> : null}<Text style={s.sub}>Team members</Text>{entry.teamMembers.map((person) => <Text key={person._id} style={s.line}>{person.role === 'primary' ? 'Primary' : 'Member'}: {person.name} · {person.email}</Text>)}</Card>;
}

export function OrganizerRegistrations({ competitionId, visible }) {
  const [rows, setRows] = useState([]), [q, setQ] = useState(''), [page, setPage] = useState(1), [data, setData] = useState(null), [error, setError] = useState('');
  const load = () => competitionRegistrations(competitionId, { page, limit: 20, q: q || undefined }).then((value) => { setData(value); setRows(value.rows); setError(''); }).catch((e) => setError(e.response?.data?.error || 'Could not load registrations.'));
  useEffect(() => { if (visible) load(); }, [visible, competitionId, page]);
  if (!visible) return null;
  return <Card><Text style={s.title}>All registrations</Text><TextInput style={s.input} value={q} onChangeText={setQ} placeholder="Search name, email, or team" onSubmitEditing={() => { setPage(1); load(); }} /><PrimaryButton onPress={() => { setPage(1); load(); }}>Search</PrimaryButton>{error ? <Text style={s.error}>{error}</Text> : null}{rows.map((row) => <View key={row._id} style={s.row}><Text style={s.line}>{row.fullName} · {row.status}</Text><Text style={s.line}>ID: {row._id}</Text><Text style={s.line}>{row.email} · {row.phone}</Text><Text style={s.line}>{row.institution} · {row.course}, {row.yearSemester}</Text><Text style={s.line}>Team: {row.teamName || 'Individual'}</Text>{row.teamMembers.map((person) => <Text key={person._id} style={s.member}>{person.name} · {person.email}</Text>)}</View>)}{data ? <View style={s.pager}><Text>Page {data.page} of {data.pages || 1} · {data.total} total</Text><PrimaryButton disabled={page <= 1} onPress={() => setPage(page - 1)}>Previous</PrimaryButton><PrimaryButton disabled={page >= data.pages} onPress={() => setPage(page + 1)}>Next</PrimaryButton></View> : null}</Card>;
}
const s = StyleSheet.create({ title:{color:colors.ink,fontWeight:'800',fontSize:16,marginBottom:8}, sub:{color:colors.ink,fontWeight:'800',marginTop:8}, line:{color:colors.muted,fontSize:12,lineHeight:19}, member:{color:colors.muted,fontSize:12,marginLeft:8}, row:{borderTopWidth:1,borderColor:colors.line,paddingTop:9,marginTop:9}, input:{borderWidth:1,borderColor:colors.line,borderRadius:8,padding:10,marginBottom:8}, error:{color:'#ba2636',marginTop:8}, pager:{gap:8,marginTop:12} });
