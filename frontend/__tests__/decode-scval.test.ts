// Tests for the decodeScVal helper (#309 / FE-TEST-39).
//
// decodeScVal is a thin generic wrapper around `scValToNative` from
// `@stellar/stellar-sdk`. The tests check three things:
//
//   1. Common ScVal shapes (u32, string, address, vec, struct/map)
//      decode to the values the frontend actually uses downstream.
//   2. The generic type parameter narrows the return type — important
//      because some call sites cast through it.
//   3. Invalid / unexpected inputs surface SDK behaviour deterministically
//      (the helper does not swallow errors).

import { describe, it, expect } from "vitest";
import { xdr, Address } from "@stellar/stellar-sdk";

import { decodeScVal } from "../lib/stellar";

describe("decodeScVal (#309)", () => {
  it("decodes a u32 ScVal to the same JavaScript number", () => {
    const scv = xdr.ScVal.scvU32(42);
    expect(decodeScVal<number>(scv)).toBe(42);
  });

  it("decodes a string ScVal to the same string", () => {
    const scv = xdr.ScVal.scvString("hello world");
    expect(decodeScVal<string>(scv)).toBe("hello world");
  });

  it("decodes a bool ScVal to the same boolean", () => {
    expect(decodeScVal<boolean>(xdr.ScVal.scvBool(true))).toBe(true);
    expect(decodeScVal<boolean>(xdr.ScVal.scvBool(false))).toBe(false);
  });

  it("decodes a void / null ScVal to null", () => {
    const scv = xdr.ScVal.scvVoid();
    expect(decodeScVal(scv)).toBeNull();
  });

  it("decodes an i128 ScVal to a bigint", () => {
    // 2**63 fits in a single hi word.
    const scv = xdr.ScVal.scvI128(
      new xdr.Int128Parts({
        hi: new xdr.Int64(0),
        lo: new xdr.Uint64(BigInt(1_234_567)),
      }),
    );
    expect(decodeScVal<bigint>(scv)).toBe(1_234_567n);
  });

  it("decodes an address ScVal to a Stellar G... address string", () => {
    const pub = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";
    const scv = new Address(pub).toScVal();
    expect(decodeScVal<string>(scv)).toBe(pub);
  });

  it("decodes a contract-id ScVal to a C... address string", () => {
    const contractId = "CA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUWDA";
    const scv = new Address(contractId).toScVal();
    expect(decodeScVal<string>(scv)).toBe(contractId);
  });

  it("decodes a vec of mixed scalars to a JS array preserving order", () => {
    const scv = xdr.ScVal.scvVec([
      xdr.ScVal.scvU32(1),
      xdr.ScVal.scvU32(2),
      xdr.ScVal.scvU32(3),
    ]);
    expect(decodeScVal<number[]>(scv)).toEqual([1, 2, 3]);
  });

  it("decodes a map (struct-like) ScVal to a plain JS object", () => {
    // Map { "key": "value", "count": 7 }
    const map = xdr.ScVal.scvMap([
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvString("key"),
        val: xdr.ScVal.scvString("value"),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvString("count"),
        val: xdr.ScVal.scvU32(7),
      }),
    ]);
    expect(decodeScVal<{ key: string; count: number }>(map)).toEqual({
      key: "value",
      count: 7,
    });
  });

  it("preserves the generic type parameter at compile time and value at runtime", () => {
    interface Job {
      id: number;
      title: string;
    }
    const scv = xdr.ScVal.scvMap([
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvString("id"),
        val: xdr.ScVal.scvU32(99),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvString("title"),
        val: xdr.ScVal.scvString("Build something"),
      }),
    ]);
    const job = decodeScVal<Job>(scv);
    // `job.id` and `job.title` are typed at compile time; we only assert
    // the runtime values here, but the cast guards the consumer side.
    expect(job).toEqual({ id: 99, title: "Build something" });
  });

  it("propagates the underlying SDK error when given a non-ScVal input", () => {
    // Passing something that isn't an ScVal must not silently produce
    // garbage — the helper has no try/catch, so the SDK's error
    // surfaces through. Documenting the behaviour pins it in place.
    expect(() => decodeScVal(undefined as unknown as xdr.ScVal)).toThrow();
    expect(() => decodeScVal({} as unknown as xdr.ScVal)).toThrow();
  });
});
