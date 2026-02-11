<template>
  <div class="relative w-full h-[600px] bg-light rounded-xl overflow-hidden border border-secondary/20 shadow-inner">
    <!-- 图谱容器 -->
    <div ref="graphContainer" class="w-full h-full"></div>
    
    <!-- 悬浮提示 -->
    <div v-if="hoveredNode" 
         class="absolute z-10 pointer-events-none bg-white/90 backdrop-blur p-4 rounded-lg shadow-lg border-l-4 border-primary max-w-xs transition-all duration-200"
         :style="{ left: tooltipPos.x + 'px', top: tooltipPos.y + 'px' }">
      <h3 class="text-lg font-bold text-primary mb-1">{{ hoveredNode.id }}</h3>
      <p class="text-sm text-gray-600 mb-2">{{ hoveredNode.desc }}</p>
      <div class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block">
        <i class="fas fa-link mr-1"></i>关联章节: {{ hoveredNode.chapters.length }} 章
      </div>
    </div>

    <!-- 控制栏 -->
    <div class="absolute bottom-4 right-4 flex flex-col gap-2">
      <button @click="resetZoom" class="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 text-gray-600" title="重置视图">
        <i class="fas fa-compress-arrows-alt"></i>
      </button>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-20">
      <div class="loading-dots">
        <span></span><span></span><span></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as d3 from 'd3'

// 类型定义
interface GraphNode extends d3.SimulationNodeDatum {
  id: string
  group: number
  desc: string
  chapters: string[]
  radius?: number
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode
  target: string | GraphNode
  value: number
}

// 状态
const graphContainer = ref<HTMLElement | null>(null)
const hoveredNode = ref<GraphNode | null>(null)
const tooltipPos = ref({ x: 0, y: 0 })
const loading = ref(true)

// D3 实例变量
let simulation: d3.Simulation<GraphNode, GraphLink> | null = null
let svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null
let g: d3.Selection<SVGGElement, unknown, null, undefined> | null = null
let zoom: d3.ZoomBehavior<SVGSVGElement, unknown> | null = null

// 模拟数据：道德经核心概念图谱
const graphData = {
  nodes: [
    { id: "道", group: 1, desc: "宇宙本源，万物法则", chapters: ["1", "25", "42"], radius: 40 },
    { id: "德", group: 1, desc: "道的显化，内得于己", chapters: ["38", "51"], radius: 35 },
    { id: "无为", group: 2, desc: "顺应自然，不妄为", chapters: ["2", "3", "37", "63"], radius: 30 },
    { id: "自然", group: 2, desc: "本来的样子，自我如此", chapters: ["17", "23", "25"], radius: 30 },
    { id: "柔弱", group: 3, desc: "柔能克刚，弱能胜强", chapters: ["36", "43", "76", "78"], radius: 25 },
    { id: "不争", group: 3, desc: "夫唯不争，故天下莫能与之争", chapters: ["8", "22", "66"], radius: 25 },
    { id: "虚静", group: 4, desc: "致虚极，守静笃", chapters: ["16", "45"], radius: 25 },
    { id: "知足", group: 4, desc: "知足不辱，知止不殆", chapters: ["33", "44", "46"], radius: 20 },
    { id: "治国", group: 5, desc: "治大国若烹小鲜", chapters: ["57", "60", "61"], radius: 25 },
    { id: "养生", group: 5, desc: "深根固蒂，长生久视", chapters: ["50", "59"], radius: 20 },
    { id: "玄德", group: 1, desc: "生而不有，为而不恃", chapters: ["10", "51", "65"], radius: 20 },
    { id: "反者道之动", group: 2, desc: "事物向相反方向转化", chapters: ["40"], radius: 20 },
    { id: "上善若水", group: 3, desc: "水善利万物而不争", chapters: ["8"], radius: 20 }
  ],
  links: [
    { source: "道", target: "德", value: 5 },
    { source: "道", target: "无为", value: 4 },
    { source: "道", target: "自然", value: 4 },
    { source: "无为", target: "自然", value: 3 },
    { source: "无为", target: "治国", value: 3 },
    { source: "无为", target: "不争", value: 3 },
    { source: "柔弱", target: "不争", value: 3 },
    { source: "柔弱", target: "上善若水", value: 4 },
    { source: "不争", target: "上善若水", value: 5 },
    { source: "虚静", target: "道", value: 2 },
    { source: "虚静", target: "养生", value: 3 },
    { source: "知足", target: "养生", value: 2 },
    { source: "道", target: "反者道之动", value: 3 },
    { source: "德", target: "玄德", value: 4 },
    { source: "柔弱", target: "反者道之动", value: 2 }
  ]
}

