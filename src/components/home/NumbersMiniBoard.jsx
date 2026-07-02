import * as React from "react";
import { Box, Stack, Typography, Skeleton } from "@mui/material";
import { loadNumbersForDraw } from "../../utils/homeApi";
import { campaignColors } from "../../theme/campaignTheme";

const LEGEND = [
  { label: "Disponível", color: campaignColors.neonGreenSecondary },
  { label: "Reservado", color: campaignColors.reserved },
  { label: "Indisponível", color: campaignColors.unavailable },
];

function sxForStatus(st) {
  const s = String(st || "").toLowerCase();
  if (s === "sold" || s === "taken") {
    return { bgcolor: "rgba(255,59,59,0.2)", border: "1px solid", borderColor: campaignColors.unavailable, color: "#fff" };
  }
  if (s === "reserved") {
    return { bgcolor: "rgba(255,176,32,0.2)", border: "1px solid", borderColor: campaignColors.reserved, color: "#fff" };
  }
  return { bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", color: campaignColors.textSecondary };
}

function computeStats(statusByN) {
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
}

function NumbersGrid({ statusByN }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(10, minmax(0, 1fr))",
        gap: "4px",
        width: "100%",
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
              borderRadius: 0.5,
              fontSize: { xs: "clamp(9px, 2.6vw, 11px)", sm: 10 },
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              userSelect: "none",
              minWidth: 0,
              ...sxForStatus(st),
            }}
          >
            {label}
          </Box>
        );
      })}
    </Box>
  );
}

function NumbersGridSkeleton() {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(10, minmax(0, 1fr))", gap: "4px" }}>
      {Array.from({ length: 100 }).map((_, i) => (
        <Skeleton key={i} variant="rounded" sx={{ aspectRatio: "1 / 1", bgcolor: "rgba(255,255,255,0.04)" }} />
      ))}
    </Box>
  );
}

function NumbersMiniBoardInner({ drawId, productKey, numbers: preloadedNumbers, numbersLoading }) {
  const [nums, setNums] = React.useState(preloadedNumbers || []);
  const [loading, setLoading] = React.useState(numbersLoading !== false && !preloadedNumbers?.length);

  React.useEffect(() => {
    if (preloadedNumbers?.length) {
      setNums(preloadedNumbers);
      setLoading(false);
      return undefined;
    }
    if (numbersLoading === false && !preloadedNumbers) {
      setLoading(false);
      return undefined;
    }

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
  }, [drawId, productKey, preloadedNumbers, numbersLoading]);

  const statusByN = React.useMemo(() => {
    const m = {};
    for (const it of nums) m[Number(it.n)] = it.status;
    return m;
  }, [nums]);

  const stats = React.useMemo(() => computeStats(statusByN), [statusByN]);

  return (
    <Box
      sx={{
        mt: 1.5,
        p: { xs: 1.25, sm: 1.5 },
        borderRadius: 1.5,
        bgcolor: "rgba(3,7,3,0.5)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 700, color: campaignColors.textPrimary, mb: 0.5, fontSize: "0.85rem" }}>
        Veja os números disponíveis abaixo
      </Typography>
      <Typography variant="caption" sx={{ color: campaignColors.textSecondary, display: "block", mb: 1.25 }}>
        {loading
          ? "Carregando tabela…"
          : `${stats.available} disponíveis · ${stats.reserved} reservados · ${stats.unavailable} indisponíveis`}
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 1.25, flexWrap: "wrap" }} aria-label="Legenda">
        {LEGEND.map((item) => (
          <Stack key={item.label} direction="row" spacing={0.5} alignItems="center">
            <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: item.color }} />
            <Typography variant="caption" sx={{ color: campaignColors.textSecondary, fontSize: "0.7rem" }}>
              {item.label}
            </Typography>
          </Stack>
        ))}
      </Stack>

      {loading ? <NumbersGridSkeleton /> : <NumbersGrid statusByN={statusByN} />}
    </Box>
  );
}

export default React.memo(NumbersMiniBoardInner);
