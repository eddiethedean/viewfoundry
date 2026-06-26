# Cursor Prompt: Build LessonKit Adapter Proof of Concept

Build a proof-of-concept LessonKit adapter for ViewFoundry.

Read:

- `docs/LESSONKIT_MIGRATION.md`

Create an example or package that demonstrates how LessonKit Studio could consume ViewFoundry.

Implement:

- LessonKit block component definitions
- adapter from LessonKit page/block JSON to ViewFoundry document
- adapter from ViewFoundry document back to LessonKit page/block JSON
- a small example lesson editor

Do not move LessonKit-specific concepts into ViewFoundry core.

Acceptance criteria:

- LessonKit-style blocks can be visually edited through ViewFoundry
- conversion functions are tested
- generic ViewFoundry packages remain LessonKit-agnostic
