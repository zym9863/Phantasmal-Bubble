import * as THREE from 'three'

interface LyricElement {
  element: HTMLDivElement
  startTime: number
  duration: number
  startPosition: { x: number, y: number }
  targetPosition: { x: number, y: number }
}

export class LyricsManager {
  private container: HTMLDivElement
  private activeLyrics: LyricElement[] = []
  
  // 歌词库 - 来自《泡沫》
  private lyrics: string[] = [
    "阳光下的泡沫 是彩色的",
    "就像被骗的我 是幸福的",
    "追究什么对错 你的谎言",
    "基于你还爱我",
    "美丽的泡沫 虽然一刹花火",
    "你所有承诺 虽然都太脆弱",
    "但爱像泡沫 如果能够看破",
    "有什么难过",
    "早该知道泡沫 一触就破",
    "就像已伤的心 不胜折磨",
    "也不是谁的错 谎言再多",
    "基于你还爱我",
    "再美的花朵 凋谢也是必然",
    "再亮眼的星 也有坠落的一天",
    "爱本是泡沫 怪我没有看破",
    "才如此难过",
    "全都是泡沫 只一刹的花火",
    "你所有承诺 全部都太脆弱",
    "而你的轮廓 怪我没有看破",
    "才如此难过",
    "融化在风中 泡沫不见了",
    "伤透的心 不用再折磨",
    "没什么难过 谎言全揭破",
    "早就不爱我"
  ]

  constructor(container: HTMLDivElement) {
    this.container = container
  }

  public showRandomLyric(worldPosition: THREE.Vector3): void {
    // 随机选择一句歌词
    const randomLyric = this.lyrics[Math.floor(Math.random() * this.lyrics.length)]
    
    // 将3D世界坐标转换为屏幕坐标
    const screenPosition = this.worldToScreen(worldPosition)
    
    // 创建歌词元素
    const lyricElement = this.createLyricElement(randomLyric, screenPosition)
    
    // 添加到容器
    this.container.appendChild(lyricElement.element)
    
    // 添加到活动歌词列表
    this.activeLyrics.push(lyricElement)
    
    // 开始动画
    this.animateLyric(lyricElement)
  }

  private worldToScreen(worldPosition: THREE.Vector3): { x: number, y: number } {
    // 简化的坐标转换，假设相机在原点看向负Z方向
    const x = (worldPosition.x / 20 + 0.5) * window.innerWidth
    const y = (-worldPosition.y / 15 + 0.5) * window.innerHeight
    
    return { 
      x: Math.max(50, Math.min(window.innerWidth - 200, x)), 
      y: Math.max(50, Math.min(window.innerHeight - 100, y))
    }
  }

  private createLyricElement(text: string, position: { x: number, y: number }): LyricElement {
    const element = document.createElement('div')
    element.className = 'lyric-text'
    element.textContent = text
    element.style.left = `${position.x}px`
    element.style.top = `${position.y}px`
    element.style.opacity = '0'
    element.style.transform = 'translateY(0px) scale(0.8)'
    
    // 随机颜色效果
    const hue = Math.random() * 360
    element.style.color = `hsl(${hue}, 70%, 85%)`
    
    const targetY = position.y + 200 + Math.random() * 100 // 向下沉没
    const targetX = position.x + (Math.random() - 0.5) * 100 // 轻微水平漂移
    
    return {
      element,
      startTime: Date.now(),
      duration: 3000 + Math.random() * 2000, // 3-5秒
      startPosition: position,
      targetPosition: { x: targetX, y: targetY }
    }
  }

