# ⚠️ 2022-01-22: deprecated. Strategies will be continued as individual npm modules. For more details visit: https://github.com/attestate/crawler
# `@attestate/crawler-strategies`

This repository is a submodule of `@attestate/crawler` and houses all
**E**tract, **T**ransform and **L**oad strategies as a separately
semantically-versioned package.

## usage

- Ideally, use this package directly through `@attestate/crawler`.
- If you want to run tests, do so via `npm run test` but note that a properly
  set up `.env` file is required.

## implementing new strategies

Checkout the [quickstart
guide](https://github.com/attestate/crawler-strategies/blob/main/docs/quickstart.md)
for a in-depth walkthrough.

### extractor strategy interface definition

An extractor strategy must implement the following interface:

```ts
interface Extractor {
  name: String;
  init(args...): Object<messages:  Message[], write: String>;
  update(message: Message): Object<messages: Message[], write: String>;
}
```

Where `Message` is defined as any JSON object compliant to the definitions in
[attestate/crawler-schema](https://github.com/attestate/crawler-schema).

### transformer strategy interface definition

A transformer strategy must implement the following interface:

```ts
interface Transformer {
  name: String;
  onLine(line: String): String | null | undefined;
  onError(error: Error): any;
  onClose(): String | null | undefined;
}
```

Where `Message` is defined as any JSON object compliant to the definitions in
[attestate/crawler-schema](https://github.com/attestate/crawler-schema).
