// here we store some shared functions that persons and organisations need

var d3 = require('d3');
var utils = require('../utils');
var infoArea = require('./info');
var dispatch = d3.dispatch('reset');

var width = parseInt(d3.select('#visualization').style('width')),
  height = parseInt(d3.select('#visualization').style('height')),
  radius = Math.min(width, height) / 2;

var diagonal = d3.svg.diagonal();

var innerArc = d3.svg.arc()
  .outerRadius(radius - 70)
  .innerRadius(radius - 70);

var activePerson = null;
var activeOrganisation = null;
var activeChapterPersons = [];

var chapterForce = d3.layout.force()
  .size([width, height])
  .gravity(.1)
  .charge(-100);

dispatch.on('reset.shared', function(){
  resetActiveOrganisation();
  resetActivePerson();
  resetActiveChapterPersons();
  infoArea.reset();
});

var personColors = {
  euColor : '#284bdd',
  usColor : '#db2e4c',
  unknownColor : '#dddddd'
}

var orgaColors = {
  'Europäische Kommission' : '#d62728',
  'Öffentlicher Arbeitgeber': '#c0c0c0',
  'Privater Arbeitgeber': '#dedede',
  'US-Handelsbehörde (USTR)': '#1f77b4'
}

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

function appendChapterCircleGroup(svg){
   svg.append('g')
    .classed('chapter-circle-group', true);  
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
    .attr('stroke', '#ccc')
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

  return {data: d.data, target : { x :arcCentroid[0], y : arcCentroid[1] }, source : { x : personCentroid[0], y : personCentroid[1] }};
}

function resetActiveOrganisation(){
  activeOrganisation = null;

  d3.selectAll('.organisation')
    .style({
      stroke: '#fff',
      'stroke-width' : '1px'
    });
}

function resetActivePerson(){
  activePerson = null;

  d3.selectAll('.person')
    .style({
      stroke: 'none'
    });
}

function resetActiveChapterPersons(){

  chapterForce.stop();

  d3.selectAll('.chapter-circle')
    .remove();

  d3.selectAll('.chapter-person')
    .classed('chapter-person', false)
    .transition()
    .duration(400)
    .attr({
      cx : function(d){
        d.x = d.oldX;
        return d.oldX;
      },
      cy : function(d){
        d.y = d.oldY;
        return d.oldY;
      }
    });
}

// public functions
module.exports = {
  color : d3.scale.category20c(),
  appendCircleMask : appendCircleMask,
  appendConnectionGroup : appendConnectionGroup,
  appendChapterCircleGroup: appendChapterCircleGroup,
  createBaseSVG : createBaseSVG,
  drawConnections: drawConnections,
  resetActiveOrganisation: resetActiveOrganisation,
  resetActivePerson: resetActivePerson,
  getLink: getLink,
  width: width,
  height: height,
  radius: radius,
  dispatch : dispatch,
  activePerson : activePerson,
  activeOrganisation : activeOrganisation,
  activeChapterPersons : activeChapterPersons,
  resetActiveChapterPersons : resetActiveChapterPersons,
  chapterForce : chapterForce,
  personColors : personColors,
  orgaColors: orgaColors
};