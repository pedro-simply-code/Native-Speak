"use client";

import { useState } from "react";
import IconButton from "@mui/material/IconButton";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { IconLanguage } from "@tabler/icons-react";
import {
  localeLabels,
  locales,
  type AppLocale,
} from "@/lib/i18n/config";
import { useAppI18n } from "@/components/i18n/app-i18n-provider";

export function DashboardLanguageMenu() {
  const { locale, setLocale, t } = useAppI18n();
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const open = Boolean(anchor);

  return (
    <>
      <IconButton
        aria-label={t("header.language")}
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{ color: "text.secondary" }}
      >
        <IconLanguage size={22} stroke={1.5} />
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={open}
        onClose={() => setAnchor(null)}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ px: 2, py: 1, display: "block" }}
        >
          {t("language.choose")}
        </Typography>
        {locales.map((code) => (
          <MenuItem
            key={code}
            selected={code === locale}
            onClick={() => {
              setLocale(code as AppLocale);
              setAnchor(null);
            }}
          >
            <ListItemText>
              {localeLabels[code].flag} {localeLabels[code].native}
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
