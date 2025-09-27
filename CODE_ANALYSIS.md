**Code Analysis**

-   Scope: baldrick-broth (TypeScript, Node.js CLI)
-   Runtime: Node.js ≥ 22 (works with listr2 v9 which requires ≥ 20)

**Feature Overview**

-   YAML-driven CLI
    -   Reads a `baldrick-broth.yaml` model and generates a `commander` CLI.
    -   Workflows → tasks with optional `before`/`main`/`after` steps.
    -   Parameterized tasks with flags/options.

-   Task execution (Listr2 v9)
    -   Renders interactive task lists; continues on errors when configured.
    -   Enquirer prompt integration via `@listr2/prompt-adapter-enquirer`.
    -   Telemetry logging (CSV) for task timing and refs; replay file logs to
        console.

-   Command types
    -   `shell`: Executes shell commands via `execa`, with optional stdin.
    -   Built-ins (non-shell): `get-property`, `not`, `some/every
        truthy|falsy`,
        `split-string`, `split-lines`, `range`, `concat-array`, `mask-object`, `template`.
    -   File I/O helpers: `append-to-file`, `write-to-file` for variable
        outputs.

-   Output parsing and templating
    -   Parses JSON / YAML / CSV outputs into runtime data.
    -   Handlebars templating with per-task memory scoping and a helper to
        escape spaces.
    -   Template context merges runtime data for the current task and root.

-   Data model and validation
    -   Zod-based model (`build-model.ts`) with detailed error formatting.
    -   String validators for titles, URLs, paths, prop paths, prompt fields.

-   Utilities
    -   Data value helpers with namespacing and root fallback.
    -   String utils for slugging titles and array shape checks.
    -   Colorized output for titles, steps, warnings.

**Execution Flow (High Level)**

-   Load and validate `baldrick-broth.yaml` → build `commander` commands.
-   For a task invocation:
    -   Expand batch steps (`before`/`main`/`after`) into command-line inputs.
    -   Start a `Listr` with configured options and run step tasks
        sequentially.
    -   Each command: template → run shell or built-in → parse/save result →
        log/telemetry.

**Key Modules**

-   `build-model.ts`: Zod schemas and safe parsing for the configuration
    model.
-   `commands-creator.ts`: Maps model to CLI commands.
-   `create-task-action.ts`: Listr2 integration, prompts, telemetry, task
    orchestration.
-   `execution.ts`: Shell/built-in execution, output parsing, file I/O.
-   `templating.ts`: Handlebars helpers and context assembly with memory
    scoping.
-   `expand-batch.ts`: Loop expansion (`each`) and templated naming of
    commands.
-   `data-value-utils.ts`: Namespaced runtime data, getters/setters,
    truthy/falsy.
-   `format-message.ts`: Zod issue → readable ValidationError.
-   `logging.ts`: Log capture to files and telemetry CSV; console replay.

**Assumptions and Constraints**

-   Node.js ≥ 22 (engines), though listr2 v9 requires only ≥ 20.
-   External tools (Biome, gh, typedoc, pest) are installed when used in
    workflows.
-   CLI runs in ESM mode and uses `tsx` for tests.

**Porting to Go (High-Level Plan)**

-   CLI and command framework
    -   Replace `commander` with a Go CLI framework (e.g., `spf13/cobra`).
    -   Map workflows/tasks to Cobra commands/subcommands with flags.

-   Model and validation
    -   Replace Zod with Go structs + validation (e.g.,
        `go-playground/validator`).
    -   Use `gopkg.in/yaml.v3` to parse `baldrick-broth.yaml` into typed
        structs.
    -   Recreate error formatting similar to `format-message.ts` for
        user-friendly output.

-   Execution engine
    -   Shell: use `os/exec` with `context.Context` for timeouts/cancellation.
    -   Output parsing: `encoding/json`, `gopkg.in/yaml.v3`, `encoding/csv`.
    -   File I/O: `os` / `io` for append/write helpers.

-   Templating
    -   Replace Handlebars with Go templates (`text/template` or `sprig`
        functions).
    -   Implement memory-scoped data merging and helper equivalents (e.g.,
        `escapeSpace`).

-   Task runner and prompts
    -   Listr2-style renderer: implement a simple task orchestration and
        renderer or use a TUI lib (e.g., `charmbracelet/bubbletea`) for
        interactive progress.
    -   Prompts: use `AlecAivazis/survey` for input/select/confirm/password
        dialogs.

-   Utilities
    -   Color output: `github.com/fatih/color` for styling.
    -   Logging: `rs/zerolog` or `sirupsen/logrus` with file appenders; CSV via
        `encoding/csv`.
    -   Data access: Implement a `dot-prop`-like accessor for nested paths.

-   Feature parity checklist
    -   [ ] YAML schema parity (workflows, tasks, commands, engine)
    -   [ ] Shell exec + stdin + exit handling
    -   [ ] JSON/YAML/CSV parsing and variable saving
    -   [ ] Template expansion and memory scoping
    -   [ ] Batch expansion (`each`) and templated command names
    -   [ ] Prompts with adapters (input/password/confirm/select)
    -   [ ] Telemetry CSV + log replay
    -   [ ] Colorized output and structured errors

This plan preserves the architecture: parse → validate → map to commands →
expand → execute → collect → render/log, using Go-native libraries and
equivalents for a smooth migration path.
