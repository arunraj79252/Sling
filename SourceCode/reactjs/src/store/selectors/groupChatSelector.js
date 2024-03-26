import { createSelector } from "@reduxjs/toolkit";

export const fullGroupChatSelector = (state)=>state?.groupChat
export const selectGroupChatIdSelector = createSelector(fullGroupChatSelector,(state)=>state.id)
export const groupListUpdateSelector = createSelector(fullGroupChatSelector,(state)=>state.listChange)