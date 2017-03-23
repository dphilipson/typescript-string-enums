import { Enum } from "../src/index";

describe("Enum", () => {
    it("returns an object with values equal to keys given multiple strings", () => {
        expect(Enum("BLACK", "WHITE")).toEqual({ BLACK: "BLACK", WHITE: "WHITE" });
    });

    it("returns an object with values equal to keys given a single string", () => {
        expect(Enum("BLACK")).toEqual({ BLACK: "BLACK" });
    });
});
