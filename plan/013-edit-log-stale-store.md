# Plan: Edit log keeps previous item in store

## Problem

After several adds/edits, adding or updating a log could open a previous log with mixed values. Cause: leftover Redux `editMealItem` + `ItemDetails` preferring it over `searchedItem`, plus in-place mutation of shared list log objects.

## Fix (shipped)

1. Clear `editMealItem` when starting/closing add flows (ItemSearch, FavoriteItems, BarcodeScanner, EditMeal).
2. Clear `editMealItem` after successful **add**.
3. Do **not** rewrite `editMealItem` after edit save (`setEditMealItem(newLog)` broke post-edit UI) — dialog close still clears via `closeEdit`.
4. `LoggedList.onItemClick` copies the log before enriching (no in-place mutation of list entries).
5. Keep `ItemDetails.scss` header grid change: `grid-template-rows: 1fr auto`.

## Verified

User confirmed add/edit cycles are more stable after the clear + copy changes.
