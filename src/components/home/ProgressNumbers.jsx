import * as React from "react";
import { Chip, LinearProgress, Stack, Typography } from "@mui/material";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";

export default function ProgressNumbers({ total = 100, reserved = 0, sold = 0, showUrgency = false }) {
  const used = (reserved || 0) + (sold || 0);
  const left = Math.max(0, total - used);
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  const lowStock = left <= 20 && left > 0;

  return (
    <Stack spacing={0.75}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" useFlexGap>
        <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
          {left} disponíveis · {reserved || 0} reservados · {sold || 0} indisponíveis
        </Typography>
        {showUrgency && lowStock ? (
          <Chip
            size="small"
            icon={<BoltRoundedIcon sx={{ fontSize: 16 }} />}
            label={`Restam ${left} números`}
            color="warning"
            sx={{ fontWeight: 800, height: 24 }}
          />
        ) : null}
      </Stack>
      <LinearProgress
        variant="determinate"
        value={pct}
        aria-label={`${left} de ${total} números disponíveis`}
        sx={{
          height: 8,
          borderRadius: 99,
          bgcolor: "rgba(255,255,255,0.08)",
          "& .MuiLinearProgress-bar": {
            borderRadius: 99,
            background: lowStock
              ? "linear-gradient(90deg,#FF9800,#FFC107)"
              : "linear-gradient(90deg,#59b15f,#67C23A)",
          },
        }}
      />
    </Stack>
  );
}
