export type ProductCategory = 'main' | 'starter' | 'drink' | 'dessert';
export type TableArea = 'indoor' | 'outdoor';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  image: string;
  available: boolean;
  recipe: Record<string, number>;
}

export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  stock: number;
  min: number;
}

export interface Line {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  note: string;
}

export interface Table {
  id: string;
  name: string;
  area: TableArea;
  seats: number;
  lines: Line[];
}

export interface Receipt {
  id: string;
  tableName: string;
  createdAt: string;
  lines: Line[];
  subtotal: number;
  discount: number;
  vat: number;
  total: number;
  method: string;
  cashReceived: number;
}

export interface State {
  version: 1;
  products: Product[];
  ingredients: Ingredient[];
  tables: Table[];
  receipts: Receipt[];
}

export const STORAGE_KEY = 'restaurant-pos-state-v1';

const productSeeds: Array<Omit<Product, 'image' | 'available'>> = [
  { id: 'pho', name: 'Phở bò', category: 'main', price: 65000, recipe: { beef: 0.12, noodle: 0.18 } },
  { id: 'bun', name: 'Bún bò', category: 'main', price: 65000, recipe: { beef: 0.1, noodle: 0.18 } },
  { id: 'comga', name: 'Cơm gà', category: 'main', price: 55000, recipe: { chicken: 0.18, rice: 0.15 } },
  { id: 'comtam', name: 'Cơm tấm', category: 'main', price: 60000, recipe: { pork: 0.16, rice: 0.15 } },
  { id: 'goicuon', name: 'Gỏi cuốn', category: 'starter', price: 35000, recipe: { pork: 0.06, greens: 0.05 } },
  { id: 'chagio', name: 'Chả giò', category: 'starter', price: 40000, recipe: { pork: 0.08, greens: 0.03 } },
  { id: 'cafe', name: 'Cà phê sữa', category: 'drink', price: 30000, recipe: { coffee: 0.02, milk: 0.03 } },
  { id: 'tradao', name: 'Trà đào', category: 'drink', price: 35000, recipe: { tea: 0.01, peach: 0.05 } },
  { id: 'cam', name: 'Nước cam', category: 'drink', price: 40000, recipe: { orange: 0.2 } },
  { id: 'bo', name: 'Sinh tố bơ', category: 'drink', price: 45000, recipe: { avocado: 0.15, milk: 0.04 } },
  { id: 'che', name: 'Chè', category: 'dessert', price: 25000, recipe: { beans: 0.06, milk: 0.02 } },
  { id: 'flan', name: 'Bánh flan', category: 'dessert', price: 20000, recipe: { egg: 1, milk: 0.03 } },
];

const ingredientSeeds: Ingredient[] = [
  { id: 'beef', name: 'Thịt bò', unit: 'kg', stock: 12, min: 2 },
  { id: 'noodle', name: 'Bánh phở / bún', unit: 'kg', stock: 18, min: 3 },
  { id: 'chicken', name: 'Thịt gà', unit: 'kg', stock: 10, min: 2 },
  { id: 'rice', name: 'Gạo', unit: 'kg', stock: 20, min: 4 },
  { id: 'pork', name: 'Thịt heo', unit: 'kg', stock: 10, min: 2 },
  { id: 'greens', name: 'Rau sống', unit: 'kg', stock: 5, min: 1 },
  { id: 'coffee', name: 'Cà phê', unit: 'kg', stock: 3, min: 0.5 },
  { id: 'milk', name: 'Sữa', unit: 'l', stock: 8, min: 2 },
  { id: 'tea', name: 'Trà', unit: 'kg', stock: 2, min: 0.4 },
  { id: 'peach', name: 'Đào', unit: 'kg', stock: 4, min: 1 },
  { id: 'orange', name: 'Cam', unit: 'kg', stock: 8, min: 2 },
  { id: 'avocado', name: 'Bơ', unit: 'kg', stock: 4, min: 1 },
  { id: 'beans', name: 'Đậu', unit: 'kg', stock: 5, min: 1 },
  { id: 'egg', name: 'Trứng', unit: 'quả', stock: 60, min: 12 },
];

export function initialState(): State {
  const products: Product[] = productSeeds.map((product) => ({
    ...product,
    recipe: { ...product.recipe },
    image: `/images/${product.id}.jpg`,
    available: true,
  }));
  const tables: Table[] = Array.from({ length: 12 }, (_, index) => ({
    id: `table-${index + 1}`,
    name: `Bàn ${String(index + 1).padStart(2, '0')}`,
    area: index < 8 ? 'indoor' : 'outdoor',
    seats: index % 4 === 3 ? 6 : 4,
    lines: [],
  }));

  return {
    version: 1,
    products,
    ingredients: ingredientSeeds.map((ingredient) => ({ ...ingredient })),
    tables,
    receipts: [],
  };
}

