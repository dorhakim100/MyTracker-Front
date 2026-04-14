# Duplicate Workout Plan

## Goal

Allow users to duplicate an existing workout so they can quickly create a new workout with the same structure and then customize it.

## Problem

Creating a workout from scratch is repetitive when users already have a similar plan. The new duplicate flow should reduce setup time while keeping data integrity and avoiding accidental edits to the source workout.

## Solution

Add a duplicate action that copies the selected workout into a new workout entity, preserving editable workout data (name, metadata, exercises, sets, ordering) while generating new identifiers where needed.

## Implementation Decisions

- **Entry point**: Add duplicate action from the existing workout actions menu
- **Data handling**: Deep-copy workout content and generate fresh IDs for duplicated entities
- **Navigation**: Redirect user to the duplicated workout editor/details view after success
- **Feedback**: Show success and failure notifications for duplicate operation
- **Scope**: Workout duplication only (no session/history duplication)

## Out of Scope

- Duplicating completed workout sessions/history
- Bulk duplication of multiple workouts at once
- Cross-user/shared-template duplication behavior changes

## Open Questions

- Should duplicated workout names get an automatic suffix (for example, "Copy")?
- Should we duplicate rest timers, notes, and tags exactly as-is?
- Should post-duplicate navigation open in edit mode or read mode?

## Validation Checklist

1. Duplicating a workout creates a new workout with independent IDs.
2. Changes to the duplicated workout do not affect the source workout.
3. Exercise/set order and values are preserved in the duplicated copy.
4. User sees a clear success toast and lands on the new workout.
5. Failure path shows an error message and keeps the source workout unchanged.
