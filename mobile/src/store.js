import { configureStore } from '@reduxjs/toolkit';
import competition from './features/competitionSlice';
export const store = configureStore({ reducer: { competition } });