export function money(amount: number): string {
  if (!Number.isFinite(amount)) throw new Error('Số tiền không hợp lệ.');
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

export interface Totals {
  subtotal: number;
  discount: number;
  vat: number;
  total: number;
}

function validatePercent(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new Error(`${label} phải từ 0 đến 100%.`);
  }
}

function validateVnd(value: number, label: string, allowZero = true): void {
  if (!Number.isSafeInteger(value) || value < (allowZero ? 0 : 1)) {
    throw new Error(`${label} phải là số tiền VND hợp lệ.`);
  }
}

function checkedLines(lines: Line[]): void {
  for (const line of lines) {
    validateVnd(line.price, 'Giá món');
    if (!Number.isSafeInteger(line.quantity) || line.quantity < 1) {
      throw new Error('Số lượng món không hợp lệ.');
    }
  }
}

export function totals(lines: Line[], discountPercent = 0, vatPercent = 8): Totals {
  validatePercent(discountPercent, 'Mức giảm giá');
  validatePercent(vatPercent, 'Thuế VAT');
  checkedLines(lines);

  const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  validateVnd(subtotal, 'Tạm tính');
  const discount = Math.round((subtotal * discountPercent) / 100);
  const vat = Math.round(((subtotal - discount) * vatPercent) / 100);
  const total = subtotal - discount + vat;
  validateVnd(total, 'Tổng thanh toán');
  return { subtotal, discount, vat, total };
}

function id(): string {
  return globalThis.crypto.randomUUID();
}

function tableOrThrow(state: State, tableId: string): Table {
  const table = state.tables.find((entry) => entry.id === tableId);
  if (!table) throw new Error('Không tìm thấy bàn.');
  return table;
}

export function addLine(state: State, tableId: string, productId: string, note = '', topping = false): State {
  const table = tableOrThrow(state, tableId);
  const product = state.products.find((entry) => entry.id === productId);
  if (!product) throw new Error('Không tìm thấy món ăn.');
  if (!product.available) throw new Error('Món này hiện đã hết.');
  if (typeof note !== 'string') throw new Error('Ghi chú món không hợp lệ.');
  const line: Line = {
    id: id(),
    productId: product.id,
    name: topping ? `${product.name} (thêm topping)` : product.name,
    price: product.price + (topping ? 10000 : 0),
    quantity: 1,
    note,
  };
  return {
    ...state,
    tables: state.tables.map((entry) => entry.id === tableId ? { ...entry, lines: [...entry.lines, line] } : entry),
  };
}

export function changeQuantity(state: State, tableId: string, lineId: string, delta: number): State {
  const table = tableOrThrow(state, tableId);
  if (!Number.isSafeInteger(delta) || delta === 0) throw new Error('Thay đổi số lượng không hợp lệ.');
  if (!table.lines.some((line) => line.id === lineId)) throw new Error('Không tìm thấy món trên bàn.');
  return {
    ...state,
    tables: state.tables.map((entry) => entry.id !== tableId ? entry : {
      ...entry,
      lines: entry.lines.flatMap((line) => {
        if (line.id !== lineId) return [line];
        const quantity = line.quantity + delta;
        return quantity > 0 ? [{ ...line, quantity }] : [];
      }),
    }),
  };
}

export function transfer(state: State, sourceId: string, targetId: string, mode: 'move' | 'merge'): State {
  const source = tableOrThrow(state, sourceId);
  const target = tableOrThrow(state, targetId);
  if (sourceId === targetId) throw new Error('Không thể chuyển món sang cùng một bàn.');
  if (source.lines.length === 0) throw new Error('Bàn nguồn không có món để chuyển.');
  if (mode === 'move' && target.lines.length > 0) throw new Error('Bàn đích đã có món; hãy chọn ghép bàn.');

  const targetLines = mode === 'move' ? source.lines : [...target.lines];
  if (mode === 'merge') {
    for (const incoming of source.lines) {
      const matching = targetLines.find((line) => line.productId === incoming.productId
        && line.name === incoming.name && line.price === incoming.price && line.note === incoming.note);
      if (matching) {
        matching.quantity += incoming.quantity;
      } else {
        targetLines.push({ ...incoming });
      }
    }
  }
  return {
    ...state,
    tables: state.tables.map((table) => table.id === sourceId
      ? { ...table, lines: [] }
      : table.id === targetId ? { ...table, lines: targetLines } : table),
  };
}

