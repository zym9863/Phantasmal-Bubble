[English](./README_EN.md) | [中文](./README.md)

# Phantasmal Bubble (幻彩泡沫)

An interactive 3D bubble art application based on Three.js, inspired by G.E.M.'s song "泡沫 (Bubble)".

## 🌈 Core Features

### 1. Interactive Bubble Generation and Dissolution
- **Auto Generation**: Bubbles of various sizes with iridescent effects are automatically generated in the 3D scene
- **Sunlight Effect**: Simulate colorful iridescence under sunlight
- **Pop on Click**: Click a bubble to instantly shatter it into tiny light particles that dissipate
- **Hover Effect**: Bubbles glow and enlarge when hovered

### 2. Visualized Lyrics Falling
- **Lyrics Display**: Random lyrics from "泡沫" appear when a bubble pops
- **Sinking Animation**: Lyrics slowly sink, simulating the feeling of a "wounded heart"
- **Special Effects**: Randomly trigger falling stars or broken heart effects

### 3. Environmental Effects System
- **Sun Rays**: Dynamic sunlight effects for a warm atmosphere
- **Rainy Mode**: Press R to toggle rain; bubbles become more fragile in the rain
- **Lightning Effect**: Press L to create lightning for dramatic effect
- **Wind System**: Bubbles are affected by wind for added realism

## 🎮 Controls

- **Mouse Move**: Hover over bubbles to see glow effect
- **Mouse Click**: Click bubbles to pop them
- **R Key**: Toggle rain/sunny mode
- **L Key**: Create lightning effect

## 🛠️ Tech Stack

- **Three.js**: 3D rendering
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool
- **pnpm**: Efficient package manager

## 🎨 Visual Effects

### Bubble Material
- Physically Based Rendering (PBR) material
- Iridescence effect
- Transparency and refraction
- Dynamic color changes

### Particle System
- Bubble shatter particle effects
- Environmental raindrop system
- Sun ray effects

### Animation System
- Bubble floating animation
- Lyrics sinking animation
- Environmental effect animations

## 🚀 Quick Start

### Install dependencies
```bash
pnpm install
```

### Start development server
```bash
pnpm dev
```

### Build for production
```bash
pnpm build
```

## 📁 Project Structure

```
src/
├── main.ts              # App entry
├── BubbleScene.ts       # Main scene manager
├── Bubble.ts            # Bubble class
├── LyricsManager.ts     # Lyrics manager
├── EnvironmentEffects.ts # Environment effects manager
└── style.css           # Stylesheet
```

## 🎵 Lyrics Source

Lyrics snippets are from G.E.M.'s song "泡沫 (Bubble)", visually expressing the fragility and beauty of love as depicted in the song.

## 🌟 Artistic Concept

This app is not just a technical demo, but an emotional art piece:

- **Beauty & Fragility**: The beauty and fragility of bubbles symbolize the delicate nature of love
- **Interactive Experience**: Each user click "destroys" something beautiful, provoking reflection
- **Poetic Expression**: Abstract emotions are visualized through technology

## 🔧 Performance Optimization

- Bubble count limit (max 15)
- Throttled updates for environmental effects
- Auto-cleanup for particle systems
- Resource management for materials and geometries

## 📱 Compatibility

- Modern browsers (WebGL support)
- Desktop and mobile devices
- Recommended: Chrome, Firefox, Safari

## 🤝 Contributing

Feel free to submit Issues and Pull Requests to improve this project!

## 📄 License

MIT License

---

*"Bubbles in the sunlight are colorful, just like the deceived me is happy"* - G.E.M. "泡沫 (Bubble)"
