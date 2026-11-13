"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import Typography from "@mui/material/Typography";
import { IconBell } from "@tabler/icons-react";
import { useDashboardI18n } from "@/components/dashboard/i18n/dashboard-i18n-provider";
import {
  getNotificationFeed,
  markAllNotificationsReadAction,
  markNotificationReadAction,
  type NotificationItem,
} from "@/server/actions/notifications";

function formatWhen(date: Date) {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return d.toLocaleDateString();
}

export function DashboardNotifications() {
  const { t } = useDashboardI18n();
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [, startTransition] = useTransition();

  const refresh = useCallback(() => {
    startTransition(async () => {
      const feed = await getNotificationFeed();
      setUnread(feed.unread);
      setItems(feed.items);
    });
  }, [startTransition]);

  useEffect(() => {
    refresh();
    const id = window.setInterval(refresh, 60_000);
    return () => window.clearInterval(id);
  }, [refresh]);

  const open = Boolean(anchor);

  async function onOpen(e: React.MouseEvent<HTMLElement>) {
    setAnchor(e.currentTarget);
    refresh();
  }

  function onClose() {
    setAnchor(null);
  }

  async function onClickItem(n: NotificationItem) {
    if (!n.readAt) {
      await markNotificationReadAction(n.id);
      setUnread((c) => Math.max(0, c - 1));
      setItems((prev) =>
        prev.map((x) =>
          x.id === n.id ? { ...x, readAt: new Date() } : x,
        ),
      );
    }
    onClose();
  }

  async function onMarkAll() {
    await markAllNotificationsReadAction();
    setUnread(0);
    setItems((prev) => prev.map((x) => ({ ...x, readAt: x.readAt ?? new Date() })));
  }

  return (
    <>
      <IconButton
        aria-label={t("header.notifications")}
        onClick={onOpen}
        sx={{ color: "text.secondary" }}
      >
        <Badge
          badgeContent={unread > 9 ? "9+" : unread}
          color="error"
          invisible={unread === 0}
        >
          <IconBell size={22} stroke={1.5} />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchor}
        open={open}
        onClose={onClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{
          paper: {
            sx: {
              width: 360,
              maxWidth: "calc(100vw - 24px)",
              mt: 1,
              borderRadius: 2,
              boxShadow: "0 8px 24px rgba(42, 53, 71, 0.12)",
            },
          },
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.25,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {t("notifications.title")}
          </Typography>
          {unread > 0 ? (
            <Button size="small" onClick={onMarkAll} sx={{ textTransform: "none" }}>
              {t("notifications.markAllRead")}
            </Button>
          ) : null}
        </Box>
        <Divider />
        {items.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ px: 2, py: 3, textAlign: "center" }}
          >
            {t("notifications.empty")}
          </Typography>
        ) : (
          <List dense disablePadding sx={{ maxHeight: 360, overflow: "auto" }}>
            {items.map((n) => (
              <ListItemButton
                key={n.id}
                component={n.href ? Link : "div"}
                href={n.href ?? undefined}
                onClick={() => onClickItem(n)}
                sx={{
                  alignItems: "flex-start",
                  bgcolor: n.readAt ? "transparent" : "primary.light",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <ListItemText
                  primary={n.title}
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                        sx={{ display: "block", lineHeight: 1.45 }}
                      >
                        {n.body}
                      </Typography>
                      <Typography
                        component="span"
                        variant="caption"
                        color="text.secondary"
                      >
                        {formatWhen(n.createdAt)}
                      </Typography>
                    </>
                  }
                  slotProps={{
                    primary: {
                      sx: {
                        fontWeight: n.readAt ? 500 : 700,
                        fontSize: "0.875rem",
                      },
                    },
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </Menu>
    </>
  );
}
