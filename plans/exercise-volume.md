# Plan: Exercise view-by volume

> Source PRD: `plans/prd-exercise-volume.md`

## Architectural decisions

- **Routes**: none. Exercise details only.
- **Key models**: View by keys `weight` | `reps` | `volume`. Best set = max main, secondary as tiebreaker. Volume = session `Σ(weight × reps)`.
- **Services / store**: no API or Redux. Pure helpers next to the set domain. Chart still uses existing range query + `prepareSeries`.
- **Libraries**: existing CustomSelect + LineChart. No new packages.

The user asked to implement immediately after PRD approval; phases below are one demoable slice.

---

## Phase 1: Paired best set + volume

**User stories**: 1–15 (must-have)

### What to build

Open an exercise: table top weight/reps come from one set based on View by. Chart uses the same pick. Volume option plots session total and readout `1300 kg`. Weight/reps readout shows the paired second value. Columns stay fixed. Expanded rows unchanged.

### Acceptance criteria

- [ ] `100×5` and `80×10` → Weight/Volume table `100 / 5`; Reps table `80 / 10`
- [ ] Volume chart point is session total with readout `{n} kg` only
- [ ] Weight/reps readout is `100 kg · 5 reps` / `10 reps · 80 kg`
- [ ] View by keys are stable (not translated strings)
- [ ] Hebrew Volume label
- [ ] Weight chart elsewhere unchanged
