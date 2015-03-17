// here we store some shared functions that persons and organisations need

var d3 = require('d3');
var utils = require('../utils');

var width = parseInt(d3.select('#visualization').style('width')),
  height = parseInt(d3.select('#visualization').style('height')),
  radius = Math.min(width, height) / 2;

var diagonal = d3.svg.diagonal();

var innerArc = d3.svg.arc()
  .outerRadius(radius - 70)
  .innerRadius(radius - 70);

function appendCircleMask(svg) {
  svg
    .append('defs')
    .append('mask')
    .attr('id', 'mask-circle')
    .append('circle')
    .attr('r', radius - 70)
    .attr('cx', width / 2)
    .attr('cy', height / 2)
    .style('fill', '#fff');
}

function appendConnectionGroup(svg){
   svg.append('g')
    .classed('connection-group', true);  
}

function createBaseSVG() {
  return d3.select('#visualization')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
}

function drawConnections(svg, links) {

  d3.select('.connection-group')
    .selectAll('.connection')
    .data(links)
    .enter()
    .append('path')
    .classed('connection', true)
    .attr('stroke', '#aaa')
    .attr('stroke-width', 1)
    .attr('fill', 'none')
    .attr('d', diagonal);
}

function getLink(svg, d){

  var arcCentroid = innerArc.centroid(d),
    person = svg.select('#person-' + utils.slugify(d.data.pId)),
    personCentroid = [ parseFloat(person.attr('cx')), parseFloat(person.attr('cy'))]

    arcCentroid[0] += width / 2;
    arcCentroid[1] += height / 2;

    return {target : { x :arcCentroid[0], y : arcCentroid[1] }, source : { x : personCentroid[0], y : personCentroid[1] }};
}

// public functions
module.exports = {
  color : d3.scale.category20c(),
  appendCircleMask : appendCircleMask,
  appendConnectionGroup : appendConnectionGroup,
  createBaseSVG : createBaseSVG,
  drawConnections: drawConnections,
  getLink: getLink,
  width: width,
  height: height,
  radius: radius
};