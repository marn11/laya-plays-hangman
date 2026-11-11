# ai-plays-hangman

A visually polished, framework-free Hangman game, built as a testbed for
[Laya](https://huggingface.co/convaiinnovations/laya) (a non-generative,
calibrated "System 1" decision model) to play letter-by-letter -- the same
pattern as [ai-plays-endless-runner](https://github.com/marn11/ai-plays-endless-runner),
applied to a game where every decision is a discrete, turn-based choice
instead of a real-time reflex.

## The game

Open `index.html` (served over HTTP, not `file://` -- see below) for a
chalkboard-themed Hangman: a hand-chalked gallows that's drawn in stroke by
stroke per wrong guess, a QWERTY keyboard (click or type), and a small word
bank (`words.js`).

```sh
python3 -m http.server 8921
# then open http://localhost:8921/index.html
```

## Programmatic control bridge

Unlike the subway-surfers game, Hangman has no real-time physics to keep fair
-- every turn is a discrete decision, so there's no manual-stepping bridge
needed here. `game.js` exposes three functions for an external agent:

```js
window.__getState()     // current state, see below
window.__action(letter) // guess a letter, returns the new state
window.__restart()      // start a new word, returns the new state
```

`getState()` returns:

```js
{
  masked: "c l a _ s i f _ e r",   // space-separated, unguessed letters as "_"
  wordLength: 10,
  guessedLetters: ["a", "c", "e", "i", "l", "r", "s"],
  remainingLetters: ["b", "d", "f", ...],  // alphabet minus guessedLetters
  wrongLetters: ["f"],
  wrongCount: 1,
  maxWrong: 6,
  isPlaying: true,
  isWon: false,
  isLost: false,
  word: null,   // only revealed once isPlaying is false, so the state never
                // leaks the answer to whatever is playing it
}
```

`guessedLetters` and `remainingLetters` are exactly what each Laya question
will carry as context, per the brief for this project.

## What's next

Laya hasn't played a single round yet. The plan, mirroring the
subway-surfers pipeline: a zero-shot baseline first (does Laya's base
checkpoint do anything sensible with "guessed letters" + "remaining
letters" + a masked word as context?), then decide whether a
specialized training pass is even necessary for a task this constrained
before building one.
