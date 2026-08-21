# Part 2 — AbleSpace "Take Data" workflow

> **Status: draft.** The Caseload section below is written from the Caseload
> screenshot. The Take Data screen itself still needs to be walked through in
> the live product and written up in section 2 — do not submit until that is
> filled in and the screenshots are attached.

---

## 1. Entry point — the Caseload tab

The Caseload tab is the therapist's home base: one row per student on their
roster, with the information needed to decide who to work with next.

**Structure**

- Left rail groups navigation into **Capture** (Calendar, Caseload, Data,
  Accommodations, Service Time), **Track** (Report, Billing, Collaborators,
  History) and **Misc**. Data collection lives under "Capture", which matches
  the mental model — you capture in a session, you review afterwards.
- Three roster scopes sit above the table: **Students (15)**, **Groups (12)**,
  **Unassigned (39)**.
- The table carries Full Name, Last Name, IEP Due, Eval Due, Collaborators,
  Service Time and School, with an **Actions** column pinned at the right.
- Every row's action is a single **Take Data** button — the primary path from
  "here is my caseload" into "record a session".

**The workflow, as the UI presents it**

1. Therapist opens Caseload and scans the roster.
2. They locate a student — by eye, by the `⌘ + K` search, or by switching to
   the Groups / Unassigned scope.
3. They press **Take Data** on that student's row, which opens the data
   collection screen for that student's goals.
4. Data recorded there flows into the Data / Report sections for progress
   tracking and into Billing for service minutes.

## 2. The Take Data screen

<!-- TO BE COMPLETED FROM THE LIVE PRODUCT.

     Walk the screen and cover:
     - What is shown on open (goals? objectives? trial counters? timer?)
     - How a trial / score is recorded, and what the input affordances are
     - How multiple goals or a group session are handled
     - Whether notes, prompts or accuracy levels are captured
     - How a session is saved, and where the data surfaces afterwards
     - What happens on an interrupted or abandoned session

     Attach a screenshot per step. -->

---

## 3. UX / UI observations

These are drawn from the Caseload screen as pictured.

### 3.1 Overdue dates are invisible

`IEP Due` and `Eval Due` are rendered in identical plain text whether the date
is `11/06/2024` or `03/25/2020`. Several rows show due dates years in the past.
An overdue IEP is arguably the highest-stakes fact on this screen, and it
currently carries no visual weight at all.

**Suggestion:** colour and icon overdue dates, and add a relative hint
("3 days left", "overdue by 2 months"). Consider a default sort or filter for
"due soonest".

### 3.2 Date format is ambiguous

`11/06/2024` could be 11 June or 6 November. Mixed `MM/DD/YYYY` and what looks
like `DD/MM/YYYY` across rows makes it worse for a product used across regions.

**Suggestion:** use an unambiguous format (`06 Nov 2024`), or localise
explicitly and stay consistent.

### 3.3 Empty states are inconsistent

`Eval Due` shows `-` when unset, but `Service Time` shows `0`. A literal `0`
reads as "zero minutes of service", which is a real and different claim from
"not configured yet".

**Suggestion:** one convention for "no value" — an em dash in muted grey — and
reserve `0` for genuine zeroes.

### 3.4 Service Time truncates mid-word

`OT - 30mins/Wk, Spe` is cut off with no ellipsis and no tooltip, so the reader
cannot tell that content is missing or what it said.

**Suggestion:** ellipsis with a hover/tap tooltip showing the full value, or
wrap the services as small chips.

### 3.5 A column of identical primary buttons

Fifteen filled **Take Data** buttons stack into a solid vertical band that
out-weighs the actual page CTA, **Add Student**. Repeating a primary style down
every row spends the user's attention without directing it.

**Suggestion:** make the row action lower-emphasis (text or outline button, or
reveal on row hover) and let the row itself be clickable. Keep exactly one
filled primary per screen.

### 3.6 Collaborators cannot be identified

Avatars collapse to `+1`, `+3`, `+4` with no tooltip, so finding "which students
does this SLP co-treat?" means opening rows one by one.

**Suggestion:** tooltip with names on hover, and a filter by collaborator.

### 3.7 Roster scopes do not look interactive

`Students (15) · Groups (12) · Unassigned (39)` are separated by middots and
styled as body text, so they read as a summary line rather than as controls.
**Unassigned (39)** being the largest number is also a signal worth surfacing —
that is more than twice the active roster.

**Suggestion:** render these as real tabs or segmented control, and give
Unassigned a nudge toward resolution.

### 3.8 Bulk selection with no bulk action

Each row has a checkbox and there is a header select-all, but no visible action
appears for a selection.

**Suggestion:** show a contextual action bar on selection (assign to group,
set service time, export), or drop the checkboxes if no bulk action exists.

### 3.9 Search scope is unstated

`⌘ + K` is a good touch, but "Search students…" does not say whether it matches
school, collaborator or IEP date as well as name.

**Suggestion:** name the searchable fields in the placeholder, or offer scoped
filter chips.

---

## 4. Functionality ideas

- **Take Data from anywhere.** Surface it in the Calendar on a scheduled
  session, so the therapist starts from their agenda rather than the roster.
- **Resume in-progress session.** If sessions can be interrupted, show a
  "resume" state on the row.
- **Last-session-at column.** "Last data taken" would answer "who am I behind
  on?" faster than any current column.
- **Saved views.** Persist a filter such as "IEP due in 30 days" as a named view.
