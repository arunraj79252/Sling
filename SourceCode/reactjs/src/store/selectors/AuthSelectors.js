import { createSelector } from "@reduxjs/toolkit";
export const authSelector = (state) => state?.auth;
export const refreshTokenSelector = createSelector( authSelector,(state) => state.refreshToken);
export const accessTokenSelector = createSelector(authSelector,(state)=>state.accessToken)
export const profileImageSelector = createSelector(authSelector,(state)=>state.profileImage)
export const userNameSelector = createSelector(authSelector,state=>state?.userName)

