/** Customer order history — stored in localStorage */

export interface SavedOrder {
  date: string;
  items: { id: string; name: string; price: number; quantity: number; options: string[] }[];
  total: number;
}

export interface CustomerRecord {
  phone: string;
  name: string;
  address: string;
  orders: SavedOrder[];
  lastOrder: string; // ISO date
  childDob?: string; // Optional: Birth date of first child
  childName?: string; // Optional: Name of first child
  childGender?: string; // Optional: Gender of first child (ولد / بنت)
}

const LS_KEY = 'pc_customers';

function loadCustomers(): Record<string, CustomerRecord> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveCustomers(data: Record<string, CustomerRecord>) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

/** Save a customer's order */
export function saveCustomerOrder(
  phone: string,
  name: string,
  address: string,
  cartItems: { menuItem: { id: string; name: string; price: number }; selectedOptions: { name: string; price: number }[]; quantity: number }[],
  total: number,
  childDob?: string,
  childName?: string,
  childGender?: string
) {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  if (!cleanPhone) return;

  const customers = loadCustomers();
  const order: SavedOrder = {
    date: new Date().toISOString(),
    items: cartItems.map(ci => ({
      id: ci.menuItem.id,
      name: ci.menuItem.name,
      price: ci.menuItem.price,
      quantity: ci.quantity,
      options: ci.selectedOptions.map(o => o.name),
    })),
    total,
  };

  if (customers[cleanPhone]) {
    customers[cleanPhone].name = name;
    if (address) customers[cleanPhone].address = address;
    if (childDob) customers[cleanPhone].childDob = childDob;
    if (childName) customers[cleanPhone].childName = childName;
    if (childGender) customers[cleanPhone].childGender = childGender;
    customers[cleanPhone].orders.push(order);
    customers[cleanPhone].lastOrder = order.date;
  } else {
    customers[cleanPhone] = { phone: cleanPhone, name, address, orders: [order], lastOrder: order.date, childDob, childName, childGender };
  }

  saveCustomers(customers);
}

/** Look up customer by phone */
export function findCustomer(phone: string): CustomerRecord | null {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  if (!cleanPhone) return null;
  const customers = loadCustomers();
  return customers[cleanPhone] || null;
}

/** Get last order items for re-order */
export function getLastOrderItems(phone: string): SavedOrder['items'] | null {
  const customer = findCustomer(phone);
  if (!customer || customer.orders.length === 0) return null;
  return customer.orders[customer.orders.length - 1].items;
}

/** Get all customers for admin export */
export function getAllCustomers(): CustomerRecord[] {
  return Object.values(loadCustomers());
}

/** Get total number of customers */
export function getCustomerCount(): number {
  return Object.keys(loadCustomers()).length;
}
