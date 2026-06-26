# LessonKit Studio Migration Plan

## Goal

LessonKit Studio should become a specialized application built on top of ViewFoundry instead of owning the reusable visual editor engine directly.

## Current conceptual split

LessonKit Studio owns:

- course/lesson/page/block domain model
- learning-specific components
- LXPack export
- SCORM/xAPI/cmi5 concerns
- learning templates
- AI course generation
- publishing workflow

ViewFoundry should own:

- component registry
- visual canvas
- property inspector
- document tree editing
- undo/redo
- drag/drop
- generic codegen
- generic serialization

## Migration strategy

### Step 1: Keep LessonKit Studio working

Do not rewrite LessonKit Studio immediately. Build ViewFoundry independently first.

### Step 2: Register LessonKit components

Create a LessonKit adapter package or module that maps LessonKit blocks to ViewFoundry component definitions.

Example:

```ts
export const LessonTitleBlock = defineComponent(TitleBlock, {
  type: 'lessonkit.title',
  label: 'Title',
  category: 'LessonKit',
  props: {
    text: text({ label: 'Title Text' }),
    level: select({ label: 'Level', options: ['h1', 'h2', 'h3'] }),
  },
});
```

### Step 3: Build adapter functions

Create functions:

```ts
lessonKitToViewDocument(coursePage): ViewDocument
viewDocumentToLessonKit(document): LessonKitPage
```

### Step 4: Replace editor internals incrementally

Start by replacing only one editing surface with ViewFoundry. Keep LessonKit-specific panels and export logic.

### Step 5: Move shared editor capabilities out

As each generic editor feature is proven, move it into ViewFoundry.

## Rule

Do not let LessonKit-specific concepts leak into ViewFoundry core. Use adapters.
