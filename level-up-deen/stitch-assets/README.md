# Stitch Asset Import

Project ID: `13990767071446712286`
Project title: `QuestLife PRD`

The Stitch project was extracted through the observed Stitch `batchexecute` API calls.
Raw and parsed responses are saved locally so the import can be repeated or audited.

## Output

- `manifest.json` - normalized project/screen metadata and downloaded file paths.
- `get-project.raw.txt` / `get-project.parsed.json` - project response and design system data.
- `list-screens.raw.txt` / `list-screens.parsed.json` - screen response payload.
- `screens/*.html` - exported Stitch HTML for each screen.
- `screens/*.png` - downloaded rendered preview images when available.
- `../scripts/extract-stitch-assets.mjs` - repeatable extractor script.

## Requested Screens

| Screen | ID | Local files |
| --- | --- | --- |
| Daily Quests | `e67e543aa9bc4792a008eedf7b6d3c7a` | `screens/daily-quests-e67e543aa9bc4792a008eedf7b6d3c7a.html`, `.png` |
| Dashboard | `e003598045be4bb1b4848fa281a0f486` | `screens/dashboard-e003598045be4bb1b4848fa281a0f486.html`, `.png` |
| Finance & Planning | `6b91281906b64f349b9833777a6863c0` | `screens/finance-planning-6b91281906b64f349b9833777a6863c0.html`, `.png` |
| Deen Tracker | `8f62baf036cb4d8abce6f1dc53639ce1` | `screens/deen-tracker-8f62baf036cb4d8abce6f1dc53639ce1.html`, `.png` |
| Fitness Hub | `0d6b33f452ae48b091f1378d59cd7e14` | `screens/fitness-hub-0d6b33f452ae48b091f1378d59cd7e14.html`, `.png` |
| Hydration Tracker | `3a86f2a1742b4fad8d167a64057b5ddd` | `screens/hydration-tracker-3a86f2a1742b4fad8d167a64057b5ddd.html`, `.png` |
| Avatar & Gear | `3cf1387959ad4ee5830e5cce8e6efcf1` | `screens/avatar-gear-3cf1387959ad4ee5830e5cce8e6efcf1.html`, `.png` |
| AI Coach | `ba0ec4e960754d26be796d3fb117b549` | `screens/ai-coach-ba0ec4e960754d26be796d3fb117b549.html`, `.png` |
| The Squad | `9f82dd78742e4e148234ee45d8443c1c` | `screens/the-squad-9f82dd78742e4e148234ee45d8443c1c.html`, `.png` |
| Dashboard | `5026dcee5dbb427390fd6afe80230db7` | `screens/dashboard-5026dcee5dbb427390fd6afe80230db7.html`, `.png` |

## Extra Extracted Items

- `QuestLife Logo` (`47bdee289aad49a48359974f9d073cea`)
- `QuestLife RPG Productivity App` (`0201617825a240328d6d4ce52ced33de`)
- `QuestLife PRD` metadata/plain text entry (`b2a4ec13db91482bb987bb89913c49dd`)

## Next Use

Use the HTML files as design references, not as drop-in production components.
The next implementation step is to translate each screen into existing Next.js/Tailwind components under `src/app/(app)` and shared UI components.
