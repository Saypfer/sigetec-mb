export function getInventorySummary(items, isAdmin, formatMoney) {
  const summary = [
    ["Total repuestos", items.length],
    ["Stock bajo", items.filter((item) => item.status === "Stock bajo").length],
  ];

  if (isAdmin) {
    const totalValue = items.reduce(
      (total, item) => total + Number(item.price ?? 0) * Number(item.quantity ?? 0),
      0
    );
    summary.push(["Valor estimado", formatMoney(totalValue)]);
  }

  return summary;
}
