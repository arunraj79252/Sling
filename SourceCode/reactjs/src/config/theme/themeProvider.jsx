import {  GlobalStyles, responsiveFontSizes } from "@mui/material";
import {
  createTheme,
  ThemeProvider as MUIThemeProvider,
  StyledEngineProvider,
} from "@mui/material/styles";

import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { themeSelector } from "../../store/selectors/ThemeSelectors";
import { getDesignToken } from "./palette/getDesignToken";
import typography from "./typography";

const ThemeProvider = ({ children }) => {
  const themeColor = useSelector(themeSelector)
  const palette = getDesignToken(themeColor).palette

  const themeOptions = useMemo(() => ({   
    palette, 
    typography
  }), [palette]);
  let theme = createTheme(themeOptions);

  theme = responsiveFontSizes(theme);
  return (
    <StyledEngineProvider injectFirst>
      <MUIThemeProvider theme={theme}>
        <GlobalStyles />
        {children}
      </MUIThemeProvider>
    </StyledEngineProvider>
  );
};

export default ThemeProvider;
