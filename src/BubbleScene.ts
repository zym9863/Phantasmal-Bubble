import * as THREE from 'three'
import { Bubble } from './Bubble'
import { LyricsManager } from './LyricsManager'
import { EnvironmentEffects } from './EnvironmentEffects'

export class BubbleScene {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private bubbles: Bubble[] = []
  private lyricsManager: LyricsManager
  private environmentEffects: EnvironmentEffects
  private raycaster: THREE.Raycaster
  private mouse: THREE.Vector2
  private canvas: HTMLCanvasElement
  private animationId: number | null = null

  // 场景参数
  private readonly MAX_BUBBLES = 15
  private readonly BUBBLE_SPAWN_RATE = 0.015 // 每帧生成泡沫的概率
  private frameCount: number = 0

  constructor(canvas: HTMLCanvasElement, lyricsContainer: HTMLDivElement) {
    this.canvas = canvas
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    this.lyricsManager = new LyricsManager(lyricsContainer)
    this.environmentEffects = new EnvironmentEffects(this.scene)
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()

    this.setupRenderer()
    this.setupCamera()
    this.setupLights()
    this.setupEventListeners()
  }

  private setupRenderer(): void {
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setClearColor(0x000000, 0) // 透明背景
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
  }

  private setupCamera(): void {
    this.camera.position.set(0, 0, 10)
    this.camera.lookAt(0, 0, 0)
  }

  private setupLights(): void {
    // 环境光 - 模拟阳光散射
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    this.scene.add(ambientLight)

    // 主光源 - 模拟阳光
    const sunLight = new THREE.DirectionalLight(0xffffff, 0.8)
    sunLight.position.set(10, 10, 5)
    sunLight.castShadow = true
    sunLight.shadow.mapSize.width = 2048
    sunLight.shadow.mapSize.height = 2048
    this.scene.add(sunLight)

    // 补充光源 - 增加彩虹效果
    const rainbowLight1 = new THREE.PointLight(0xff6b6b, 0.3, 20)
    rainbowLight1.position.set(-5, 5, 3)
    this.scene.add(rainbowLight1)

    const rainbowLight2 = new THREE.PointLight(0x4ecdc4, 0.3, 20)
    rainbowLight2.position.set(5, -5, 3)
    this.scene.add(rainbowLight2)

    const rainbowLight3 = new THREE.PointLight(0xffe66d, 0.3, 20)
    rainbowLight3.position.set(0, 5, -3)
    this.scene.add(rainbowLight3)
  }

  private setupEventListeners(): void {
    // 鼠标移动事件
    this.canvas.addEventListener('mousemove', (event) => {
      const rect = this.canvas.getBoundingClientRect()
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      // 检查鼠标悬停
      this.handleMouseHover()
    })

    // 鼠标点击事件
    this.canvas.addEventListener('click', () => {
      this.handleBubbleInteraction()
    })

    // 鼠标离开事件
    this.canvas.addEventListener('mouseleave', () => {
      this.resetBubbleHover()
    })

    // 窗口大小调整
    window.addEventListener('resize', () => {
      this.handleResize()
    })

    // 键盘事件 - 切换天气
    window.addEventListener('keydown', (event) => {
      if (event.key === 'r' || event.key === 'R') {
        this.environmentEffects.toggleRain()
      }
      if (event.key === 'l' || event.key === 'L') {
        this.environmentEffects.createLightning()
      }
    })
  }