export function split(state: State, sourceId: string, targetId: string, lineIds: string[]): State {
  const source = tableOrThrow(state, sourceId);
  const target = tableOrThrow(state, targetId);
  if (sourceId === targetId) throw new Error('Không thể tách món sang cùng một bàn.');
  if (target.lines.length > 0) throw new Error('Bàn đích phải trống để tách hóa đơn.');
  if (lineIds.length === 0 || new Set(lineIds).size !== lineIds.length) {
    throw new Error('Vui lòng chọn món hợp lệ để tách.');
  }
  const selected = new Set(lineIds);
  const moved = source.lines.filter((line) => selected.has(line.id));
  if (moved.length !== lineIds.length) throw new Error('Một hoặc nhiều món không thuộc bàn nguồn.');
  return {
    ...state,
    tables: state.tables.map((table) => table.id === sourceId
      ? { ...table, lines: table.lines.filter((line) => !selected.has(line.id)) }
      : table.id === targetId ? { ...table, lines: moved.map((line) => ({ ...line })) } : table),
  };
}

function recipeUsage(state: State, lines: Line[]): Map<string, number> {
  const products = new Map(state.products.map((product) => [product.id, product]));
  const usage = new Map<string, number>();
  for (const line of lines) {
    const product = products.get(line.productId);
    if (!product) throw new Error(`Không tìm thấy định lượng món ${line.name}.`);
    for (const [ingredientId, amount] of Object.entries(product.recipe)) {
      usage.set(ingredientId, (usage.get(ingredientId) ?? 0) + amount * line.quantity);
    }
  }
  return usage;
}

export function checkout(
  state: State,
  tableId: string,
  method: string,
  discountPercent: number,
  vatPercent: number,
  cashReceived: number,
): State {
  const table = tableOrThrow(state, tableId);
  if (table.lines.length === 0) throw new Error('Bàn chưa có món để thanh toán.');
  if (typeof method !== 'string' || method.trim() === '') throw new Error('Vui lòng chọn phương thức thanh toán.');
  const amount = totals(table.lines, discountPercent, vatPercent);
  if (method === 'cash') {
    validateVnd(cashReceived, 'Tiền khách đưa');
    if (cashReceived < amount.total) throw new Error('Tiền khách đưa chưa đủ thanh toán.');
  }

  const usage = recipeUsage(state, table.lines);
  const ingredients = state.ingredients.map((ingredient) => {
    const used = usage.get(ingredient.id) ?? 0;
    if (used > ingredient.stock + 1e-9) {
      throw new Error(`Không đủ tồn kho ${ingredient.name} để thanh toán.`);
    }
    return { ...ingredient, stock: Math.max(0, ingredient.stock - used) };
  });
  for (const ingredientId of usage.keys()) {
    if (!state.ingredients.some((ingredient) => ingredient.id === ingredientId)) {
      throw new Error('Định lượng món tham chiếu nguyên liệu không tồn tại.');
    }
  }

  const receipt: Receipt = {
    id: id(),
    tableName: table.name,
    createdAt: new Date().toISOString(),
    lines: table.lines.map((line) => ({ ...line })),
    ...amount,
    method,
    cashReceived: method === 'cash' ? cashReceived : 0,
  };
  return {
    ...state,
    ingredients,
    tables: state.tables.map((entry) => entry.id === tableId ? { ...entry, lines: [] } : entry),
    receipts: [...state.receipts, receipt],
  };
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringField(value: unknown, label: string): asserts value is string {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`${label} không hợp lệ.`);
}

function nonnegativeNumber(value: unknown, label: string): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) throw new Error(`${label} không hợp lệ.`);
}

function validateLine(value: unknown): asserts value is Line {
  if (!record(value)) throw new Error('Dữ liệu món trong hóa đơn không hợp lệ.');
  stringField(value.id, 'Mã món');
  stringField(value.productId, 'Mã sản phẩm');
  stringField(value.name, 'Tên món');
  if (typeof value.note !== 'string') throw new Error('Ghi chú món không hợp lệ.');
  validateVnd(value.price, 'Giá món');
  if (!Number.isSafeInteger(value.quantity) || (value.quantity as number) < 1) throw new Error('Số lượng món không hợp lệ.');
}

