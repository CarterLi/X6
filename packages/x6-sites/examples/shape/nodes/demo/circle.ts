import { Graph } from '@antv/x6'
import '@antv/x6/es/index.css'

const container = document.getElementById('container')!
const graph = new Graph({
  container,
  grid: true,
})

// row 1
// -----
graph.addNode({
  shape: 'circle',
  x: 40,
  y: 40,
  width: 60,
  height: 60,
  label: 'circle',
})

graph.addNode({
  shape: 'circle',
  x: 200,
  y: 40,
  width: 60,
  height: 60,
  label: 'circle',
  attrs: {
    body: {
      stroke: '#6FC2FF',
      fill: '#E9F8FF',
    },
  },
})

graph.addNode({
  shape: 'circle',
  x: 360,
  y: 40,
  width: 60,
  height: 60,
  label: 'circle',
  attrs: {
    body: {
      stroke: '#1DA677',
      fill: '#94F5CA',
    },
  },
})

graph.addNode({
  shape: 'circle',
  x: 520,
  y: 40,
  width: 60,
  height: 60,
  label: 'circle',
  attrs: {
    body: {
      stroke: '#F7BD2D',
      fill: '#FCE6A2',
    },
  },
})

// row 2
// -----

graph.addNode({
  shape: 'circle',
  x: 40,
  y: 140,
  width: 60,
  height: 60,
  label: 'circle',
  attrs: {
    label: {
      refX: 16,
      refY: 16,
      textAnchor: 'start',
      textVerticalAnchor: 'top',
    },
  },
})

graph.addNode({
  shape: 'circle',
  x: 200,
  y: 140,
  width: 60,
  height: 60,
  label: 'circle',
  attrs: {
    body: {
      stroke: '#6FC2FF',
      fill: '#E9F8FF',
    },
    label: {
      refX: 16,
      refY: 0.5,
      textAnchor: 'start',
      textVerticalAnchor: 'middle',
    },
  },
})

graph.addNode({
  shape: 'circle',
  x: 360,
  y: 140,
  width: 60,
  height: 60,
  label: 'circle',
  attrs: {
    body: {
      stroke: '#1DA677',
      fill: '#94F5CA',
    },
    label: {
      refX: 16,
      refY: '100%',
      refY2: -16,
      textAnchor: 'start',
      textVerticalAnchor: 'bottom',
    },
  },
})

graph.addNode({
  shape: 'circle',
  x: 520,
  y: 140,
  width: 60,
  height: 60,
  label: 'circle',
  attrs: {
    body: {
      stroke: '#F7BD2D',
      fill: '#FCE6A2',
    },
    label: {
      refX: 0.5,
      refY: -4,
      textAnchor: 'middle',
      textVerticalAnchor: 'bottom',
    },
  },
})

// row 3
// -----

graph.addNode({
  shape: 'circle',
  x: 40,
  y: 240,
  width: 60,
  height: 60,
  label: 'circle',
  attrs: {
    label: {
      refX: 0.5,
      refY: 16,
      textAnchor: 'middle',
      textVerticalAnchor: 'top',
    },
  },
})

graph.addNode({
  shape: 'circle',
  x: 200,
  y: 240,
  width: 60,
  height: 60,
  label: 'circle',
  attrs: {
    body: {
      stroke: '#6FC2FF',
      fill: '#E9F8FF',
    },
    label: {
      refX: 0.5,
      refY: 0.5,
      textAnchor: 'middle',
      textVerticalAnchor: 'middle',
    },
  },
})

graph.addNode({
  shape: 'circle',
  x: 360,
  y: 240,
  width: 60,
  height: 60,
  label: 'circle',
  attrs: {
    body: {
      stroke: '#1DA677',
      fill: '#94F5CA',
    },
    label: {
      refX: 0.5,
      refY: '100%',
      refY2: -16,
      textAnchor: 'middle',
      textVerticalAnchor: 'bottom',
    },
  },
})

graph.addNode({
  shape: 'circle',
  x: 520,
  y: 240,
  width: 60,
  height: 60,
  label: 'circle',
  attrs: {
    body: {
      stroke: '#F7BD2D',
      fill: '#FCE6A2',
    },
    label: {
      refX: '100%',
      refX2: 4,
      refY: 0.5,
      textAnchor: 'start',
      textVerticalAnchor: 'middle',
    },
  },
})

// row 4
// -----

graph.addNode({
  shape: 'circle',
  x: 40,
  y: 340,
  width: 60,
  height: 60,
  label: 'circle',
  attrs: {
    label: {
      refX: '100%',
      refX2: -16,
      refY: 16,
      textAnchor: 'end',
      textVerticalAnchor: 'top',
    },
  },
})

graph.addNode({
  shape: 'circle',
  x: 200,
  y: 340,
  width: 60,
  height: 60,
  label: 'circle',
  attrs: {
    body: {
      stroke: '#6FC2FF',
      fill: '#E9F8FF',
    },
    label: {
      refX: '100%',
      refX2: -16,
      refY: 0.5,
      textAnchor: 'end',
      textVerticalAnchor: 'middle',
    },
  },
})

graph.addNode({
  shape: 'circle',
  x: 360,
  y: 340,
  width: 60,
  height: 60,
  label: 'circle',
  attrs: {
    body: {
      stroke: '#1DA677',
      fill: '#94F5CA',
    },
    label: {
      refX: '100%',
      refX2: -16,
      refY: '100%',
      refY2: -16,
      textAnchor: 'end',
      textVerticalAnchor: 'bottom',
    },
  },
})

graph.addNode({
  shape: 'circle',
  x: 520,
  y: 340,
  width: 60,
  height: 60,
  label: 'circle',
  attrs: {
    body: {
      stroke: '#F7BD2D',
      fill: '#FCE6A2',
    },
    label: {
      refX: 0.5,
      refY: '100%',
      refY2: 4,
      textAnchor: 'middle',
      textVerticalAnchor: 'top',
    },
  },
})