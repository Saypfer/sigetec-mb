const completedStatuses = new Set(["Finalizado", "Entregado"]);

export function getCompletedOrders(orders) {
  return orders
    .filter((order) => completedStatuses.has(order.status))
    .sort((first, second) => {
      const firstUpdated = Date.parse(first.updatedAt ?? first.createdAt ?? "") || 0;
      const secondUpdated = Date.parse(second.updatedAt ?? second.createdAt ?? "") || 0;
      return secondUpdated - firstUpdated;
    });
}
