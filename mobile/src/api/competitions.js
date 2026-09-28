import { api } from './client';
export async function getFeaturedCompetition() { const { data } = await api.get('/competitions/featured'); return data.id; }
export async function getCompetition(id) { const { data } = await api.get(`/competitions/${id}`); return data; }
export async function registerCompetition(id, form) { const { data } = await api.post(`/competitions/${id}/registrations`, form); return data; }
