import { createSelector } from "@reduxjs/toolkit"

export const fullChatSelector = (state)=>state?.chat
export const selectedIdSelector = createSelector(fullChatSelector,(state)=>state.id)