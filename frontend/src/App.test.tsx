import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { initialState, loadState, STORAGE_KEY } from "./pos/model";

beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
const addPho = () =>
  fireEvent.click(
    screen.getAllByRole("button", { name: "Thêm vào đơn: Phở bò" })[1],
  );
const saved = () => loadState(localStorage.getItem(STORAGE_KEY));

describe("POS interface", () => {
  it("renders the Vietnamese POS and filters menu by category and unaccented search", () => {
    render(<App />);
    expect(
      screen.getByRole("heading", { name: "Mọi món ngon, một chạm." }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Thanh toán" })).toBeDisabled();
    fireEvent.change(
      screen.getByRole("textbox", { name: "Tìm tên món ăn, đồ uống..." }),
      { target: { value: "pho bo" } },
    );
    expect(
      screen.getAllByRole("button", { name: "Thêm vào đơn: Phở bò" }),
    ).toHaveLength(2);
    expect(
      screen.queryByRole("button", { name: "Thêm vào đơn: Bún bò" }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Đồ uống" }));
    expect(screen.getByText("Không tìm thấy món phù hợp.")).toBeInTheDocument();
  });
  it("saves a customized item and restores it on remount", () => {
    const { unmount } = render(<App />);
    fireEvent.click(
      screen.getAllByRole("button", { name: "Thêm vào đơn: Phở bò" })[0],
    );
    const dialog = screen.getByRole("dialog");
    fireEvent.change(
      within(dialog).getByPlaceholderText("Ví dụ: ít cay, không hành..."),
      { target: { value: "Không hành" } },
    );
    fireEvent.click(within(dialog).getByRole("checkbox"));
    fireEvent.click(
      within(dialog).getByRole("button", { name: /Thêm vào đơn/ }),
    );
    expect(saved().tables[0].lines[0]).toMatchObject({
      note: "Không hành",
      price: 75000,
    });
    unmount();
    render(<App />);
    expect(screen.getByText("Không hành")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Thanh toán" })).toBeEnabled();
  });
  it("records cash checkout once, deducts inventory and lists the receipt", () => {
    render(<App />);
    addPho();
    fireEvent.change(screen.getByRole("textbox", { name: "Mã ưu đãi" }), {
      target: { value: "BEP10" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Áp dụng" }));
    fireEvent.click(screen.getByRole("button", { name: "Thanh toán" }));
    expect(
      screen.getByRole("button", { name: "Ghi nhận thanh toán" }),
    ).toBeDisabled();
    fireEvent.change(
      screen.getByRole("spinbutton", { name: "Tiền khách đưa" }),
      { target: { value: "100000" } },
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Ghi nhận thanh toán" }),
    );
    expect(saved().receipts).toHaveLength(1);
    expect(saved().receipts[0]).toMatchObject({
      subtotal: 65000,
      discount: 6500,
      vat: 4680,
      total: 63180,
      method: "cash",
    });
    expect(saved().tables[0].lines).toHaveLength(0);
    expect(saved().ingredients.find((i) => i.id === "beef")!.stock).toBeCloseTo(
      initialState().ingredients.find((i) => i.id === "beef")!.stock - 0.12,
    );
    fireEvent.click(screen.getByRole("button", { name: "Hoàn tất" }));
    fireEvent.click(screen.getByRole("button", { name: "Báo cáo" }));
    expect(
      screen.getByRole("button", {
        name: "#" + saved().receipts[0].id.slice(-6).toUpperCase(),
      }),
    ).toBeInTheDocument();
  });
  it("requires explicit external confirmation for wallet payments", () => {
    render(<App />);
    addPho();
    fireEvent.click(screen.getByRole("button", { name: "Thanh toán" }));
    fireEvent.click(screen.getByRole("button", { name: "MoMo" }));
    expect(
      screen.getByRole("button", { name: "Ghi nhận thanh toán" }),
    ).toBeDisabled();
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(
      screen.getByRole("button", { name: "Ghi nhận thanh toán" }),
    );
    expect(saved().receipts[0].method).toBe("momo");
  });
  it("moves an order to an empty table", () => {
    render(<App />);
    addPho();
    fireEvent.click(screen.getByRole("button", { name: "Chuyển bàn" }));
    fireEvent.change(within(screen.getByRole("dialog")).getByRole("combobox"), {
      target: { value: initialState().tables[1].id },
    });
    fireEvent.click(screen.getByRole("button", { name: "Xác nhận" }));
    expect(saved().tables[0].lines).toHaveLength(0);
    expect(saved().tables[1].lines).toHaveLength(1);
    expect(screen.getByRole("combobox", { name: "Chọn bàn" })).toHaveValue(
      initialState().tables[1].id,
    );
  });
  it("does not report a successful order when persistence fails", () => {
    render(<App />);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    addPho();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Không thể lưu dữ liệu",
    );
    expect(screen.getByRole("button", { name: "Thanh toán" })).toBeDisabled();
  });
  it("preserves invalid saved data and blocks edits", () => {
    localStorage.setItem(STORAGE_KEY, "broken");
    render(<App />);
    addPho();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Không ghi đè dữ liệu cũ",
    );
    expect(localStorage.getItem(STORAGE_KEY)).toBe("broken");
  });
});
