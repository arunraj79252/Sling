import { createSlice } from "@reduxjs/toolkit";
import { loadScript } from "../../App";

const initialState = {
  accessToken: null,
  refreshToken: null,
  email: "",
  socketId: "",
  userName: "",
  userId: "",
  profileImage: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, { payload }) => {
      state.accessToken = payload.accessToken;
      state.refreshToken = payload.refreshToken;
      state.email = payload.email;
      state.socketId = payload.socketId;
      state.userName = payload.userName;
      state.userId = payload.userId;
      state.profileImage = payload.profileImage;
      state.status=payload.status;
    },
    updateToken: (state, { payload }) => {
      state.accessToken = payload.accessToken;
    },
    logout: () => {
      const src = "https://accounts.google.com/gsi/client";

      loadScript(src).then(() => {
        /* global google*/
        google.accounts.id.disableAutoSelect();
      });
      return initialState;
    },
    updateprofileImage: (state, { payload }) => {
      state.profileImage = payload.profileImage;
    }, 
    blockedUser:(state,{ payload }) => {
      state.status = payload.status;
      
  },
  
}
});
export default authSlice.reducer;

export const { login, logout, updateprofileImage, updateToken ,blockedUser} =
  authSlice.actions;