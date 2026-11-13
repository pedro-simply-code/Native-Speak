"use client";

import { createTheme } from "@mui/material/styles";

/** AdminMart Modernize Next.js palette & component defaults */
export const modernizeMuiTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#5D87FF",
      light: "#ECF2FF",
      dark: "#4570EA",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#49BEFF",
    },
    success: {
      main: "#13DEB9",
      light: "#E6FFFA",
    },
    warning: {
      main: "#FFAE1F",
      light: "#FEF5E5",
    },
    error: {
      main: "#FA896B",
    },
    background: {
      default: "#F6F9FC",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#2A3547",
      secondary: "#5A6A85",
    },
    divider: "#E5EAEF",
  },
  shape: {
    borderRadius: 7,
  },
  typography: {
    fontFamily:
      'var(--font-dashboard-sans), "Plus Jakarta Sans", system-ui, sans-serif',
    fontSize: 14,
    h1: {
      fontFamily: 'var(--font-display), "Fraunces", Georgia, serif',
      fontSize: "1.75rem",
      fontWeight: 600,
      letterSpacing: "-0.03em",
      lineHeight: 1.15,
    },
    h2: {
      fontFamily: 'var(--font-display), "Fraunces", Georgia, serif',
      fontSize: "1.25rem",
      fontWeight: 600,
      letterSpacing: "-0.02em",
    },
    h4: {
      fontFamily: 'var(--font-display), "Fraunces", Georgia, serif',
      fontSize: "1.125rem",
      fontWeight: 600,
      letterSpacing: "-0.02em",
    },
    subtitle2: {
      fontSize: "0.7rem",
      fontWeight: 700,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
    },
    body2: { fontSize: "0.875rem" },
    caption: { fontSize: "0.75rem" },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 7,
          boxShadow: "none",
          "&.MuiButton-containedPrimary:hover": {
            backgroundColor: "#4570EA",
            boxShadow: "none",
          },
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0px 2px 6px rgba(42, 53, 71, 0.08)",
          border: "1px solid",
          borderColor: "#E5EAEF",
          transition: "box-shadow 0.2s ease, transform 0.2s ease",
          "@media (prefers-reduced-motion: no-preference)": {
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 10px 28px rgba(42, 53, 71, 0.1)",
            },
          },
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(255, 255, 255, 0.92)",
          backdropFilter: "blur(8px)",
          color: "#2A3547",
          boxShadow: "none",
          borderBottom: "1px solid #E5EAEF",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          width: 270,
          borderRight: "none",
          boxShadow: "1px 0 20px rgba(0, 0, 0, 0.04)",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          marginTop: 2,
          marginBottom: 2,
          paddingTop: 9,
          paddingBottom: 9,
          paddingLeft: 12,
          paddingRight: 12,
          color: "#2A3547",
          "&:hover": {
            backgroundColor: "#ECF2FF",
            color: "#5D87FF",
          },
          "&.Mui-selected": {
            backgroundColor: "#ECF2FF",
            color: "#5D87FF",
            fontWeight: 600,
            "&:hover": {
              backgroundColor: "#ECF2FF",
            },
            "& .MuiListItemIcon-root": {
              color: "#5D87FF",
            },
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 36,
          color: "#5A6A85",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          fontSize: "0.8125rem",
          color: "#5A6A85",
          backgroundColor: "#FBFBFC",
          borderBottomColor: "#E5EAEF",
        },
        body: {
          fontSize: "0.875rem",
          borderBottomColor: "#E5EAEF",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 7,
        },
      },
    },
  },
});
