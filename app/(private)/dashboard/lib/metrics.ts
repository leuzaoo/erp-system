export function sumOrdersTotal(orders: { total_price: number | string }[] = []) {
  return orders.reduce((acc, order) => acc + Number(order.total_price || 0), 0);
}

export function countOrdersInProduction(orders: { status: string }[] = []) {
  return orders.filter((order) => order.status === "FABRICACAO").length;
}

export function countOrdersReadyToProduce(orders: { status: string }[] = []) {
  return orders.filter((order) => order.status === "APROVADO").length;
}
