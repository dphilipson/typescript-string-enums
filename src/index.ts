export function Enum<V extends string>(...values: V[]): { [K in V]: K };
export function Enum<
    T extends { [_: string]: V },
    V extends string
>(definition: T): T;
export function Enum(...values: any[]): object {
    if (typeof values[0] === "string") {
        const result: any = {};
        for (const value of values) {
            result[value] = value;
        }
        return result;
    } else {
        return values[0];
    }
}

export type Enum<T extends object> = T[keyof T];