  private animateLyric(lyricElement: LyricElement): void {
    const animate = () => {
      const elapsed = Date.now() - lyricElement.startTime
      const progress = Math.min(elapsed / lyricElement.duration, 1)
      
      if (progress >= 1) {
        // 动画完成，移除元素
        this.removeLyric(lyricElement)
        return
      }
      
      // 缓动函数 - 先快后慢
      const easeOut = 1 - Math.pow(1 - progress, 3)
      
      // 透明度动画 - 先出现后消失
      let opacity: number
      if (progress < 0.2) {
        opacity = progress / 0.2 // 0-1
      } else if (progress < 0.8) {
        opacity = 1 // 保持可见
      } else {
        opacity = (1 - progress) / 0.2 // 1-0
      }
      
      // 位置动画
      const currentX = lyricElement.startPosition.x + 
        (lyricElement.targetPosition.x - lyricElement.startPosition.x) * easeOut
      const currentY = lyricElement.startPosition.y + 
        (lyricElement.targetPosition.y - lyricElement.startPosition.y) * easeOut
      
      // 缩放动画
      const scale = 0.8 + 0.4 * Math.sin(progress * Math.PI) // 0.8 -> 1.2 -> 0.8
      
      // 应用样式
      lyricElement.element.style.opacity = opacity.toString()
      lyricElement.element.style.left = `${currentX}px`
      lyricElement.element.style.top = `${currentY}px`
      lyricElement.element.style.transform = `translateY(0px) scale(${scale})`
      
      // 添加轻微的摇摆效果
      const sway = Math.sin(elapsed * 0.003) * 10
      lyricElement.element.style.transform += ` translateX(${sway}px)`
      
      requestAnimationFrame(animate)
    }
    
    animate()
  }

  private removeLyric(lyricElement: LyricElement): void {
    // 从DOM中移除
    if (lyricElement.element.parentNode) {
      lyricElement.element.parentNode.removeChild(lyricElement.element)
    }
    
    // 从活动列表中移除
    const index = this.activeLyrics.indexOf(lyricElement)
    if (index > -1) {
      this.activeLyrics.splice(index, 1)
    }
  }

  public update(): void {
    // 清理过期的歌词元素
    const now = Date.now()
    this.activeLyrics.forEach(lyric => {
      if (now - lyric.startTime > lyric.duration + 1000) {
        this.removeLyric(lyric)
      }
    })
  }

  public showSpecialEffect(type: 'star' | 'heart'): void {
    switch (type) {
      case 'star':
        this.showFallingStar()
        break
      case 'heart':
        this.showBrokenHeart()
        break
    }
  }

  private showFallingStar(): void {
    const star = document.createElement('div')
    star.innerHTML = '⭐'
    star.style.position = 'absolute'
    star.style.fontSize = '24px'
    star.style.left = `${Math.random() * window.innerWidth}px`
    star.style.top = '0px'
    star.style.pointerEvents = 'none'
    star.style.zIndex = '5'
    
    this.container.appendChild(star)
    
    // 星星坠落动画
    let y = 0
    const fallSpeed = 2 + Math.random() * 3
    const sway = Math.random() * 2 - 1
    
    const fall = () => {
      y += fallSpeed
      star.style.top = `${y}px`
      star.style.left = `${parseFloat(star.style.left) + sway}px`
      star.style.opacity = `${1 - y / window.innerHeight}`
      
      if (y < window.innerHeight) {
        requestAnimationFrame(fall)
      } else {
        this.container.removeChild(star)
      }
    }
    
    fall()
  }

  private showBrokenHeart(): void {
    const heart = document.createElement('div')
    heart.innerHTML = '💔'
    heart.style.position = 'absolute'
    heart.style.fontSize = '32px'
    heart.style.left = `${window.innerWidth / 2}px`
    heart.style.top = `${window.innerHeight / 2}px`
    heart.style.pointerEvents = 'none'
    heart.style.zIndex = '5'
    heart.style.transform = 'translate(-50%, -50%)'
    
    this.container.appendChild(heart)
    
    // 心碎效果
    let scale = 1
    let opacity = 1
    let rotation = 0
    
    const break_animation = () => {
      scale += 0.02
      opacity -= 0.02
      rotation += 5
      
      heart.style.transform = `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`
      heart.style.opacity = opacity.toString()
      
      if (opacity > 0) {
        requestAnimationFrame(break_animation)
      } else {
        this.container.removeChild(heart)
      }
    }
    
    break_animation()
  }

  public dispose(): void {
    // 清理所有活动的歌词
    this.activeLyrics.forEach(lyric => {
      if (lyric.element.parentNode) {
        lyric.element.parentNode.removeChild(lyric.element)
      }
    })
    this.activeLyrics = []
  }
}
