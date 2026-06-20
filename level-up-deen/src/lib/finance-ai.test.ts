import { describe, it, expect } from "vitest";
import { parseNaturalTransaction } from "./finance-ai";

describe("parseNaturalTransaction (Fallback)", () => {
  it("should parse income correctly", () => {
    const result = parseNaturalTransaction("Gaji bulan ini 5 juta");
    expect(result.type).toBe("income");
    expect(result.amount).toBe(5000000);
    expect(result.category).toBe("Income utama");
  });

  it("should parse expense with thousands correctly", () => {
    const result = parseNaturalTransaction("Beli kopi 25rb");
    expect(result.type).toBe("expense");
    expect(result.amount).toBe(25000);
    expect(result.category).toBe("Makan dan minum");
  });

  it("should parse transfer correctly", () => {
    const result = parseNaturalTransaction("Transfer antar rekening 500k");
    expect(result.type).toBe("transfer");
    expect(result.amount).toBe(500000);
    expect(result.category).toBe("Lainnya");
  });

  it("should handle mixed case and unstructured text", () => {
    const result = parseNaturalTransaction("BAYAR OJEK 15.500 rupiah");
    expect(result.type).toBe("expense");
    // "15.500" parsed as 15500
    expect(result.amount).toBe(15500);
    expect(result.category).toBe("Transportasi");
  });

  it("should parse ziswaf correctly", () => {
    const result = parseNaturalTransaction("Sedekah jumat 50 rb");
    expect(result.type).toBe("expense");
    expect(result.amount).toBe(50000);
    expect(result.category).toBe("Ibadah dan sedekah");
  });
});
