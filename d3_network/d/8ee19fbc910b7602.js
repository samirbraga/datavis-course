// https://observablehq.com/d/8ee19fbc910b7602@118
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Similar Song Network

Songs similar to one another according to [last.fm](http://www.last.fm/api) are linked together. Song nodes are sized based on playcounts, and colored by artist.

Data from [last.fm](http://www.last.fm/api/show/track.getSimilar). Some songs include additional links for effect.<br/>Popular songs are defined as those with playcounts above the median for all songs in network. This example is a simpler version of the [tutorial](http://flowingdata.com/2012/08/02/how-to-make-an-interactive-network-visualization/)</a> by [Jim Vallandingham](http://vallandingham.me/).

Música e artista da raiz são Lady Gaga: Poker Face`
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
  const simulation = forceSimulation(nodes, links).on("tick", ticked)
  const circleRadius = d3.scaleSqrt().domain(d3.extent(nodes, d => d.playcount)).range([2, 20])
  
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
    .attr("r", d => circleRadius(d.playcount))
    .call(drag(simulation))
  
  node.append("title")
    .text(d => d.artist + ": " + d.name)
  
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
d3.json('https://gist.githubusercontent.com/emanueles/7b7723386677bb13763208216fd89c1f/raw/d09478158ba0fe8aa616deee8bcfe908bba17f15/songs.json')
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
