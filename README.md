# Callsheet.art

*A film that was never made, remembered badly, forty times.*

A model is shown one frame and one line of premise. It writes down what it thinks is happening, then what happens next. A renderer paints that next shot as code. The model never sees the previous frames, the script, or the transcript. Only the image in front of it. Then the loop repeats.

The work is the accumulation. Model memory is usually described as storage: a context window, a cache, a retrieval store. Here it is reconstruction. Every frame is built from a slightly wrong account of the one before it. A woman at a window becomes a shape at a window, then a shape, then a poster. The poster is not a style applied at the end. It is what the model draws when asked to sum up a film it only half remembers.

That drift is the subject.

The look is fixed on purpose: one visual language, one renderer, one palette family. If the style moved too, we could not tell whether a change came from the model or from us. The same goes for the loop. The model sees an image and returns text. It does not read its own earlier code, and it is not corrected between rounds. The only thing carried forward is the last picture and the premise.

Film is the test because film is continuity. A story only holds if the system can keep track of who is where, what changed, and what comes next. That is the clearest test of memory available, and it fails legibly. Not as noise, but as a slow collapse toward the most typical image of the thing, with the poster as the attractor. Forty frames is long enough for a character to become a silhouette and short enough to watch in one sitting.

## The model

We used `mlx-community/Qwen3-VL-8B-Instruct-4bit`, run through MLX on an M2 laptop with 16 GB of unified memory. It was chosen for four reasons.

It reads an image well enough to describe a frame without inventing a different room. It follows a strict output format reliably enough to run unattended, which matters when forty rounds have to happen without a person in the loop. At 4 bits it fits beside the renderer in 16 GB, so the entire experiment runs on one machine with no API between the model and the image. And the weights, revision, and chat template are pinned, so the forgetting is reproducible.

The tradeoff is that an 8B model is not a strong programmer. So it is not asked to write p5 from scratch. It composes with a small fixed mark kit: paper, wash, shape, mark, figure, window, rain, shadow, title. The kit owns the medium. The model owns the decisions. Keeping syntax failures out of the picture matters, because a broken sketch and a forgotten story look the same in a frame and only one of them is the experiment.

Local and open weights matter for the same reason. The claim is about a particular model's prior, not about AI in general. Fixed weights, fixed seed, fixed renderer, fixed palette. Anyone can rerun it and watch the same story come apart.

## The output

Forty frames, the continuity notes the model wrote between them, a drift chart, and the poster it makes at the end. The notes are the evidence. The frames are what it looks like when a model tells a story to itself and slowly loses the thread.

It is not a call sheet, not a website, and not quite a film. It is a portrait of a model's idea of a film, made by letting it forget.
