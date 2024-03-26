import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  isEstablishingConnection: false,
  isConnected: false,
  chatRecieved: false,
};
const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    startConnecting: (state) => {
      state.isEstablishingConnection = true;
    },
    connectionEstablished: (state) => {
      state.isConnected = true;
      state.isEstablishingConnection = true;
    },
    chatRecieved: (state) => {
      state.chatRecieved = true;
    }
  },
});

export const socketActions = socketSlice.actions;
export default socketSlice.reducer;
