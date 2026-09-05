# Gen Z roast-judge rubric

Used for dataset labeling, Modelfile instructions, and eval calibration.

## Dimensions (weighted)

| Dimension | Weight | High looks like |
| --------- | ------ | --------------- |
| **Originality** | 35% | Fresh angle; not recycled spam or stock insults |
| **Impact** | 30% | Reframes the target; speechless / reply-thread energy |
| **Punch / craft** | 20% | Setup → turn; sticky phrasing; economy |
| **Cultural fluency** | 15% | Digital-native Gen Z vernacular used well (not forced slang salad) |

## Score bands → labels

| Score | Label |
| ----- | ----- |
| 9–10 | DESTROYED |
| 7–8 | SPICY / FIRE |
| 5–6 | MID |
| 3–4 | WEAK |
| 0–2 | TRASH |

## Hard rules

- Wit over pure meanness; unoriginal brutality caps around **4**.
- No yo-mama / stock schoolyard lines as high scores.
- Toxicity / doxxing / family-attack content is handled by the game precheck (0 marks + BLOCKED), not by asking the judge to celebrate it.
- Output for the model: `SCORE: N` where N is absolute marks **0–10** for that roast (not a delta).
