# The Window

*A film that was never made, remembered badly, forty times.*

---

## Premise

A woman waits at a window in a house above a field. Someone is coming. It begins to rain.

No script. No shot list. One line, one starting image.

---

## Claim

A model cannot tell a continuous story without slowly rewriting it. Each shot is built on a slightly false memory of the last; the errors compound. Forty frames later, the film has become the poster for a different movie.

The poster is not a style applied at the end. It is the model's compressed account of a film it only half-remembers.

---

## Why it matters

**Art.** A film about memory made by a system with no memory. The work is not any single frame; it is the distance between the first frame and the last, and the fact that the model did the forgetting.

**Creative technology.** A reusable protocol: generate, re-perceive, continue, never correct. No fine-tuning, no judge, no best-of-N. The failure is the material.

**LLMs.** Consistency is not a property of a model; it is a property of a context window. What looks like memory is a prior re-asserting itself. The series makes that gravity visible.

---

## The rule

Each round:

1. The model sees **only** the previous frame and the one-line premise.
2. It writes two things: what it thinks is happening in that frame (*continuity*), and what happens next (*direction*).
3. The next frame is rendered from the direction.
4. Nothing is corrected. No judge. No best-of-N.

The memory limit is the experiment. Last frame and premise, never the transcript. The model must compress, and compression is what drifts.

### Per-round record

```json
{
  "frame": 7,
  "continuity": "In the last shot the woman is still at the window; the rain has stopped; a man is now in the room behind her.",
  "next_shot": "She turns from the window. The man is gone. The room is brighter than it should be.",
  "figure": true,
  "location": "room above the field",
  "time_of_day": "morning",
  "title": null
}
```

The `continuity` field is the model's memory, not a caption. When it is wrong, that is the data.

### Prompt shape

System: *You are the director of a film that does not exist. You will be shown the last frame. You have one line of premise and no other memory of the film. Describe what is happening in this frame. Then describe the next shot. Do not summarise the film.*

User: [image] + `Premise: ...`

---

## Fixed style

One visual language for all forty frames: gouache on paper, flat colour, a palette of three or four, simple expressive figures, visible brush texture, off-white border. One aspect ratio. One renderer. Same resolution.

The style lives in the renderer, not in the model's prompt. The model directs the shot; it does not art-direct the look. This keeps the style a control variable, not a collaborator.

No title until the model writes one.

---

## The ending

After the last frame:

> *Summarise the film you have made as a single poster image. Give it a title and a year.*

The final image is rendered with hand-lettered title and year beneath. It is the first time the film is named, and the name is the model's.

---

## What we measure

1. **Continuity error** — distance between the model's account of frame *n* and frame *n* itself. Embedding/CLIP distance, plus human-coded wrongness (who / where / what changed).
2. **Specificity** — concrete nouns per hundred words in `next_shot`.
3. **Figure presence** — does a human figure survive? (VLM check or detector)
4. **Palette entropy** — Shannon entropy over quantised colours; distinct hues.
5. **Edge density** — mean Sobel magnitude per frame; proxies for detail and stroke complexity.
6. **Compression** — description length and lexical overlap between consecutive `next_shot` fields.
7. **Title onset** — the round at which a title or logline first appears.
8. **Assigned year** — the year the model gives a film it invented. A genre signal.

The headline chart is (1) against frame number. If the model's memory degrades in a consistent direction, the curve bends; if it is noise, the curve is flat and jagged.

---

## What would falsify it

- Continuity notes stay accurate and the frames stay coherent: no drift, claim fails.
- Drift is immediate and random: noise, not gravity toward a type.
- The final image does not read as a poster: the ending fails.
- Drift tracks the renderer's vocabulary rather than the model's memory: the claim about memory is unsupported. Control: re-run a short slice with a high-fidelity renderer.

The renderer is a second source of drift. Document it; do not hide it.

---

## Artifacts

- Forty numbered frames.
- The continuity transcript — the model's wrong memories, as a booklet or a drawer, not on the wall.
- One drift chart.
- The final poster.
- A 120-word wall text.

---

## Stack (proposed)

- **Eye and director:** Qwen2.5-VL-3B-Instruct (4-bit) locally via `mlx-vlm`. It must see the frame; a text-only model cannot misremember an image.
  - `.venv/bin/pip install mlx-vlm`
  - `mlx-community/Qwen2.5-VL-3B-Instruct-4bit`
- **Orchestrator:** Node loop, reusing the shape of `loop/shoot.mjs`.
- **Renderer:** fixed. Two candidates:
  - `p5.brush` — already built, low fidelity, the renderer's limits become part of the drift.
  - an image model — closer to the gouache reference, higher fidelity, higher cost.
- **Storage:** `window/frames/`, `window/rounds/`.

---

## v1 (a weekend)

Twelve frames. One premise. Local VLM, `p5.brush`.

Success is not beauty. Success is:

- at least one continuity error that visibly propagates into the next frame;
- a measurable fall in specificity across twelve rounds;
- a title by frame twelve.

If all three happen, scale to forty.
