# DingchengDavidLiang.github.io

David’s static portfolio, served by GitHub Pages. No build step or application dependencies are required. For local preview, serve this directory over HTTP (for example, `python -m http.server 8765`) and open `http://localhost:8765`.

The homepage uses the owner’s Little David concept and photo as references for a generated character asset. A single character grows from a close-up hero into a full-body guide as the visitor scrolls, with the existing portfolio content retained below. The handwritten headline font is bundled with its SIL Open Font License.

`hero-david.js` composites the studio plate once and uses a small WebGL shader to move the actual iris, eyebrow, eyelid, cheek, and mouth regions. This is a 2.5D textured illustration, not a rigged 3D model. The character’s head and body share one image, so the scroll transition is continuous and reversible. If WebGL is unavailable or lost, a static Canvas 2D character remains. If the image cannot load, the Q&A button still works.

Pointer tracking only runs with a fine pointer. Reduced-motion preferences are honored on load and when changed: gaze is neutral, smooth scrolling is disabled, and the hero changes directly into the pet. Animation frames stop when the gaze settles or the tab is hidden. The Q&A is a labeled, modeless dialog with keyboard controls, Escape-to-close, focus restoration, and a live message log. Its answers are local portfolio FAQs; it does not call an AI service or send questions to a server.

Validation: 35 browser checks passed in Chromium, covering preserved portfolio content, rendered gaze changes, forward/reverse scroll, keyboard focus, FAQ responses, safe text rendering, live reduced-motion changes, touch interaction, no-WebGL fallback, and layouts at 320×568, 390×844, 768×1024, 1024×768, 844×390, and 1920×1080. Desktop and mobile screenshots were visually inspected. Safari and Firefox have not been tested.
