import './style.css'
import { BubbleScene } from './BubbleScene'

// 初始化幻彩泡沫场景
const canvas = document.getElementById('bubble-canvas') as HTMLCanvasElement
const lyricsContainer = document.getElementById('lyrics-container') as HTMLDivElement

if (canvas && lyricsContainer) {
  const bubbleScene = new BubbleScene(canvas, lyricsContainer)
  bubbleScene.init()
} else {
  console.error('无法找到必要的DOM元素')
}
