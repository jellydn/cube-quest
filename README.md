<div align="center">
  <h1>🎲 Cube Quest</h1>
  <p><strong>Learn Rubik's Cube — one step at a time!</strong></p>

  [![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
  <img src="https://img.shields.io/badge/AGENTS.md-supported-green" alt="AGENTS.md supported" href="https://agents.md/">
  <img src="https://img.shields.io/badge/Requires-Internet%20Connection-orange" alt="CDN dependency">
  <img src="https://img.shields.io/badge/Runs-Browser%20Only-lightgrey" alt="No build step">
</div>

---

**Cube Quest** is a kid-friendly, browser-based Rubik's Cube tutorial that teaches you to solve the cube from scratch — no downloads, no installs, no account. Just open it and start learning. 🚀

> Perfect for kids (and adults!) who want to master the Rubik's Cube with a fun, step-by-step guide, interactive 3D practice, and a little confetti when you finish.

## Features

- **7-Step Learn Path**: Go from white cross to fully solved cube with simple, visual instructions
- **Interactive 3D Cube**: Rotate and explore the cube with your mouse (powered by Three.js)
- **Practice Mode**: Scramble the cube, make moves, undo mistakes — with a live move counter and timer
- **Move Guide**: Learn what the letters mean (R, U, L, F, B, etc.) with a friendly reference
- **Kid-Friendly Tips**: Learn one step per day, short daily practice, and encouragement along the way
- **Curated Videos**: YouTube tutorial recommendations (ask a grown-up to watch together!)
- **Progress Tracking**: Your completed steps are saved in your browser so you can pick up where you left off
- **Celebration!**: A confetti party when you solve the whole cube 🎉
- **Responsive Design**: Works on desktop, tablet, and phone

## Getting Started

### Requirements

- A modern browser (Chrome, Firefox, Safari, Edge)
- An internet connection (Three.js loads from a CDN)

### Run

There is no installation or build step — the app runs directly in your browser.

1. Download or clone this repository:

```bash
git clone https://github.com/jellydn/cube-quest.git
```

2. Open `index.html` in your browser:

```bash
cd cube-quest
open index.html
```

That's it! The 3D cube will load and you can start learning right away.

### How to Use

| Tab | What you do |
| --- | --- |
| 📚 **Learn** | Follow the 7 steps, one at a time. Watch the algorithm play on the cube and try it yourself. |
| 🎮 **Practice** | Scramble the cube and make moves with the buttons. Undo, reset, or use your keyboard. |
| 🔤 **Moves** | See what each letter (R, U, L, F, B, …) means and practice individual moves. |
| 💡 **Tips** | Helpful hints for learning the cube the smart way. |
| 🎬 **Videos** | Links to great YouTube tutorials. |

**Keyboard shortcuts** (in Practice mode):

| Key | Move |
| --- | --- |
| R, L, U, D, F, B | Turn that face clockwise |
| Shift + letter | Turn that face counter-clockwise (e.g. `Shift+R` = `R'`) |

> The **↩️ Undo** button in Practice mode undoes the last move (no keyboard shortcut).

## The 7 Steps

1. **Make the White Cross** — Find the white edges and match them to the side centres
2. **Solve the White Corners** — The classic *Righty Move* (`R U R' U'`)
3. **Solve the Middle Layer** — *Move Right* and *Move Left* algorithms
4. **Make the Yellow Cross** — The *Yellow Cross* algorithm
5. **Make the Entire Yellow Face** — Build the full yellow top
6. **Put Yellow Corners in Correct Places** — Position the last corners
7. **Finish the Cube!** — The *Finishing Move* and celebrate

## Development

This project follows the [AGENTS.md](https://agents.md/) standard for guiding coding agents. See [AGENTS.md](AGENTS.md) for:

- No build step — edit `index.html`, `app.js`, `cube.js`, or `style.css` directly
- Three.js is loaded from a CDN via an `importmap` (no `package.json`, no bundler)
- Changes are verified by opening `index.html` in a browser

### Project Structure

| File | Role |
| --- | --- |
| `index.html` | Entry point — importmap + module scripts + markup |
| `app.js` | UI, step data, algorithm playback, timer, localStorage |
| `cube.js` | 3D scene, cubies, layer rotations, scramble/reset, solved check |
| `style.css` | All styling, responsive breakpoints at 900px / 500px |

## Contributing

Contributions are welcome! Please:

1. Fork the repo
2. Create a feature branch (`git checkout -b my-feature`)
3. Make your changes
4. Test in a browser
5. Open a pull request

## License

[MIT](LICENSE) — built with ❤️ by the open-source community.
