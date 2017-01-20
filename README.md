# TypeScript String Enums

Typesafe string enums in TypeScript.

[![Build Status](https://travis-ci.org/dphilipson/typescript-string-enums.svg?branch=master)](https://travis-ci.org/dphilipson/typescript-string-enums)

## Installation

```
npm install --save typescript-string-enums
```

## Usage

Define an enum as follows:
``` javascript
// Status.ts
import { Enum } from "typescript-string-enums";

export const Status = Enum("RUNNING", "STOPPED");
export type Status = Enum<typeof Status>;
```
Use it elsewhere:
``` javascript
import { Status } from "./Status";

console.log(Status.RUNNING); // -> "RUNNING";

// Works fine.
const goodStatus: Status = Status.RUNNING;

 // TypeScript error: Type '"hello"' is not assignable to type '"RUNNING" | "STOPPED"'
const badStatus: Status = "hello";

// Enum can be used for discriminated unions:

interface RunningState {
    status: typeof Status.RUNNING;
    pid: number;
}

interface StoppedState {
    status: typeof Status.STOPPED;
    shutdownTime: Date;
}

type State = RunningState | StoppedState;

function saySomethingAboutState(state: State) {
    // The following typechecks.
    if (state.status === Status.RUNNING) {
        console.log("The pid is " + state.pid);
    } else if (state.status === Status.STOPPED) {
        console.log("The shutdown time is " + state.shutdownTime);
    }
}
```

## Motivation

Standard TypeScript enums are quite useful because they cleanly specify a type that can take one of
finitely many values, and can be used as the discriminant in discriminated unions. For example:
``` javascript
enum Status {
    RUNNING, STOPPED
}

interface RunningState {
    status: Status.RUNNING;
    pid: number;
}

interface StoppedState {
    status: Status.STOPPED;
    shutdownTime: Date;
}

function saySomethingAboutState(state: State) {
    // The following typechecks.
    if (state.status === RunningState.RUNNING) {
        console.log("The pid is " + state.pid);
    } else if (state.status === Status.STOPPED) {
        console.log("The shutdown time is " + state.shutdownTime);
    }
}
```
However, such enums have one big drawback. Their runtime value is a number, which is annoying for
development and prevents them from being used pleasantly with external APIs:
``` javascript
const state: RunningState = { status: Status.RUNNING, pid: 12345 };
console.log(state); // -> { status: 0, pid: 12345 }. What status is that again?
```
Developers might attempt to use a union of string literals instead, but this has drawbacks as well:
``` javascript
type Status = "RUNNING" | "STOPPED";

// Naive attempts to define constants for these don't work.
const StatusNaive = {
    RUNNING: "RUNNING",
    STOPPED: "STOPPED",
};

// Type error even though it shouldn't be, because StatusNaive.RUNNING has type
// string which is not assignable to Status.
const status: Status = StatusNaive.RUNNING;

// Correctly defining constants is annoyingly repetitive.
const Status = {
    RUNNING: "RUNNING" as "RUNNING",
    STOPPED: "STOPPED" as "STOPPED",
};
```
This library provides the convenience of built-in enums, but with string values intead of integers.

## How it Works

This section is not necessary to use this library, but for those curious about how it is implemented, read on.

The entire source of this library is
``` javascript
export function Enum<V extends string>(...values: V[]): { [K in V]: K } {
    const result: any = {};
    values.forEach((value) => result[value] = value);
    return result;
}

export type Enum<T> = T[keyof T];
```
We are creating a function named `Enum` and a type named `Enum`, so both can be imported with a single symbol.

The type signature
``` javascript
function Enum<V extends string>(...values: V[]): { [K in V]: K } {
```
can be read as follows: take in an array of strings and call the different types `V`. A string
constant is a type in TypeScript (for example, `const foo = "hello"` assigns the type `"hello"`
to `foo`), so `V` is actually multiple string literal types. Then `{ [K in V]: K }` describes an
object whose keys are the types that make up `V` and for each such key has a value equal to that
key. Hence, the type of `Enum("RUNNING", "STOPPED")` is
``` javascript
// This is a type, not an object literal.
{
    RUNNING: "RUNNING";
    STOPPED: "STOPPED";
}
```
Next, consider the definition
``` javascript
type Enum<T> = T[keyof T];
```
This describes, for a given keyed type `T`, the type obtained by taking the values of `T` when
passing in each key (the syntax `T[keyof T]` is meant to evoke `t[key]` for each `key` in `t`). When
applied to the type from the previous step, we end up with the union of the types of the values,
hence `Enum<typeof Enum("RUNNING", "STOPPED")>` evaluates to `"RUNNING" | "STOPPED"`, which is what
we want.

Copyright © 2017 David Philipson
