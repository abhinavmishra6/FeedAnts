import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getCompetition, getFeaturedCompetition, registerCompetition } from '../api/competitions';
import { ensureSession } from '../api/session';
import { readableError } from '../api/client';

export const loadCompetition = createAsyncThunk('competition/load', async (requestedId) => { await ensureSession(); const id = requestedId || await getFeaturedCompetition(); return getCompetition(id); }, { serializeError: readableError });
export const register = createAsyncThunk('competition/register', async ({ id, form }, { rejectWithValue }) => {
  try {
    await registerCompetition(id, form);
    // Re-read server-authoritative availability after its successful reservation.
    return await getCompetition(id);
  } catch (error) {
    return rejectWithValue({ status: error.response?.status, error: readableError(error) });
  }
});
const slice = createSlice({ name: 'competition', initialState: { item: null, status: 'idle', actionStatus: 'idle', error: null }, reducers: {}, extraReducers: (builder) => builder
  .addCase(loadCompetition.pending, (state) => { state.status = 'loading'; state.error = null; })
  .addCase(loadCompetition.fulfilled, (state, action) => { state.status = 'ready'; state.item = action.payload; })
  .addCase(loadCompetition.rejected, (state, action) => { state.status = 'failed'; state.error = action.error.message; })
  .addCase(register.pending, (state) => { state.actionStatus = 'loading'; })
  .addCase(register.fulfilled, (state, action) => { state.actionStatus = 'succeeded'; state.item = action.payload; })
  .addCase(register.rejected, (state, action) => { state.actionStatus = 'failed'; state.error = action.payload?.error || action.error.message; }) });
export default slice.reducer;
