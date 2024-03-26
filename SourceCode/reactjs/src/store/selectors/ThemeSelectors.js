import { createSelector } from "@reduxjs/toolkit";
export const fullThemeSelector = (state) => state?.theme
export const themeSelector = createSelector(fullThemeSelector,(state)=>state.theme)