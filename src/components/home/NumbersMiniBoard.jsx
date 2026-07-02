import * as React from "react";
import { Box, Chip, Stack, Typography, CircularProgress } from "@mui/material";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import { loadNumbersForDraw } from "../../utils/homeApi";
import { campaignColors } from "../../theme/campaignTheme";

const LEGEND = [
  { label: "Disponível", sx: { bgcolor: "rgba(103,194,58,0.35)", border: "2px solid #7CFF4D", color: "#fff" } },
  { label: "Reservado", sx: { bgcolor: "rgba(255,193,7,0.3)", border: "2px solid #FFC107", color: "#fff" } },
  { label: "Indisponível", sx: { bgcolor: "rgba(211,47,47,0.35)", border: "2px solid #EF5350", color: "#fff" } },
];

function sxForStatus(st) {
  const s = String(st || "").toLowerCase();
  if (s === "sold" || s === "taken") {
    return {
      bgcolor: "rgba(211,47,47,0.4)",
      border: "2px solid",
      borderColor: "#EF5350",
      color: "#fff",
    };
  }
  if (s === "reserved") {
    return {
      bgcolor: "rgba(255,193,7,0.35)",
      border: "2px solid",
      borderColor: "#FFD54F",
      color: "#050805",
      fontWeight: 900,
    };
  }
  return {
    bgcolor: "rgba(103,194,58,0.3)",
    border: "2px solid",
    borderColor: "#7CFF4D",
    color: "#fff",
  };
}

export default function NumbersMiniBoard({ drawId, productKey }) {
  const [nums, setNums] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      const list = await loadNumbersForDraw(drawId, productKey);
      if (alive) {
        setNums(list);
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [drawId, productKey]);

  const statusByN = React.useMemo(() => {
    const m = {};
    for (const it of nums) m[Number(it.n)] = it.status;
    return m;
  }, [nums]);

  const stats = React.useMemo(() => {
    let available = 0;
    let reserved = 0;
    let unavailable = 0;
    for (let i = 0; i < 100; i++) {
      const st = String(statusByN[i] || "available").toLowerCase();
      if (st === "sold" || st === "taken") unavailable++;
      else if (st === "reserved") reserved++;
      else available++;
    }
    return { available, reserved, unavailable };
  }, [statusByN]);

  return (
    <Box
      sx={{
        mt: 2,
        p: { xs: 1.25, sm: 1.5 },
        borderRadius: 2.5,
        border: `2px solid ${campaignColors.borderNeon}`,
        bgcolor: "rgba(5,8,5,0.6)",
        boxShadow: "inset 0 0 24px rgba(103,194,58,0.06)",
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.25 }}>
        <GridViewRoundedIcon sx={{ fontSize: 20, color: "primary.light" }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 900, color: "primary.light" }}>
          Tabela de números
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary", ml: "auto" }}>
          {stats.available} disp. · {stats.reserved} reserv. · {stats.unavailable} indisp.
        </Typography>
      </Stack>

      <Stack direction="row" spacing={0.75} sx={{ mb: 1.25, flexWrap: "wrap" }} aria-label="Legenda dos números">
        {LEGEND.map((item) => (
          <Chip
            key={item.label}
            size="small"
            label={item.label}
            sx={{ ...item.sx, fontWeight: 700, fontSize: 10, height: 24 }}
          />
        ))}
      </Stack>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={28} sx={{ color: "primary.main" }} />
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(10, 1fr)",
            gap: { xs: 0.5, sm: 0.45 },
          }}
        >
          {Array.from({ length: 100 }).map((_, i) => {
            const st = statusByN[i] || "available";
            const label = String(i).padStart(2, "0");
            const isTaken = ["sold", "taken", "reserved"].includes(String(st).toLowerCase());
            return (
              <Box
                key={i}
                title={`${label} — ${st}`}
                sx={{
                  aspectRatio: "1 / 1",
                  minHeight: { xs: 26, sm: 22 },
                  borderRadius: 0.75,
                  fontSize: { xs: 10, sm: 9 },
                  fontWeight: 900,
                  lineHeight: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  userSelect: "none",
                  opacity: isTaken ? 1 : 0.95,
                  ...sxForStatus(st),
                }}
              >
                {label}
              </Box>
            );
          })}
        </Box>
      )}

      <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 1, textAlign: "center" }}>
        Visualização em tempo real — somente leitura
      </Typography>
    </Box>
  );
}
