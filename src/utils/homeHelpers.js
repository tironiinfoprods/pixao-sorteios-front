export const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function getPrizeCents(p, d) {
  return p?.prize_cents ?? p?.default_prize_cents ?? d?.prize_cents ?? 0;
}

export function getPriceCents(p, d) {
  return d?.ticket_price_cents ?? p?.price_cents ?? 0;
}

export function getProductKey(p) {
  return p?.sku || p?.id;
}

export function pickFeaturedCard(cards) {
  if (!cards?.length) return null;
  return cards.reduce((best, row) => {
    const bestPrize = getPrizeCents(best?.product, best?.draw);
    const rowPrize = getPrizeCents(row?.product, row?.draw);
    return rowPrize > bestPrize ? row : best;
  }, cards[0]);
}

export function sortCardsByPrize(cards) {
  return [...(cards || [])].sort(
    (a, b) => getPrizeCents(b?.product, b?.draw) - getPrizeCents(a?.product, a?.draw)
  );
}

export function getTopPrizes(cards, limit = 3) {
  const sorted = sortCardsByPrize(cards);
  const labels = ["1º Prêmio", "2º Prêmio", "3º Prêmio"];
  return sorted.slice(0, limit).map((row, i) => ({
    label: labels[i] || `${i + 1}º Prêmio`,
    amount: getPrizeCents(row?.product, row?.draw) / 100,
    row,
  }));
}

export function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}
