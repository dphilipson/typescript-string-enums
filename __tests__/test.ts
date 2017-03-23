import { Enum } from "../src/index";

describe("Enum", () => {
    it("returns an object with values equal to keys given multiple strings", () => {
        expect(Enum("BLACK", "WHITE")).toEqual({ BLACK: "BLACK", WHITE: "WHITE" });
    });

    it("returns an object with values equal to keys given a single string", () => {
        expect(Enum("BLACK")).toEqual({ BLACK: "BLACK" });
    });

    it("returns the original object given an object", () => {
        expect(Enum({
            BLACK: "black",
            WHITE: "white",
        })).toEqual({ BLACK: "black", WHITE: "white" });
    });
});

describe("Enum.keys", () => {
    it("returns the keys of an enum object", () => {
        const e = Enum({
            BLACK: "black",
            WHITE: "white",
        });
        expect(Enum.keys(e)).toEqual(expect.arrayContaining([ "WHITE", "BLACK" ]));
    });
};

describe("Enum.values", () => {
    it("returns the values of an enum object", () => {
        const e = Enum({
            BLACK: "black",
            WHITE: "white",
        });
        expect(Enum.values(e)).toEqual(expect.arrayContaining([ "white", "black" ]));
    });
});