function validateState(value: unknown): asserts value is State {
  if (!record(value) || value.version !== 1 || !Array.isArray(value.products)
    || !Array.isArray(value.ingredients) || !Array.isArray(value.tables) || !Array.isArray(value.receipts)) {
    throw new Error('Cấu trúc dữ liệu POS không hợp lệ.');
  }
  const productIds = new Set<string>();
  for (const product of value.products) {
    if (!record(product)) throw new Error('Dữ liệu thực đơn không hợp lệ.');
    stringField(product.id, 'Mã sản phẩm');
    stringField(product.name, 'Tên sản phẩm');
    stringField(product.image, 'Ảnh sản phẩm');
    if (productIds.has(product.id)) throw new Error('Mã sản phẩm bị trùng.');
    productIds.add(product.id);
    if (!['main', 'starter', 'drink', 'dessert'].includes(String(product.category))) throw new Error('Danh mục món không hợp lệ.');
    validateVnd(product.price, 'Giá món');
    if (typeof product.available !== 'boolean' || !record(product.recipe)) throw new Error('Dữ liệu sản phẩm không hợp lệ.');
    for (const amount of Object.values(product.recipe)) nonnegativeNumber(amount, 'Định lượng nguyên liệu');
  }

  const ingredientIds = new Set<string>();
  for (const ingredient of value.ingredients) {
    if (!record(ingredient)) throw new Error('Dữ liệu kho nguyên liệu không hợp lệ.');
    stringField(ingredient.id, 'Mã nguyên liệu');
    stringField(ingredient.name, 'Tên nguyên liệu');
    stringField(ingredient.unit, 'Đơn vị nguyên liệu');
    if (ingredientIds.has(ingredient.id)) throw new Error('Mã nguyên liệu bị trùng.');
    ingredientIds.add(ingredient.id);
    nonnegativeNumber(ingredient.stock, 'Tồn kho');
    nonnegativeNumber(ingredient.min, 'Mức tồn kho tối thiểu');
  }
  for (const product of value.products) {
    for (const ingredientId of Object.keys(product.recipe as Record<string, number>)) {
      if (!ingredientIds.has(ingredientId)) throw new Error('Định lượng tham chiếu nguyên liệu không tồn tại.');
    }
  }

  const tableIds = new Set<string>();
  for (const table of value.tables) {
    if (!record(table)) throw new Error('Dữ liệu bàn không hợp lệ.');
    stringField(table.id, 'Mã bàn');
    stringField(table.name, 'Tên bàn');
    if (tableIds.has(table.id)) throw new Error('Mã bàn bị trùng.');
    tableIds.add(table.id);
    if (!['indoor', 'outdoor'].includes(String(table.area)) || !Number.isSafeInteger(table.seats) || (table.seats as number) < 1 || !Array.isArray(table.lines)) {
      throw new Error('Dữ liệu bàn không hợp lệ.');
    }
    for (const line of table.lines) {
      validateLine(line);
      if (!productIds.has(line.productId)) throw new Error('Món trên bàn không tồn tại trong thực đơn.');
    }
  }

  const receiptIds = new Set<string>();
  for (const receipt of value.receipts) {
    if (!record(receipt)) throw new Error('Dữ liệu hóa đơn không hợp lệ.');
    stringField(receipt.id, 'Mã hóa đơn');
    stringField(receipt.tableName, 'Tên bàn trên hóa đơn');
    stringField(receipt.createdAt, 'Thời gian hóa đơn');
    stringField(receipt.method, 'Phương thức thanh toán');
    if (receiptIds.has(receipt.id)) throw new Error('Mã hóa đơn bị trùng.');
    receiptIds.add(receipt.id);
    if (!Array.isArray(receipt.lines) || receipt.lines.length === 0) throw new Error('Hóa đơn phải có món.');
    for (const line of receipt.lines) validateLine(line);
    for (const key of ['subtotal', 'discount', 'vat', 'total', 'cashReceived'] as const) validateVnd(receipt[key], key);
    if (receipt.discount > receipt.subtotal || receipt.total !== receipt.subtotal - receipt.discount + receipt.vat) {
      throw new Error('Số tiền trên hóa đơn không khớp.');
    }
  }
}

export function loadState(raw: string | null): State {
  if (raw === null) return initialState();
  let value: unknown;
  try {
    value = JSON.parse(raw) as unknown;
  } catch {
    throw new Error('Không thể đọc dữ liệu POS đã lưu.');
  }
  try {
    validateState(value);
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error('Dữ liệu POS đã lưu không hợp lệ.');
  }
  return value;
}
