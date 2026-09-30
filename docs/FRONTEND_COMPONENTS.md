# Frontend components

| Folder | Component | Role |
|--------|-----------|------|
| `ui/` | `Modal` | Accessible dialog: focus trap, Escape, focus restore. Used by every modal. |
| | `TextField`, `PasswordField`, `ThemeToggle`, `Logo` | Form fields and chrome |
| `controls/` | `StylePicker` | Listbox of modes, your workflows and starters |
| | `ToneSliders` | Length (shorter/same/longer) and tone (casual/neutral/formal) |
| | `PreviewToggle` | Output view: Clean or Changes |
| `diff/` | `SideBySideDiff` | Word diff, `layout="inline"` or `"split"` |
| | `ExportControls` | Export button plus dialog, controlled or uncontrolled |
| `stats/` | `StatsBar` | Before → after readability numbers |
| | `MeaningCheckPanel` | Missing/new details as chips |
| `export/` | `ExportModal`, `ExportStyleOptions` | Format, file name, include original |
| `templates/` | `TemplateLibrary` | Starter and saved workflow cards with actions |
| | `TemplateEditorModal` | Name, description, steps and custom instruction |
| `canvas/` | `PipelineCanvas`, `NodeCard`, `ConnectionLines` | Ordered step chain with move/remove buttons and step parameters |
| `palette/` | `CommandPalette` | Filterable command list (combobox + listbox) |
| `history/` | `HistoryTimeline` | Groups history by day |
| | `SnapshotRestoreModal` | Split diff, readability and meaning check for one rewrite, plus export and restore |
| `batch/` | `BatchUploadModal`, `BatchDashboard`, `JobProgressCard` | File intake, batch summary, per-file status |

Hooks: `usePipelineRunner`, `useStyleChoices`, `useKeyboardShortcuts`.
