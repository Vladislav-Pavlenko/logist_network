import { PreparedServiceItem, ServiceItem } from "./documentTypes";
import { formatMoney, parseMoney } from "./money";

export function prepareServices(
    services: ServiceItem[],
    isInternational: boolean
): PreparedServiceItem[] {
    return services.map((item, index) => ({
        index: index + 1,
        serviceName: buildServiceName(item, isInternational),
        quantity: item.quantity || "",
        unit: item.unit || "",
        price: formatMoney(item.price || "0"),
        amount: formatMoney(item.amount || "0"),
    }));
}

export function calculateTotalAmount(services: PreparedServiceItem[]): string {
    const total = services.reduce((sum, item) => {
        const amount = parseMoney(item.amount);
        return sum + amount;
    }, 0);

    return formatMoney(String(total));
}

function buildServiceName(
    item: ServiceItem,
    isInternational: boolean
): string {
    const serviceType = isInternational
        ? "Міжнародні транспортні послуги"
        : "Транспортні послуги";

    const route = item.route?.trim() || "";
    const vehicle = item.vehicle?.trim() || "";

    if (route && vehicle) {
        return `${serviceType} по маршруту: ${route}, автомобілем ${vehicle}`;
    }

    if (route) {
        return `${serviceType} по маршруту: ${route}`;
    }

    if (vehicle) {
        return `${serviceType} автомобілем ${vehicle}`;
    }

    return serviceType;
}