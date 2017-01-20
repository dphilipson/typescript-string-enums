import { Enum } from "../src/index";

describe("Enum", () => {
    it("should return an object with values equal to keys", () => {
        expect(Enum("BLACK", "WHITE")).toEqual({ BLACK: "BLACK", WHITE: "WHITE" });
    });
});
