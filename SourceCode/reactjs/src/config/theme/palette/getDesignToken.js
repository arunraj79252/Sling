export const getDesignToken = (mode) => ({
  palette: {
    mode,
    primary: {
      ...(mode === "light"
        ? {
            main: "rgb(103, 58, 183)",
            secondary:
              "linear-gradient(169deg, rgba(103,58,183,1) 42%, rgba(202,33,243,1) 123%)",
            login:
              "linear-gradient(126deg, rgba(103,58,183,1) 65%, rgba(202,33,243,1) 92%)",
          }
        : {
            main: "rgb(114 46 231)",
            secondary:
              "linear-gradient(169deg, rgb(54 8 136) 42%, rgb(37 7 45) 123%)",
            login:
              "linear-gradient(169deg, rgb(54 8 136) 42%, rgb(37 7 45) 123%)",
          }),
    },
    secondary: {
      main: "rgb(33, 150, 243)",
    },
    error: {
      main: "#cc0000",
    },
    ...(mode === "light"
      ? {
          background: {
            default: "rgb(238, 242, 246)",
            paper: "#f4f4f9",
            border: "#d9e1e9",
            select: "rgba(0, 0, 0, 0.04)"
          },
        }
      : {
          background: {
            default: "rgb(26, 34, 63)",
            paper: "rgb(17, 25, 54)",
            border: "#484f56",
            select: "rgba(255, 255, 255, 0.08)"
          },
        }),
    text: {
      ...(mode === "light"
        ? {
            primary: "rgb(18, 25, 38)",
            secondary: "#808080",
            light: "#fff",
            disabled: GREY[500],
          }
        : {
            primary: "#fff",
            secondary: GREY[500],
            disabled: GREY[500],
            light: "#fff",
          }),
    },
  },
});
const GREY = {
  0: "#FFFFFF",
  100: "#F9FAFB",
  200: "#F4F6F8",
  300: "#DFE3E8",
  400: "#C4CDD5",
  500: "#919EAB",
  600: "#637381",
  700: "#454F5B",
  800: "#212B36",
  900: "#161C24",
};

// SETUP COLORS
// const GREY = {
//   0: '#FFFFFF',
//   100: '#F9FAFB',
//   200: '#F4F6F8',
//   300: '#DFE3E8',
//   400: '#C4CDD5',
//   500: '#919EAB',
//   600: '#637381',
//   700: '#454F5B',
//   800: '#212B36',
//   900: '#161C24',
// };

// const Palette = {

//   mode: 'light',
//   primary: {
//     main: '#FFFFFF',
//     lighter: '#6FB2EE',
//     lightest: '#8BC1F1',
//   },
//   secondary: {
//     main: '#0cb9c5',
//   },
//   error: {
//     main: '#fc4b6c',
//   },
//   info: {
//     main: '#03c9d7',
//   },
//   success: {
//     main: '#05b187',
//   },
//   warning: {
//     main: '#fec90f',
//   },

//   divider: alpha(GREY[500], 0.24),
//   text: {
//     primary: GREY[800],
//     secondary: GREY[600],
//     disabled: GREY[500],
//   },
//   background: {
//     paper: '#fff',
//     default: GREY[100],
//     neutral: GREY[200],
//   },

//   night: {
//     main: '#181823',
//     light: '#46464F',
//     dark: '#101018',
//   },
//   bright: {
//     main: '#E9F8F9',
//     light: '#EDF9FA',
//     dark: '#A3ADAE',
//   },
//   purple: {
//     main: '#563DEA',
//     light: '#7763EE',
//     dark: '#3C2AA3',
//   },
//   orange: {
//     main: '#FF9800',
//     light: '#FFAC33',
//     dark: '#B26A00',
//   },
// };
// export default Palette;
