import badgeMap from "@/data/level-3/badge-map.json";
import inventoryMovementPages from "@/data/level-3/inventory-movements-pages.json";
import ordersPages from "@/data/level-3/orders-pages.json";
import refundsPages from "@/data/level-3/refunds-pages.json";
import supportCases from "@/data/level-3/support-cases.json";
import vendorMap from "@/data/level-3/vendor-map.json";

export function getOrdersPage(page: string) {
  return (ordersPages as Record<string, unknown>)[page] ?? null;
}

export function getRefundsPage(page: string) {
  return (refundsPages as Record<string, unknown>)[page] ?? null;
}

export function getInventoryMovementsPage(cursor: string) {
  return (inventoryMovementPages as Record<string, unknown>)[cursor] ?? null;
}

export function getVendorMap() {
  return structuredClone(vendorMap);
}

export function getSupportCases() {
  return structuredClone(supportCases);
}

export function getBadgeMap() {
  return structuredClone(badgeMap);
}
