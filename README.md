# ✈️ Guess the Airline

A fun, interactive web game built with Astro where users test their aviation knowledge by identifying airlines from their IATA codes.

## 🎮 Game Features

- **Unlimited Questions**: Keep playing as long as you want - the game never ends!
- **Multiple Choice**: Four airline options to choose from for each IATA code
- **Real-time Feedback**: Instantly see if your answer is correct or incorrect
- **Score Tracking**: Track your performance with a running score counter
- **777 Airlines**: Pulls from a comprehensive database of airlines via API

## 🚀 Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm

### Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Run the development server:

```bash
npm run dev
```

The game will be available at `http://localhost:4321/`

### Build for Production

Build the static site:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## 🛠️ How It Works

The game fetches airline data from the [IATA Code Decoder API](https://iata-code-decoder-api.timrogers.co.uk/airlines) at build time. Each question:

1. Randomly selects one airline as the correct answer
2. Displays its IATA code (e.g., "BA" for British Airways)
3. Generates three random incorrect options
4. Shuffles all four options
5. Waits for the user to select an answer
6. Shows immediate feedback (correct/incorrect)
7. Loads the next question when the user clicks "Next Question"

## 📦 Tech Stack

- **[Astro](https://astro.build/)** - Fast, modern static site generator
- **TypeScript** - Type-safe JavaScript
- **IATA Code Decoder API** - Real airline data with CORS support

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

## 🎯 Future Enhancements

Potential improvements for future versions:

- Add difficulty levels (more/fewer options)
- Include airline logos in the questions
- Add a leaderboard or high score system
- Support for timed challenges
- Mobile app version
