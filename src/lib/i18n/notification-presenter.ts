import type { AppLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { createTranslator } from "@/lib/i18n/translate";

type Row = {
  kind: string;
  title: string;
  body: string;
  meta: Record<string, unknown> | null;
};

function metaString(meta: Record<string, unknown> | null, key: string) {
  const v = meta?.[key];
  return v == null ? "" : String(v);
}

export function presentNotification(
  row: Row,
  locale: AppLocale,
): { title: string; body: string } {
  const t = createTranslator(getMessages(locale));
  const meta = row.meta ?? {};

  switch (row.kind) {
    case "account.family_registered":
      return {
        title: t("notifications.kinds.familyRegistered.title"),
        body: t("notifications.kinds.familyRegistered.body", {
          name: metaString(meta, "name") || metaString(meta, "email"),
          email: metaString(meta, "email"),
        }),
      };
    case "account.staff_joined": {
      const roleKey = metaString(meta, "role") || "staff";
      const role =
        roleKey === "manager"
          ? t("roles.manager")
          : roleKey === "teacher"
            ? t("roles.teacher")
            : roleKey === "family"
              ? t("roles.family")
              : roleKey;
      return {
        title: t("notifications.kinds.staffJoined.title", { role }),
        body: t("notifications.kinds.staffJoined.body", {
          name: metaString(meta, "name") || metaString(meta, "email"),
          role,
        }),
      };
    }
    case "invite.staff_role": {
      const roleKey = metaString(meta, "role") || "staff";
      const role =
        roleKey === "manager"
          ? t("roles.manager")
          : roleKey === "teacher"
            ? t("roles.teacher")
            : roleKey === "family"
              ? t("roles.family")
              : roleKey;
      return {
        title: t("notifications.kinds.staffRoleOffer.title", { role }),
        body: t("notifications.kinds.staffRoleOffer.body", { role }),
      };
    }
    case "invite.accepted": {
      const roleKey = metaString(meta, "role") || "staff";
      const role =
        roleKey === "manager"
          ? t("roles.manager")
          : roleKey === "teacher"
            ? t("roles.teacher")
            : roleKey === "family"
              ? t("roles.family")
              : roleKey;
      return {
        title: t("notifications.kinds.inviteAccepted.title"),
        body: t("notifications.kinds.inviteAccepted.body", {
          name: metaString(meta, "name") || "User",
          role,
        }),
      };
    }
    case "teacher.application_submitted":
      if (metaString(meta, "audience") === "self") {
        return {
          title: t("notifications.kinds.teacherApplicationConfirm.title"),
          body: t("notifications.kinds.teacherApplicationConfirm.body"),
        };
      }
      return {
        title: t("notifications.kinds.teacherApplication.title"),
        body: t("notifications.kinds.teacherApplication.body", {
          name: metaString(meta, "name") || "Teacher",
          count: metaString(meta, "count") || "1",
        }),
      };
    case "appointment.booked": {
      const whenRaw = metaString(meta, "when");
      const when = whenRaw
        ? new Date(whenRaw).toLocaleString(locale === "es" ? "es" : "en-US")
        : "";
      return {
        title: t("notifications.kinds.appointmentBooked.title"),
        body: t("notifications.kinds.appointmentBooked.body", {
          family: metaString(meta, "family") || "Family",
          student: metaString(meta, "student") || "student",
          when,
        }),
      };
    }
    case "payment.received":
      if (meta.provider === "paypal" || row.title.includes("PayPal")) {
        return {
          title: t("notifications.kinds.paymentReceivedPaypal.title"),
          body: t("notifications.kinds.paymentReceivedPaypal.body", {
            who: metaString(meta, "who") || "Customer",
            amount: metaString(meta, "amount") || "",
          }),
        };
      }
      return {
        title: t("notifications.kinds.paymentReceived.title"),
        body: t("notifications.kinds.paymentReceived.body", {
          who: metaString(meta, "who") || "Customer",
          amount: metaString(meta, "amount") || "",
        }),
      };
    default:
      return { title: row.title, body: row.body };
  }
}
