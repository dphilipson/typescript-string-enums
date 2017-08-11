# TypeScript String Enums

Typesafe string enums in TypeScript pre-2.4.

[![Build
Status](https://travis-ci.org/dphilipson/typescript-string-enums.svg?branch=master)](https://travis-ci.org/dphilipson/typescript-string-enums)

**As of TypeScript 2.4, this library is made mostly obsolete by native string
enums** (see the
[announcement](https://blogs.msdn.microsoft.com/typescript/2017/06/27/announcing-typescript-2-4/)).
I recommend that most users who are on at least TypeScript 2.4 now use native
enums instead. There are still a few minor reasons to continue to use this
library, as discussed in the [Advantages over native string
enums](#advantages-over-native-string-enums) section.

## Table of Contents

* [Installation](#installation)
* [Usage](#usage)
  - [Creating and using enums](#creating-and-using-enums)
  - [Additional functions](#additional-functions)
    - [Enum.isType(enum, value)](#enumistypeenum-value)
    - [Enum.keys(enum)](#enumkeysenum)
    - [Enum.values(enum)](#enumvaluesenum)
    - [Enum.ofKeys(object)](#enumofkeysobject)
* [Motivation](#motivation)
  - [Why not built-in enums?](#why-not-built-in-enums)
  - [Why not string literals?](#why-not-string-literals)
* [How It Works](#how-it-works)
* [Advantages over native string enums](#advantages-over-native-string-enums)
* [Acknowledgements](#acknowledgements)

## Installation

```
npm install --save typescript-string-enums
```

This library requires TypeScript 2.2 or later. If you require TypeScript 2.1
compatibility, version 0.2.0 of this library is the last one with support.

## Usage

### Creating and using enums

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

type State = RunningState | StoppedState;

interface RunningState {
    status: typeof Status.RUNNING;
    pid: number;
}

interface StoppedState {
    status: typeof Status.STOPPED;
    shutdownTime: Date;
}

function saySomethingAboutState(state: State) {
    // The following typechecks.
    if (state.status === Status.RUNNING) {
        console.log("The pid is " + state.pid);
    } else if (state.status === Status.STOPPED) {
        console.log("The shutdown time is " + state.shutdownTime);
    }
}
```

Instead of a list of values, an object may be passed instead if it is desired
that the string values be different from the constant names. This also has the
advantage of allowing JSDoc comments to be specified on individual values. For
example:

``` javascript
export const Status = Enum({
    /**
     * Hovering over Status.RUNNING in an IDE will show this comment.
     */
    RUNNING: "running",
    STOPPED: "stopped",
});
export type Status = Enum<typeof Status>;

console.log(Status.RUNNING); // -> "running"
```

### Additional functions

#### `Enum.isType(enum, value)`

`Enum.isType` checks if a value is of a given enum type and can be used as a
type guard. For example:

``` javascript
const Color = Enum("BLACK", "WHITE");
type Color = Enum<typeof Color>;

let selectedColor: Color;
const colorString = getUserInputString(); // Unsanitized string.

// TypeScript error: Type 'string' is not assignable to type '"BLACK" | "WHITE"'.
selectedColor = colorString;

if (Enum.isType(Color, colorString)) {
    // No error this time because within type guard.
    selectedColor = colorString;
} else {
    throw new Error(`${colorString} is not a valid color`);
}
```

#### `Enum.keys(enum)`

Resembles `Object.keys()`, but provides strict typing in its return type.

#### `Enum.values(enum)`

Resembles `Object.values()`, but provides strict typing in its return type.

Example of both `Enum.keys()` and `Enum.values()`:

``` javascript
const FileType = Enum({
    PDF: "application/pdf",
    Text: "text/plain",
    JPEG: "image/jpeg",
});
type FileType = Enum<typeof FileType>;

const keys = Enum.keys(FileType);
// Inferred type: ("PDF" | "Text" | "JPEG")[]
// Return value: ["PDF", "Text", "JPEG"] (not necessarily in that order)

const values = Enum.values(FileType);
// Inferred type: ("application/pdf" | "text/plain" | "image/jpeg")[]
// Return value: ["application/pdf", "text/plain", "image/jpeg"] (not necessarily in that order)
```

#### Enum.ofKeys(object)

Creates a new enum with the same keys as the provided enum or object and whose
values are equal to its keys. This is most useful if for some reason it is
necessary to do string comparisons against the keys of an enum rather than the
values. For example:

``` javascript
const ErrorColor = Enum({ OK: "green", ERROR: "red" });
type ErrorColor = Enum<typeof ErrorColor>;

const ErrorLevel = Enum.ofKeys(ErrorColor);

const errorLevel = getErrorLevel();

if (errorLevel === ErrorLevel.ERROR) {
    ...
}
```

## Motivation

Enums are useful for cleanly specifying a type that can take one of a few
specific values. TypeScript users typically implement enums in one of two ways:
built-in [TypeScript
enums](https://www.typescriptlang.org/docs/handbook/enums.html) or string
literals, but each of these has drawbacks.

### Why not built-in enums?

Built-in enums have one big drawback. Their runtime value is a number, which is
annoying during development and makes them unsuitable for use with external
APIs.

``` javascript
enum Status {
    RUNNING, STOPPED
}

const state = { status: Status.RUNNING, pid: 12345 };
console.log(state);
// -> { status: 0, pid: 12345 }. What status was that again?
// I hope you're not expecting other services to send you objects that look like this.
```

### Why not string literals?

String literals make refactoring difficult. Suppose I have two enums:

``` javascript
type Status = "RUNNING" | "STOPPED";
type TriathlonStage = "SWIMMING" | "CYCLING" | "RUNNING";
```

Then if at a later stage I want to change `Status` to be `"STARTED" |
"STOPPED"`, there's no easy way to do it. I can't globally find/replace
`"RUNNING"` to `"STARTED"` because it will also change the unrelated string
constants representing `TriathlonStage`. Instead, I have to examine every
occurrance of the string `"RUNNING"` to see if it needs to change. Besides,
these kinds of global non-semantic substitutions should make you nervous.

Another disadvantage of string literals comes when using IDE autocomplete
features. It's convenient to be able to type `Status.` and have autocomplete
suggest `Status.RUNNING` and `Status.STOPPED`, but with string literals no such
suggestion is possible.

I might try to solve both problems by introducing constants for the string
literals, but this has issues as well:

``` javascript
// Typo on "STOPPED" not caught by anything below without additional boilerplate.
type Status = "RUNNING" | "STPOPED";

// Naive attempts to define constants for these don't work, as shown below.
const StatusNaive = {
    RUNNING: "RUNNING",
    STOPPED: "STOPPED",
};

// Type error even though it shouldn't be, because StatusNaive.RUNNING has type
// string which is not assignable to Status.
const status: Status = StatusNaive.RUNNING;

// Correctly defining constants is annoyingly repetitive. I shouldn't need to
// write each value three times.
const Status = {
    RUNNING: "RUNNING" as "RUNNING",
    STOPPED: "STOPPED" as "STOPPED",
};
```

This library is effectively a programmatic version of these repetitive
definitions. It attempts to provide the best of both worlds: string enums with
the convenience of built-in enums.

## How It Works

This section is not necessary to use this library, but for those curious about
how it is implemented, read on. The explanation uses the concepts of index types
and mapped types, as described in TypeScript's [Advanced
Types](https://www.typescriptlang.org/docs/handbook/advanced-types.html) page.

The relevant type declarations are as follows:

``` javascript
function Enum<V extends string>(...values: V[]): { [K in V]: K };
function Enum<
    T extends { [_: string]: V },
    V extends string
>(definition: T): T;

...

type Enum<T> = T[keyof T];
```

We are creating a overloaded function named `Enum` and a type named `Enum`, so
both can be imported with a single symbol.

Consider the first overload, which handles the case of variadic arguments
representing the enum values. In TypeScript, a string constant is a type (for
example, in `const foo = "Hello"`, the variable `foo` is assigned type
`"Hello"`). This means that the array

``` javascript
["RUNNING", "STOPPED"]
```

can be inferred to have type `("RUNNING" | "STOPPED")[]`, and so when it is
passed into a function with the above type signature, the type parameter `V` is
thus inferred to be `"RUNNING" | "STOPPED"`. Then the return type `{ [K in V]: K
}` is a mapped type which describes an object whose keys are the types that make
up `V` and for each such key has a value of the same type as that key. Hence,
the type of `Enum("RUNNING", "STOPPED")` is

``` javascript
// This is a type, not an object literal.
{
    RUNNING: "RUNNING";
    STOPPED: "STOPPED";
}
```

Next, consider the second overload, which handles the case which takes an object
of keys and values, and for the sake of example consider

``` javascript
const Status = Enum({
    RUNNING: "running",
    STOPPED: "stopped",
});
```
The second type parameter `V` is inferred as `"running" | "stopped"`, which
forces TypeScript to infer the first type parameter `T` as an object whose
values are the specific string values that make up `V`. Hence, even though `{
RUNNING: "running", "STOPPED": "stopped" }` would have type `{ RUNNING: string;
STOPPED: string; }`, passing it through `Enum` causes its type to be inferred
instead as the desired

``` javascript
// Type, not object literal.
{
    RUNNING: "running";
    STOPPED: "stopped";
}
```

Next, consider the definition

``` javascript
type Enum<T> = T[keyof T];
```

This is an index type which describes, for a given keyed type `T`, the type
obtained by indexing into `T` with an arbitrary one of its keys (the syntax
`T[keyof T]` is meant to evoke the expression `t[key]` for some `key` in `t`).
When passing in an arbitrary key to the object from the previous step, we get a
value which might be any one of the object's values, and so its type is thus the
union of the types of the object's values. Hence, `Enum<typeof Enum("RUNNING",
"STOPPED")>` evaluates to `"RUNNING" | "STOPPED"`, which is what we want.

## Advantages over native string enums

With the addition of native string enums in TypeScript 2.4, this library will be
unnecessary for most users. There are still a few niche reasons why users may
still prefer to use this library.

* This library provides several helper functions which cannot easy be
  implemented for native enums. Of these, [`Enum.isType()`](#enumistypeenum-value) will likely be the
  most useful.
* Defining a native string enum involves a bit of repetition, as each value must
  be written twice:
  ```ts
  enum Color {
      RED = "RED",
      GREEN = "GREEN",
      BLUE = "BLUE"
  }
  ```
  vs
  ```ts
  const Color = Enum("RED", "GREEN", "BLUE");
  type Color = Enum<typeof Color>;
  ```
  If there are many values, it may be desirable to avoid the repetition and
  corresponding possibility for typos.

## Acknowledgements

This libary is heavily inspired by posts in [this
thread](https://github.com/Microsoft/TypeScript/issues/3192). In particular,
credit goes to users **[@igrayson](https://github.com/igrayson)**,
**[@nahuel](https://github.com/nahuel)**, and
**[@kourge](https://github.com/kourge)**.

Copyright © 2017 David Philipson
