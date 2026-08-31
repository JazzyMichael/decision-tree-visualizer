<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Architectural Specification: Growth Trajectory Tree

This document outlines the technical stack, boundaries, and separation of concerns for the Growth Trajectory Tree application. All agents and developers must strictly adhere to these architectural boundaries. This application is a canvas-based decision tree visualizer using nodes to represent decisions and actionable steps for achieving a goal or representing general growth in some aspect of life. These trees start as high-level trajectory outlines for growth and progress, and can be expanded to show more specific decisions and steps.

### 1. Core Architecture Split

The application is split into two distinct layers: the **Base Application Engine** (Framework & Interface) and the **Visualizer Subsystem** (Graph, State, and Computation Engine).

### 2. Technology Stack Breakdown

#### Part A: The Base Application Engine

- **Language:** TypeScript (Strict Mode enabled).
- **Framework:** Next.js (App Router).
- **UI Library:** React.
- **Styling:** Tailwind CSS & Shadcn.
- **Responsibility:** Project framework, page routing, core layouts, accessibility (a11y), non-graph UI components (modals, settings panels, navigation, headers), and utility handlers.

#### Part B: The Visualizer Subsystem

- **Canvas Canvas:** `@xyflow/react` (React Flow).
- **Graph Layout Engine:** `elkjs` (Eclipse Layout Kernel for JavaScript).
- **Database Engine:** `dexie` & `dexie-react-hooks`.
- **Storage Medium:** Browser IndexedDB.
- **Responsibility:** Graph topology, structural parent-child relationships, directional dependency routing, calculating coordinate maps (`x, y`), edge rendering, custom canvas node styling, and tracking node state.

---

### 3. Data Flow & Separation of Concerns

To prevent "dual-source-of-truth" sync problems, developers must adhere to the following data flow design:

1. **Single Source of Truth:** `IndexedDB` (via Dexie) is the ultimate source of truth for all chart configurations and data. **Do not introduce Zustand, Redux, or Context API for graph nodes.** [1]
2. **UI Multi-Threading & Reactivity:** UI layers must consume database states utilizing Dexie’s `useLiveQuery` hook. Any modification to the database triggers an instantaneous, top-down reactive re-render of the canvas layout.
3. **The Layout Calculation Pipeline:**

   ```text

   [Dexie db.query] --> (Raw Relational Array) --> [ELK Engine Math] ─-> (Injected X/Y Coordinates) --> [React Flow Canvas Node Array]

   ```

   ```text

   ```

4. **Decoupled Node Mutators:** Individual Custom Nodes or control elements update state by issuing direct mutations to the Dexie DB instance. They must never pass callbacks up the React tree or dispatch events to a secondary state store.

---

### 4. Technical Constraints for Code Generators

- **Native Type Safety:** The `elkjs` library ships with built-in TypeScript declaration files. Do not look for or add external `@types/elkjs` packages to `package.json`.
- **No Hardcoded Coordinates:** Nodes stored in the database must only maintain relational bindings (`id`, `treeId`, `parentId`). Screen pixel values (`position: { x, y }`) must be computed completely dynamically by `elkjs` before printing to React Flow.
- **Web Worker Concurrency:** Because ELK computes layouts heavily, any script executing deep layout re-calculations on trees containing $>100$ nodes should orchestrate the process via ELK's asynchronous web worker configurations to prevent main thread blocking.
- **Component Boundary Isolation:** All code containing React Flow hooks (`useNodesState`, `useEdgesState`) or Dexie transaction locks must live strictly within isolating files located inside the `@/components/visualizer/` folder directory. Do not bleed visualization types into structural framework layout wrappers.
