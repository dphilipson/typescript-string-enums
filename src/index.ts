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

export namespace Enum {
    export function keys<
        T extends { [_: string]: any }
    >(e: T): Array<keyof T> {
        return Object.keys(e) as Array<keyof T>;
    }

    export function values<
        T extends { [_: string]: any }
    >(e: T): Array<Enum<T>> {
        const result: Array<Enum<T>> = [];
        for (const key of keys(e)) {
            result.push(e[key as string]);
        }
        return result;
    }
}
