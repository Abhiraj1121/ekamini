# Eka — Material You Redesign Notes

## What changed structurally
- `index.html` moved to `templates/index.html` (proper Flask convention, matches your main `eka` repo layout).
- `static/mobile.css` / `static/mobile.js` replaced with `static/style.css` and `static/app.js`.
- `app.py` logic untouched — same model waterfall, DuckDuckGo/Wikipedia search, quick replies. Only the persona instruction from Settings is appended to the outgoing message text.

## Visual system — Material You
- Full Material 3 token system: tonal surfaces (`--md-surface` through `--md-surface-4`), primary/secondary/tertiary containers, proper on-color pairs for contrast.
- 6 selectable accent palettes (Violet, Teal, Rose, Amber, Blue, Sage) — each swaps primary/container/tertiary tokens live, the Material You way.
- Light and dark schemes, plus a "System default" mode that follows the OS.
- Type: Inter (UI/body) + Roboto Mono (code/utility), replacing the previous Cinzel/Rajdhani pairing for a cleaner, more "pro app" feel.
- Motion: Material 3 emphasized-easing curve (`cubic-bezier(0.2,0,0,1)`) plus a spring curve for tactile taps (buttons, switches, chips). Ripple effects on every interactive control. A `data-reduce-motion` flag (also a Settings toggle) drops all of this for accessibility.

## New: full Settings page
Previously settings lived only in a small slide-up sheet. Now there's a dedicated, full-screen Settings view (slides in from the right like a native app) with:
- **Appearance**: theme mode picker, accent color swatches, message text size slider (4 steps), reduce-motion switch.
- **AI behavior**: response style picker (Balanced / Concise / Detailed / Creative — actually changes the prompt sent to the model), web search switch, suggested-replies switch.
- **Voice & sound**: speak-replies switch, sound effects, haptics, voice language picker.
- **Data & privacy**: chat history browser, export current chat, clear all history (now with a confirm dialog instead of firing immediately).
- **Account**: sign out (also confirm-gated).

The old slide-up menu is now a lighter "quick" sheet: new chat, chat search, recent conversations, and a link into full Settings — tapping the profile row also jumps to Settings.

## New features beyond the original
- **Follow-up suggestion chips** after each AI reply (toggleable) — tap to continue the conversation, Material You outlined-chip style.
- **Per-message actions**: copy-to-clipboard and a "good response" like button on every AI reply.
- **Chat search** inside the menu sheet (filters saved conversations by title).
- **Response style / persona picker** — changes tone without touching the backend prompt file.
- **Stop-speaking button** on the live speaking indicator.
- **Auto-growing composer textarea** (multi-line messages, Shift+Enter for newline).
- Confirm dialogs before destructive actions (clear history, sign out) instead of instant execution.

## What was intentionally kept
- Voice input (Web Speech API) and voice output (SpeechSynthesis), including Hindi auto-detection.
- Photo attachment flow.
- LocalStorage-based chat sessions/history (no backend DB, same as before).
- Sign-in gate (name optional, email required, "stays on this device" messaging).
- The Flask backend's model waterfall, DuckDuckGo + Wikipedia search fallback, and quick-reply short-circuits are all unchanged.

## Testing performed
- Verified the Flask template renders (`/` → 200, correct asset links).
- Verified `/api/chat` and `/api/health` respond correctly.
- Cross-checked every `getElementById` call in `app.js` against `index.html` ids (no mismatches).
- Cross-checked every `classList` operation against CSS class definitions (no mismatches).
- Validated JS syntax and CSS brace balance.
- I was not able to render a live screenshot in this environment (no browser binary available in the sandbox), so please do a visual pass once you deploy — happy to iterate on anything that looks off.

## Suggested next steps
- Swap in a real `AI_API_KEY` / `.env` to test live replies.
- If you want this to match your **main** `eka` repo (not just `ekamini`), the same `static/style.css` + `static/app.js` should drop in with minimal changes if your main repo's `index.html` has similar element IDs — happy to help wire that up too.