// 颜色映射
const colorScale = d3.scaleOrdinal(d3.schemeCategory10)

const initGraph = () => {
  if (!graphContainer.value) return
  
  const width = graphContainer.value.clientWidth
  const height = graphContainer.value.clientHeight

  // 清理旧的 SVG
  d3.select(graphContainer.value).selectAll('svg').remove()

  // 创建 SVG
  svg = d3.select(graphContainer.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [0, 0, width, height])
    .style('cursor', 'grab')

  // 添加缩放行为
  zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 4])
    .on('zoom', (event) => {
      g?.attr('transform', event.transform)
    })
  
  svg.call(zoom)

  // 主容器 Group
  g = svg.append('g')

  // 力导向模拟
  simulation = d3.forceSimulation<GraphNode>(graphData.nodes)
    .force('link', d3.forceLink<GraphNode, GraphLink>(graphData.links).id(d => d.id).distance(100))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collide', d3.forceCollide().radius(d => (d as GraphNode).radius! + 10))

  // 绘制连线
  const link = g.append('g')
    .attr('stroke', '#999')
    .attr('stroke-opacity', 0.6)
    .selectAll('line')
    .data(graphData.links)
    .join('line')
    .attr('stroke-width', d => Math.sqrt(d.value))

  // 绘制节点
  const node = g.append('g')
    .selectAll('g')
    .data(graphData.nodes as GraphNode[])
    .join('g')
    .call(d3.drag<any, GraphNode>()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended))

  // 节点圆形背景
  node.append('circle')
    .attr('r', d => d.radius || 20)
    .attr('fill', d => colorScale(d.group.toString()))
    .attr('stroke', '#fff')
    .attr('stroke-width', 2)
    .style('transition', 'all 0.3s')
    .on('mouseover', function(event, d) {
      d3.select(this).attr('stroke', '#d4b483').attr('stroke-width', 4)
      hoveredNode.value = d
      updateTooltipPos(event)
    })
    .on('mousemove', updateTooltipPos)
    .on('mouseout', function() {
      d3.select(this).attr('stroke', '#fff').attr('stroke-width', 2)
      hoveredNode.value = null
    })

  // 节点文字
  node.append('text')
    .text(d => d.id)
    .attr('x', 0)
    .attr('y', 0)
    .attr('dy', '.35em')
    .attr('text-anchor', 'middle')
    .attr('fill', 'white')
    .attr('font-size', d => (d.radius || 20) / 2.5 + 'px')
    .attr('font-weight', 'bold')
    .attr('pointer-events', 'none')

  // 更新位置函数
  simulation.on('tick', () => {
    link
      .attr('x1', d => (d.source as unknown as GraphNode).x!)
      .attr('y1', d => (d.source as unknown as GraphNode).y!)
      .attr('x2', d => (d.target as unknown as GraphNode).x!)
      .attr('y2', d => (d.target as unknown as GraphNode).y!)

    node
      .attr('transform', d => `translate(${d.x},${d.y})`)
  })

  loading.value = false
}

// 拖拽相关函数
const dragstarted = (event: any, d: GraphNode) => {
  if (!event.active) simulation?.alphaTarget(0.3).restart()
  d.fx = d.x
  d.fy = d.y
  svg?.style('cursor', 'grabbing')
}

const dragged = (event: any, d: GraphNode) => {
  d.fx = event.x
  d.fy = event.y
}

const dragended = (event: any, d: GraphNode) => {
  if (!event.active) simulation?.alphaTarget(0)
  d.fx = null
  d.fy = null
  svg?.style('cursor', 'grab')
}

// 更新提示框位置
const updateTooltipPos = (event: MouseEvent) => {
  // 简单的边界处理
  const x = event.offsetX + 20
  const y = event.offsetY + 20
  tooltipPos.value = { x, y }
}

// 重置视图
const resetZoom = () => {
  svg?.transition().duration(750).call(zoom!.transform, d3.zoomIdentity)
}

// 生命周期钩子
onMounted(() => {
  // 延迟一点初始化以确保容器已有尺寸
  setTimeout(initGraph, 100)
  
  // 监听窗口大小变化
  window.addEventListener('resize', initGraph)
})

onUnmounted(() => {
  window.removeEventListener('resize', initGraph)
  simulation?.stop()
})
</script>

<style scoped>
/* 可以在这里覆盖 D3 的默认样式或添加特定样式 */
</style>