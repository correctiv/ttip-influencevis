// here we store some shared functions that persons and organisations need

var d3 = require('d3');
var $ = require('jquery');
var utils = require('../utils');
var infoArea = require('./info');

var dim = {
  width: 0,
  height: 0,
  radius: 0
};

var container;

var diagonal = d3.svg.diagonal();

var innerArc = d3.svg.arc();

var activePerson = null;
var activeOrganisation = null;
var activeChapterPersons = [];
var chapterForce = d3.layout.force();

$(document).on('reset', function(){
  resetActiveOrganisation();
  resetActivePerson();
  resetActiveChapterPersons();
  infoArea.reset();

  container.selectAll('.person').style('opacity', 1);
  container.selectAll('.connection').remove();
});

var personColors = {
  euColor : '#284bdd',
  usColor : '#db2e4c',
  unknownColor : '#dddddd'
};

var orgaColors = {
  de: {
    'Europäische Kommission' : '#325a7c',
    'Öffentlicher Arbeitgeber (EU)': '#3e74a0',
    'Öffentlicher Arbeitgeber (US)': '#e9473e',
    'Privater Arbeitgeber': '#808080',
    'US-Handelsbehörde (USTR)': '#db2e4c'
  },
  en: {
    'European Commission' : '#325a7c',
    'Public Sector (EU)': '#3e74a0',
    'Public sector (US)': '#e9473e',
    'Private sector': '#808080',
    'Office of the U.S. Trade Representative (USTR)': '#db2e4c'
  }
};

function appendCircleMask(svg) {
  svg
    .append('defs')
    .append('mask')
    .attr('id', 'mask-circle')
    .append('circle')
    .attr('r', dim.radius - 70)
    .attr('cx', dim.width / 2)
    .attr('cy', dim.height / 2)
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

function createBaseSVG(element) {
  container = element;
  var core = container.select('.viz-core');

  dim.width = parseInt(core.style('width'));
  dim.height = dim.width;
  dim.radius = Math.min(dim.width, dim.height) / 2;

  innerArc.outerRadius(dim.radius - 70)
          .innerRadius(dim.radius - 70);


  container.style('height', dim.height + 'px');

  chapterForce.size([dim.width, dim.height])
    .gravity(0.1)
    .charge(-100);

  return core
    .append('svg')
    .attr('width', dim.width)
    .attr('height', dim.height);
}

function drawConnections(svg, links) {

  container.select('.person-group')
    .selectAll('.connection')
    .data(links)
    .enter()
    .append('path')
    .classed('connection', true)
    .attr('stroke', '#ccc')
    .attr('stroke-width', 1)
    .attr('fill', 'none')
    .attr('d', diagonal);

  container.selectAll('.person').moveToFront();
}

function getLink(svg, d){

  var arcCentroid = innerArc.centroid(d),
    person = svg.select('#person-' + utils.slugify(d.data.pId)),
    personCentroid = [ parseFloat(person.attr('cx')), parseFloat(person.attr('cy'))]

  arcCentroid[0] += dim.width / 2;
  arcCentroid[1] += dim.height / 2;

  return {data: d.data, target : { x :arcCentroid[0], y : arcCentroid[1] }, source : { x : personCentroid[0], y : personCentroid[1] }};
}

function resetActiveOrganisation(){
  activeOrganisation = null;

  container.selectAll('.organisation')
    .style({
      stroke: '#fff',
      'stroke-width' : '1px'
    });
}

function resetActivePerson(){
  activePerson = null;

  container.selectAll('.person')
    .style({
      stroke: 'none'
    });
}

function resetActiveChapterPersons(){

  chapterForce.stop();

  container.selectAll('.chapter-circle')
    .remove();

  container.selectAll('.chapter-title')
    .style('display', 'none');

  container.selectAll('.chapter-person')
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
  dim: dim,
  activePerson : activePerson,
  activeOrganisation : activeOrganisation,
  activeChapterPersons : activeChapterPersons,
  resetActiveChapterPersons : resetActiveChapterPersons,
  chapterForce : chapterForce,
  personColors : personColors,
  orgaColors: orgaColors
};
