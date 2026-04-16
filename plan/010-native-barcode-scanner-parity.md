# Plan: Native Barcode Scanner Parity

> Source PRD: Native Barcode Scanner Parity (approved in chat)

## Architectural decisions

Durable decisions that apply across all phases:

- **Platform routing**: Use `Capacitor.isNativePlatform()` to select scanner engine.
- **Scanner engines**: Native uses Capacitor barcode scanning; web keeps ZXing.
- **Shared scan pipeline**: Both engines emit normalized barcode text into one shared detection flow.
- **Supported formats parity**: Preserve current formats (`EAN_13`, `UPC_A`, `UPC_E`, `CODE_128`) across platforms.
- **Domain flow**: Barcode text -> `searchService.getProductById` -> `setItem` or try-again/error path -> existing ItemDetails flow.
- **Integration boundary**: Keep `BarcodeScanner` props/API unchanged for callers such as `EditMeal`.

---

## Phase 1: Native Scanner Foundation

**User stories**: 1, 2

### What to build

Introduce a platform-aware scanner abstraction that supports two engines (native + web), including permission/capability handling for native and normalized output for both.

### Acceptance criteria

- [ ] Native path uses Capacitor scanner engine.
- [ ] Web path preserves current ZXing behavior.
- [ ] Both paths emit the same normalized barcode value shape.
- [ ] Supported barcode formats remain aligned with existing functionality.

---

## Phase 2: Shared Scan Lifecycle Parity

**User stories**: 3, 4, 6

### What to build

Unify state transitions around detection lock, async lookup, no-result handling, retry, and failure behavior so native and web follow identical scanner lifecycle logic.

### Acceptance criteria

- [ ] First valid detection locks additional scans until reset.
- [ ] Lookup loading state is consistent between native and web.
- [ ] No-result consistently enters try-again flow on both platforms.
- [ ] Error and close behavior is equivalent across both scanner engines.
- [ ] Scanner resources are always stopped/cleaned on unmount and close.

---

## Phase 3: UI and Flow Parity in BarcodeScanner

**User stories**: 3, 4, 5

### What to build

Ensure native users receive the same UI behavior and continuation paths: scanner presentation, searching animation, try-again CTA, custom-log CTA, and ItemDetails transitions.

### Acceptance criteria

- [ ] Native scanner-state UI transitions match current web behavior.
- [ ] Custom Log continues to open ItemDetails flow exactly as today.
- [ ] Successful scan still opens barcode-scanned details flow.
- [ ] Existing parent flow (`EditMeal` -> `BarcodeScanner` -> `ItemDetails`) remains unchanged externally.

---

## Phase 4: Hardening, Testing, and Guardrails

**User stories**: 1, 2, 3, 4, 5, 6

### What to build

Add parity-focused tests and lightweight implementation notes to keep native and web behavior synchronized over time.

### Acceptance criteria

- [ ] Tests validate shared state transitions (idle, scanning, found, no-result, retry).
- [ ] Tests validate platform routing to native vs web scanner engine.
- [ ] Tests cover cleanup behavior and retry regression risk.
- [ ] Developer notes document parity expectations and non-goals.

---

## User stories

1. As a native user, I want to scan barcodes with the same reliability and speed as web users, so I can add items without manual search.
2. As a native user, I want the same supported barcode formats (EAN_13, UPC_A, UPC_E, CODE_128), so barcode acceptance is predictable across platforms.
3. As a user, I want one detection at a time with loading feedback, so duplicate scans do not create confusion.
4. As a user, I want the same no-result and try-again behavior, so failed scans are recoverable.
5. As a user, I want the same Custom Log and ItemDetails continuation flow, so I can continue meal logging regardless of scan outcome.
6. As a user, I want consistent error handling and close behavior, so scanner failures do not break the meal flow.

## Out of scope

- Redesigning scanner visuals beyond parity.
- Expanding barcode formats beyond current supported set.
- Changing backend lookup contracts or meal domain logic.
