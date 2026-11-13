"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import {
  acceptFamilyPrivacyPolicy,
  acceptSchedulingPolicy,
} from "@/server/actions/policy-acceptance";

export function SchedulingPolicyAcceptance({
  needsScheduling,
  needsPrivacy,
}: {
  needsScheduling: boolean;
  needsPrivacy: boolean;
}) {
  const [done, setDone] = useState(!needsScheduling && !needsPrivacy);
  const [loading, setLoading] = useState(false);

  if (done) return null;

  return (
    <div className="dash-card mb-4 space-y-3 p-4 text-sm">
      <p className="font-semibold">Before you schedule</p>
      <p className="text-[var(--dash-muted)]">
        Classes use prepaid credits. Cancelling inside 24 hours may cost 1 credit.
        Emergencies can be reviewed by a manager. Minors: a parent must accept
        privacy terms.
      </p>
      <Button
        variant="contained"
        size="small"
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          if (needsScheduling) await acceptSchedulingPolicy();
          if (needsPrivacy) await acceptFamilyPrivacyPolicy();
          setLoading(false);
          setDone(true);
        }}
      >
        I accept scheduling & privacy terms
      </Button>
    </div>
  );
}
