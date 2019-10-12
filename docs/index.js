const INITIAL_SRC = `N M
1 2
2 3
3 1`

const parse = src => {
  const lines =
    src.split(/\r\n|\n/)
      .map(line => line.trim().split(/[\t 　]+/))
      .filter(items => items.length >= 2)

  const rev = {}
  const vertices = []
  const edges = []

  const addVertex = v => {
    if (rev[v] === undefined) {
      const index = vertices.length
      vertices.push(v)
      rev[v] = index
    }

    return vertices[rev[v]]
  }

  for (const items of lines.slice(1)) {
    const u = addVertex(items[0])
    const v = addVertex(items[1])
    const w = items[2] // edge label

    edges.push([u, v, w])
  }

  return {
    vertices,
    edges,
  }
}

let svgGroup = undefined

const renderGraph = ({ vertices, edges }) => {
  const g = new dagreD3.graphlib.Graph()
    .setGraph({})
    .setDefaultEdgeLabel(() => ({}))

  for (const v of vertices) {
    g.setNode(v, { label: v, shape: "circle" })
  }

  for (const [u, v, w] of edges) {
    g.setEdge(u, v, { label: w })
  }

  const render = new dagreD3.render()

  const svg = d3.select("#preview-figure")

  if (!svgGroup) {
    svgGroup = svg.append("g")
  }

  render(d3.select("svg g"), g)

  const width = Math.max(100, window.innerWidth - 100)
  svg.attr("width", width)

  var offsetX = (width - g.graph().width) / 2;
  svgGroup.attr("transform", "translate(" + offsetX + ", 20)");
  svg.attr("height", g.graph().height + 40);
}

const update = src => {
  const graph = parse(src)
  renderGraph(graph)
}

const main = () => {
  const editInputElement = document.getElementById("edit-input")

  const currentSrc = () => editInputElement.value

  let tick = 0
  window.addEventListener("resize", () => {
    const theTick = ++tick

    setTimeout(() => {
      if (tick === theTick) { // debounce
        window.requestAnimationFrame(() => {
          update(currentSrc())
        })
      }
    }, 160)
  })

  editInputElement.addEventListener("input", ev => {
    const src = ev.target.value
    update(src)
  })

  editInputElement.textContent = INITIAL_SRC
  update(INITIAL_SRC)
}

document.addEventListener("DOMContentLoaded", () => main())
