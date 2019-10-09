// https://observablehq.com/@samirbraga/les-miserables-network@148
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Les Miserables Network`
)});
  main.variable(observer("forceSimulation")).define("forceSimulation", ["d3"], function(d3){return(
function forceSimulation(nodes, links) {
  return d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id).distance(50))
    .force("charge", d3.forceManyBody().strength(-50).distanceMax(270))
    .force("center", d3.forceCenter())
}
)});
  main.variable(observer("buildvis")).define("buildvis", ["d3","DOM","dataset","forceSimulation"], function(d3,DOM,dataset,forceSimulation)
{
  const width = 960
  const height = 800
  
  const svg = d3.select(DOM.svg(width, height))
                .attr("viewBox", [-width / 2, -height / 2, width, height])
  
  const { nodes, links } = dataset
  
  const neighbordById = {}

  nodes.forEach(n => {
    neighbordById[n.id] = 0
  })
  
  links.forEach(({ source, target }) => {
    neighbordById[source.id] += 1;
    neighbordById[target.id] += 1;
  });
  
  nodes.forEach(n => {
    n.degree = neighbordById[n.id]
  })

  const simulation = forceSimulation(nodes, links).on("tick", ticked)
  const circleRadius = d3.scaleSqrt().range([3, 15]).domain(d3.extent(nodes, d => d.degree))
  const colorScale = d3.scaleOrdinal()
  .domain([...Array(10).keys()])
  .range([
    'cornflowerblue', 'wheat', 'gold', 'lemon', 'magenta', 'acqua', 'brown', 'cyan', 'cadetblue', 'chartreuse', 'red'
  ])
  
  const link = svg.append("g")
    .selectAll("line")
    .data(links)
    .enter()
    .append("line")
    .attr("class", "link")
  
  const node = svg.append("g")
    .selectAll("circle")
    .data(nodes)
    .enter()
    .append("circle")
    .attr("class", "node")
    .attr("fill", d => colorScale(d.group))
    .attr("r", d => circleRadius(d.degree))
    .call(drag(simulation))
  
  node.append("title")
    .text(d => d.id + ": " + d.degree + " " + (d.degree === 1 ? "conexão" : "conexões"))
  
  function ticked() {
    link.attr("x1", d => d.source.x)
        .attr("x2", d => d.target.x)
        .attr("y1", d => d.source.y)
        .attr("y2", d => d.target.y)
    
    node.attr("cx", d => d.x)
        .attr("cy", d => d.y)
  }
  
  function drag(simulation){
    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
    }

    function dragged(d) {
      d.fx = d3.event.x
      d.fy = d3.event.y
    }

    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(0)
      d.fx = null
      d.fy = null
    }

    return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended)
  }
  
  // Once we append the vis elments to it, we return the DOM element for Observable to display above.
  return svg.node()
}
);
  main.variable(observer("dataset")).define("dataset", ["d3"], function(d3){return(
d3.json('https://gist.githubusercontent.com/emanueles/1dc73efc65b830f111723e7b877efdd5/raw/2c7a42b5d27789d74c8708e13ed327dc52802ec6/lesmiserables.json')
)});
  main.variable(observer()).define(["html"], function(html){return(
html`Esta célula contém os estilos da visualização.
<style>
line.link {
  fill: none;
  stroke: #ddd;
  stroke-opacity: 0.8;
  stroke-width: 1.5px;
}
<style>`
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require('d3')
)});
  return main;
}