  private handleMouseHover(): void {
    this.raycaster.setFromCamera(this.mouse, this.camera)
    const intersects = this.raycaster.intersectObjects(
      this.bubbles.map(bubble => bubble.getMesh()).filter(mesh => mesh !== null) as THREE.Object3D[]
    )

    // 重置所有泡沫的悬停状态
    this.bubbles.forEach(bubble => bubble.setHovered(false))

    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object
      const bubble = this.bubbles.find(bubble => bubble.getMesh() === intersectedObject)

      if (bubble) {
        bubble.setHovered(true)
        this.canvas.style.cursor = 'pointer'
      }
    } else {
      this.canvas.style.cursor = 'crosshair'
    }
  }

  private resetBubbleHover(): void {
    this.bubbles.forEach(bubble => bubble.setHovered(false))
    this.canvas.style.cursor = 'crosshair'
  }

  private handleBubbleInteraction(): void {
    this.raycaster.setFromCamera(this.mouse, this.camera)
    const intersects = this.raycaster.intersectObjects(
      this.bubbles.map(bubble => bubble.getMesh()).filter(mesh => mesh !== null) as THREE.Object3D[]
    )

    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object
      const bubbleIndex = this.bubbles.findIndex(bubble => bubble.getMesh() === intersectedObject)

      if (bubbleIndex !== -1) {
        const bubble = this.bubbles[bubbleIndex]
        this.burstBubble(bubble, bubbleIndex, intersects[0].point)
      }
    }
  }

  private burstBubble(bubble: Bubble, index: number, position: THREE.Vector3): void {
    // 移除泡沫
    this.scene.remove(bubble.getMesh()!)
    this.bubbles.splice(index, 1)

    // 创建破碎效果
    this.createBurstEffect(position)

    // 显示歌词
    this.lyricsManager.showRandomLyric(position)

    // 随机触发特殊效果
    if (Math.random() < 0.3) { // 30%概率
      if (Math.random() < 0.5) {
        this.lyricsManager.showSpecialEffect('star')
      } else {
        this.lyricsManager.showSpecialEffect('heart')
      }
    }

    // 清理泡沫资源
    bubble.dispose()
  }

  private createBurstEffect(position: THREE.Vector3): void {
    const particleCount = 15
    const particles: THREE.Mesh[] = []

    for (let i = 0; i < particleCount; i++) {
      const geometry = new THREE.SphereGeometry(0.02, 8, 8)
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(Math.random(), 0.7, 0.7),
        transparent: true,
        opacity: 0.8
      })
      
      const particle = new THREE.Mesh(geometry, material)
      particle.position.copy(position)
      
      // 随机方向和速度
      const direction = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      ).normalize()
      
      particle.userData = {
        velocity: direction.multiplyScalar(Math.random() * 0.1 + 0.05),
        life: 1.0
      }
      
      particles.push(particle)
      this.scene.add(particle)
    }

    // 动画粒子消散
    const animateParticles = () => {
      particles.forEach((particle, index) => {
        particle.userData.life -= 0.02
        particle.position.add(particle.userData.velocity)
        particle.userData.velocity.multiplyScalar(0.98) // 阻力
        
        const material = particle.material as THREE.MeshBasicMaterial
        material.opacity = particle.userData.life
        
        if (particle.userData.life <= 0) {
          this.scene.remove(particle)
          geometry.dispose()
          material.dispose()
          particles.splice(index, 1)
        }
      })
      
      if (particles.length > 0) {
        requestAnimationFrame(animateParticles)
      }
    }
    
    animateParticles()
  }

  private spawnBubble(): void {
    if (this.bubbles.length < this.MAX_BUBBLES && Math.random() < this.BUBBLE_SPAWN_RATE) {
      const bubble = new Bubble()
      
      // 随机位置（从底部或侧面生成）
      const spawnSide = Math.random()
      let x, y, z
      
      if (spawnSide < 0.7) {
        // 从底部生成
        x = (Math.random() - 0.5) * 20
        y = -8
        z = (Math.random() - 0.5) * 10
      } else {
        // 从侧面生成
        x = Math.random() < 0.5 ? -12 : 12
        y = (Math.random() - 0.5) * 10
        z = (Math.random() - 0.5) * 10
      }
      
      bubble.setPosition(x, y, z)
      this.bubbles.push(bubble)
      this.scene.add(bubble.getMesh()!)
    }
  }

  private updateBubbles(): void {
    this.bubbles.forEach((bubble, index) => {
      bubble.update()
      
      // 移除超出边界的泡沫
      const position = bubble.getPosition()
      if (position.y > 12 || Math.abs(position.x) > 15 || Math.abs(position.z) > 15) {
        this.scene.remove(bubble.getMesh()!)
        bubble.dispose()
        this.bubbles.splice(index, 1)
      }
    })
  }

  private handleResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate())
    this.frameCount++

    // 生成新泡沫
    this.spawnBubble()

    // 更新泡沫
    this.updateBubbles()

    // 更新环境效果（降低频率以提高性能）
    if (this.frameCount % 2 === 0) {
      this.environmentEffects.update()
      this.environmentEffects.addWindEffect(this.bubbles)
    }

    // 更新歌词管理器
    this.lyricsManager.update()

    // 渲染场景
    this.renderer.render(this.scene, this.camera)
  }

  public init(): void {
    this.animate()
  }

  public dispose(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }

    this.bubbles.forEach(bubble => {
      this.scene.remove(bubble.getMesh()!)
      bubble.dispose()
    })

    this.environmentEffects.dispose()
    this.lyricsManager.dispose()
    this.renderer.dispose()
  }
}
