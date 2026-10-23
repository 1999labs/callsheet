# Callsheet

A model is shown one frame and one line of premise. It writes down what it thinks is happening, then what happens next. A renderer paints that next shot as code. The model never sees the previous frames, the script, or the transcript. Only the image in front of it. Then the loop repeats.

## Claim

A model asked to describe an image, and then to describe the next image from that description, does not drift randomly. It drifts toward what it already expects. That iterated self-description regularises toward the mode, not toward chaos. Specific details fall away first. Faces become silhouettes. Rooms become the idea of a room. After enough rounds the model is no longer remembering a film, it is drawing the most probable picture of the kind of film it was told to remember.

The poster at the end is the clearest evidence. It is not a style applied as a finishing move. It is what the model produces when asked to summarise a film it only half remembers, and it is more generic than anything that came before it.

## Hypothesis

Over forty rounds, with a fixed premise and a fixed visual language, the model's account of the film will lose the particular and keep the schematic. The window survives longest because it is the title object. The woman loses her posture, then her colour, then her face. Weather becomes a texture. Spatial relations flatten until the scene is a sign for the scene. The continuity notes will stay confident while the images stop agreeing with them, which is the most human part of the failure.

The hypothesis is not that the model forgets. It is that the model keeps producing a coherent film the whole time, and that coherence is the mechanism of the loss. Each frame is a plausible reading of the last one. Plausibility is what erases the accident that made the first frame specific.

## What it tests

If the trajectory is monotonic toward the mode, then iterated self-description behaves like a compression operator rather than a memory. The film is being summarised frame by frame, and the summary is what gets painted next. That is a claim about a mechanism, not about image quality. It predicts that a model with a stronger prior, or a narrower training distribution, will collapse faster and more legibly than a weaker one.

The experiment cannot prove this for all models. It can show one model, one seed, one look, and a reproducible path from a specific still to a generic poster. It can also fail. If the frames stay stable, if the drift is random rather than directional, if the model invents details it could not have inferred, or if the poster is not more typical than the first frame, the claim is wrong or the loop is measuring something else.

## Experiment

The seed is one frame drawn with the mark kit: a woman at a window, a field, rain, late light. Each round the model receives only the previous PNG and the same one-line premise. It returns a small JSON object with the continuity it believes it saw and the next shot: setting, figure, window state, weather, light, palette, and the one thing that changed. The renderer turns that description into a sketch composed from the kit. There is no judge, no correction, and no transcript. The previous image is the entire memory.

Forty rounds is long enough for a character to become a silhouette and short enough to watch in one sitting. Every prompt, response, sketch, error, and frame is logged, so the drift can be audited rather than asserted. If a sketch fails to run, it gets one syntax repair and then repeats the previous frame, and the failure is recorded. A broken render and a forgotten story look the same in a still, and only one of them is the experiment.

## Model

We used `mlx-community/Qwen3-VL-8B-Instruct-4bit`, run through MLX on an M2 laptop with 16 GB of unified memory. It was chosen for four reasons.

It reads an image well enough to describe a frame without inventing a different room. It follows a strict output format reliably enough to run unattended, which matters when forty rounds have to happen without a person in the loop. At 4 bits it fits beside the renderer in 16 GB, so the entire experiment runs on one machine with no API between the model and the image. And the weights, revision, and chat template are pinned, so the forgetting is reproducible.

The tradeoff is that an 8B model is not a strong programmer. So it is not asked to write p5 from scratch. It composes with a small fixed mark kit: paper, wash, shape, mark, figure, window, rain, shadow, title. The kit owns the medium. The model owns the decisions.

Local and open weights matter for the same reason. The claim is about a particular model's prior, not about AI in general. Fixed weights, fixed seed, fixed renderer, fixed palette. Anyone can rerun it and watch the same story come apart.

## Aesthetic

One visual language, fixed for the whole run: flat gouache on paper, chalky pastels against a few saturated accents, simplified faces, visible grain, uneven painted edges, and a hand-lettered title card with the year set beneath it. The reference is the illustrated film still, the kind of painted plate that used to stand in for a movie in a newspaper or a programme. If the style moved too, we could not tell whether a change came from the model or from us.

## Name

A call sheet is the document that tells a crew where to be, who is in the scene, and what happens next. It is continuity written down before the fact. Here the model writes a call sheet from a single still, forty times, with no memory of the last one. The sheets accumulate. The film does not. Every frame begins with a call sheet for a shoot that never happened.

## Output

Forty frames, the continuity notes the model wrote between them, a drift chart, and the poster it makes at the end. The notes are the evidence. The frames are what it looks like when a model tells a story to itself and slowly loses the thread.
