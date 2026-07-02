import * as React from "react";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import { loadNumbersForDraw } from "../../utils/homeApi";
import { campaignColors } from "../../theme/campaignTheme";

const LEGEND = [
  { label: "Disponível", sx: { bgcolor: "rgba(103,194,58,0.3)", border: "2px solid #7CFF4D", color: "#fff" } },
  { label: "Reservado", sx: { bgcolor: "rgba(255,193,7,0.25)", border: "2px solid #FFC107", color: "#fff" } },
  { label: "Indisponível", sx: { bgcolor: "rgba(211,47,47,0.3)", border: "2px solid #EF5350", color: "#fff" } },
];

function sxForStatus(st) {
  const s = String(st || "").toLowerCase();
  if (s === "sold" || s === "taken") {
    return { bgcolor: "rgba(211,47,47,0.3)", border: "2px solid", borderColor: "error.main", color: "#fff" };
  }
  if (s === "reserved") {
    return { bgcolor: "rgba(255,193,7,0.25)", border: "2px solid", borderColor: "secondary.main", color: "#fff" };
  }
  return { bgcolor: "rgba(103,194,58,0.28)", border: "2px solid", borderColor: "primary.light", color: "#fff" };
}

export default function NumbersMiniBoard({ drawId, productKey, collapsed = false }) {
  const [nums, setNums] = React.useState([]);
  const [expanded, setExpanded] = React.useState(!collapsed);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      const list = await loadNumbersForDraw(drawId, productKey);
      if (alive) setNums(list);
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

  return (
    <Box sx={{ mt: 1.5 }}>
      {collapsed ? (
        <Button
          fullWidth
          size="medium"
          variant="outlined"
          endIcon={
            <ExpandMoreRoundedIcon
              sx={{ transform: expanded ? "rotate(180deg)" : "none", transition: "0.2s" }}
            />
          }
          onClick={() => setExpanded((v) => !v)}
          sx={{
            fontWeight: 700,
            py: 1.25,
            borderColor: campaignColors.borderNeon,
            color: "primary.main",
          }}
        >
          {expanded ? "Ocultar tabela de números" : "Ver números disponíveis"}
        </Button>
      ) : null}

      <Stack
        direction="row"
        spacing={1}
        sx={{ mt: collapsed ? 1.5 : 0, mb: 1, flexWrap: "wrap" }}
        aria-label="Legenda dos números"
      >
        {LEGEND.map((item) => (
          <Chip
            key={item.label}
            size="small"
            label={item.label}
            sx={{ ...item.sx, fontWeight: 700, fontSize: 11 }}
          />
        ))}
      </Stack>

      {(!collapsed || expanded) ? (
        <>
          <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1 }}>
            Tabela (somente leitura)
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(10, 1fr)",
              gap: { xs: 0.6, sm: 0.5 },
            }}
          >
            {Array.from({ length: 100 }).map((_, i) => {
              const st = statusByN[i] || "available";
              const label = String(i).padStart(2, "0");
              return (
                <Box
                  key={i}
                  title={`${label} — ${st}`}
                  sx={{
                    aspectRatio: "1 / 1",
                    minHeight: { xs: 28, sm: 24 },
                    borderRadius: 1,
                    fontSize: { xs: 11, sm: 10 },
                    fontWeight: 900,
                    lineHeight: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    userSelect: "none",
                    ...sxForStatus(st),
                  }}
                >
                  {label}
                </Box>
              );
            })}
          </Box>
        </>
      ) : null}
    </Box>
  );
}
