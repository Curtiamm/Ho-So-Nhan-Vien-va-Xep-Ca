import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  addLine,
  changeQuantity,
  checkout,
  initialState,
  loadState,
  money,
  split,
  totals,
  transfer,
  type State,
} from './model';

function withLine(productId = 'pho', tableId = 'table-1'): State {
  return addLine(initialState(), tableId, productId);
}

describe('POS model', () => {
  afterEach(() => vi.restoreAllMocks());

  it('creates the local demo menu, ingredients, and twelve empty tables', () => {
    const state = initialState();
    expect(state.tables).toHaveLength(12);
    expect(state.tables.filter((table) => table.area === 'indoor')).toHaveLength(8);
    expect(state.tables.filter((table) => table.area === 'outdoor')).toHaveLength(4);
    expect(state.tables.every((table) => table.lines.length === 0)).toBe(true);
    expect(state.products).toHaveLength(12);
    expect(state.products.map((product) => product.id)).toEqual([
      'pho', 'bun', 'comga', 'comtam', 'goicuon', 'chagio', 'cafe', 'tradao', 'cam', 'bo', 'che', 'flan',
    ]);
    expect(state.products[0].image).toBe('/images/pho.jpg');
    expect(state.ingredients.length).toBeGreaterThan(0);
  });

  it('formats VND and rounds discount and VAT to integer VND', () => {
    expect(money(20000)).toContain('20.000');
    expect(totals([{ id: 'x', productId: 'p', name: 'Món', price: 1001, quantity: 1, note: '' }], 10, 8))
      .toEqual({ subtotal: 1001, discount: 100, vat: 72, total: 973 });
    expect(() => money(Number.NaN)).toThrow('Số tiền không hợp lệ');
  });

  it('rejects invalid percentages and unsafe or negative amounts', () => {
    const line = { id: 'x', productId: 'p', name: 'Món', price: 100, quantity: 1, note: '' };
    expect(() => totals([line], -1)).toThrow('Mức giảm giá');
    expect(() => totals([line], 0, 101)).toThrow('Thuế VAT');
    expect(() => totals([{ ...line, price: -1 }])).toThrow('Giá món');
    expect(() => totals([{ ...line, quantity: 0 }])).toThrow('Số lượng món');
  });

  it('adds products and topping as separate noted lines without changing the source', () => {
    const original = initialState();
    const state = addLine(original, 'table-1', 'pho', 'Ít cay, không hành');
    const topped = addLine(state, 'table-1', 'pho', 'Thêm phô mai', true);
    expect(original.tables[0].lines).toHaveLength(0);
    expect(state.tables[0].lines[0]).toMatchObject({ name: 'Phở bò', price: 65000, note: 'Ít cay, không hành', quantity: 1 });
    expect(topped.tables[0].lines[1]).toMatchObject({ name: 'Phở bò (thêm topping)', price: 75000, note: 'Thêm phô mai' });
    expect(() => addLine(state, 'table-1', 'missing')).toThrow('Không tìm thấy món');
    const unavailable = { ...state, products: state.products.map((product) => ({ ...product, available: false })) };
    expect(() => addLine(unavailable, 'table-1', 'pho')).toThrow('đã hết');
  });

  it('changes quantities and removes a line when its quantity reaches zero', () => {
    const state = withLine();
    const lineId = state.tables[0].lines[0].id;
    const doubled = changeQuantity(state, 'table-1', lineId, 1);
    expect(doubled.tables[0].lines[0].quantity).toBe(2);
    expect(state.tables[0].lines[0].quantity).toBe(1);
    expect(changeQuantity(doubled, 'table-1', lineId, -2).tables[0].lines).toEqual([]);
    expect(() => changeQuantity(state, 'table-1', lineId, 0)).toThrow('không hợp lệ');
  });

  it('moves only into an empty table and merges matching noted lines immutably', () => {
    const one = withLine();
    const two = addLine(one, 'table-1', 'pho');
    const lineIds = two.tables[0].lines.map((line) => line.id);
    const occupiedTarget = addLine(two, 'table-2', 'cafe');
    expect(() => transfer(occupiedTarget, 'table-1', 'table-2', 'move')).toThrow('hãy chọn ghép bàn');
    const moved = transfer(one, 'table-1', 'table-2', 'move');
    expect(moved.tables[0].lines).toHaveLength(0);
    expect(moved.tables[1].lines[0].id).toBe(one.tables[0].lines[0].id);
    const merged = transfer(two, 'table-1', 'table-2', 'merge');
    expect(merged.tables[0].lines).toEqual([]);
    expect(merged.tables[1].lines).toHaveLength(1);
    expect(merged.tables[1].lines[0].quantity).toBe(2);
    expect(two.tables[0].lines.map((line) => line.id)).toEqual(lineIds);
    expect(() => transfer(two, 'table-1', 'table-1', 'merge')).toThrow('cùng một bàn');
    expect(() => transfer(initialState(), 'table-1', 'table-2', 'move')).toThrow('không có món');
  });

  it('splits selected lines to an empty table and validates selection', () => {
    let state = withLine();
    state = addLine(state, 'table-1', 'cafe');
    const [first, second] = state.tables[0].lines;
    const splitState = split(state, 'table-1', 'table-2', [first.id]);
    expect(splitState.tables[0].lines).toEqual([second]);
    expect(splitState.tables[1].lines).toEqual([first]);
    expect(() => split(state, 'table-1', 'table-2', ['missing'])).toThrow('không thuộc bàn nguồn');
    expect(() => split(state, 'table-1', 'table-2', [first.id, first.id])).toThrow('chọn món hợp lệ');
    expect(() => split(splitState, 'table-1', 'table-2', [second.id])).toThrow('phải trống');
  });

  it('settles once, decrements recipe inventory, creates a receipt, and clears the table', () => {
    const ordered = withLine();
    const beforeBeef = ordered.ingredients.find((ingredient) => ingredient.id === 'beef')!.stock;
    const settled = checkout(ordered, 'table-1', 'cash', 0, 8, 70200);
    expect(settled.ingredients.find((ingredient) => ingredient.id === 'beef')!.stock).toBeCloseTo(beforeBeef - 0.12);
    expect(settled.ingredients.find((ingredient) => ingredient.id === 'noodle')!.stock).toBeCloseTo(17.82);
    expect(settled.tables[0].lines).toEqual([]);
    expect(settled.receipts).toHaveLength(1);
    expect(settled.receipts[0]).toMatchObject({
      tableName: 'Bàn 01', subtotal: 65000, discount: 0, vat: 5200, total: 70200,
      method: 'cash', cashReceived: 70200,
    });
    expect(() => checkout(settled, 'table-1', 'cash', 0, 8, 70200)).toThrow('chưa có món');
    expect(settled.receipts).toHaveLength(1);
  });

  it('keeps state unchanged when cash is short or inventory is insufficient', () => {
    const ordered = withLine();
    expect(() => checkout(ordered, 'table-1', 'cash', 0, 8, 70000)).toThrow('chưa đủ');
    const emptyStock = {
      ...ordered,
      ingredients: ordered.ingredients.map((ingredient) => ingredient.id === 'beef' ? { ...ingredient, stock: 0 } : ingredient),
    };
    expect(() => checkout(emptyStock, 'table-1', 'cash', 0, 8, 70200)).toThrow('Không đủ tồn kho Thịt bò');
    expect(ordered.tables[0].lines).toHaveLength(1);
    expect(ordered.receipts).toHaveLength(0);
    const cardPayment = checkout(ordered, 'table-1', 'card', 0, 0, 0);
    expect(cardPayment.receipts[0].method).toBe('card');
    expect(cardPayment.receipts[0].cashReceived).toBe(0);
  });

  it('loads valid persisted state and rejects malformed or inconsistent data', () => {
    const state = initialState();
    expect(loadState(JSON.stringify(state))).toEqual(state);
    expect(loadState(null).tables).toHaveLength(12);
    expect(() => loadState('{broken')).toThrow('Không thể đọc dữ liệu POS');
    expect(() => loadState('{}')).toThrow('Cấu trúc dữ liệu POS');
    const malformed = { ...state, tables: [{ ...state.tables[0], lines: [{ id: 'bad' }] }] };
    expect(() => loadState(JSON.stringify(malformed))).toThrow('Mã sản phẩm không hợp lệ');
    const orphanedRecipe = { ...state, products: state.products.map((product) => product.id === 'pho'
      ? { ...product, recipe: { phantom: 1 } } : product) };
    expect(() => loadState(JSON.stringify(orphanedRecipe))).toThrow('tham chiếu nguyên liệu không tồn tại');
  });
});
