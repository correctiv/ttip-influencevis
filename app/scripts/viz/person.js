var d3 = require('d3');
var utils = require('../utils');
var shared = require('./shared');
var infoArea = require('./info');
var tooltip = require('./tooltip');
var dataHandler = require('./datahandler');

var data = null;
var svg = null;
var personNodes = null;

var euColor = '#db2e4c';
var usColor = '#284bdd';
var unknownColor = '#ddd';
var unknownPersonCount = 120;

var activePerson = null;

var force = d3.layout.force()
  .size([shared.width, shared.height])
  .gravity(0.3)
  .charge(-125)
  .on('tick', tick);

var x = d3.scale.ordinal()
  .domain(d3.range(2))
  .rangePoints([shared.width * .45 - (shared.radius * .5), shared.width * .55 + (shared.radius * .5)], 1);

function init(svgBase) {

  svg = svgBase;
  data = dataHandler.getData();

  // add data we need for the visualization
  addDataAttributes();
  // add grey dots
  addUnknownPersons();

  personNodes = createPersonNodes()
  
  // add eventhandler
  personNodes.on({
      mouseenter: handleMouseEnter,
      mouseleave: handleMouseOut,
      mousemove: handleMouseMove,
      click: handleClick
    })

  // do a transition at the beginning
  personNodes
    .transition()
    .duration(750)
    .delay(function(d, i) { return i * 7; })
    .attrTween('r', function(d) {
      var i = d3.interpolate(0, d.radius);
      return function(t) { return d.radius = i(t); };
    });  

  // handle force
  force.nodes(data.persons).start();  

  shared.dispatch.on('reset.person', function(){
    activePerson = null;
  });
}

function handleClick(d){

  // inactivate all active persons and organisations
  shared.resetActiveOrganisation();
  shared.resetActivePerson();

  // organisation is already active. 
  if(activePerson && activePerson === d.name){
    activePerson = null;
    infoArea.reset();

    return false;
  }

  activePerson = d.name;

  d3.select(this)
    .style({
      stroke: '#555',
      'stroke-width' : '3px'
    });

  infoArea.setPersonData(d);
}

function handleMouseMove(){
   var point = d3.mouse(this);
   tooltip.setPosition({x: point[0], y: point[1] });
}

function handleMouseEnter(e) {

  // do nothing if it's a grey dot 
  if(e.isUnknown){
    return false;
  }

  // update infoarea
  //infoArea.setPersonData(e);
  tooltip.show('person', { title : e.name, subtitle : e.ttip_institution, count : e.jobs.length });

  // reduce opacity of all other nodes
  personNodes
    .filter(function(p) {
      return p.id !== e.id;
    })
    .style({
      opacity: .25
    })

  // create links
  var links = [];
  
  d3.selectAll('.person-in-organisation')
    // select all parts of the organisation of the hovered person
    .filter(function(p) {
      return p.data.pId === e.id;
    })
    .style({
      stroke: '#eee',
      fill: function(d) {
        return shared.color(d.data.id);
      },
      'stroke-width': 1
    })
    .each(function(d){
      var link = shared.getLink(svg, d);
      links.push(link);
    });

  shared.drawConnections(svg, links);

}

function handleMouseOut(e) {

  tooltip.hide();


  d3.selectAll('.person-in-organisation')
    .style({
      stroke: 'none',
      fill: 'none'
    });

  personNodes.style('opacity', 1);

  svg.selectAll('.connection')
    .remove();
}

function resize(){
  force.size([shared.width, shared.height]);
  x.rangePoints([shared.width * .45 - (shared.radius * .5), shared.width * .55 + (shared.radius * .5)], 1);

  force.start();
}

function createPersonNodes(parent){

  var circleGroup = appendPersonGroup();

  return circleGroup.selectAll('.person')
    .data(data.persons)
    .enter()
    .append('circle')
    .classed('person', true)
    .classed('person-unknown', function(d){
      return d.isUnknown;
    })
    .attr('id', function(d){
      return 'person-' + utils.slugify(d.name);
    })
    .attr('r', function(d){
      return 0;
    })
    .style({
      opacity: 1,
      fill: function(d) {
        if(d.isUnknown){
          return unknownColor;
        }
        return d.isEU ? euColor : usColor;
      }
    });
}

function appendPersonGroup(){
  return svg
    .append('g')
    .classed('person-group', true)
    .attr('mask', 'url("#mask-circle")')
}

function addDataAttributes() {
  data.persons.forEach(function(person) {
    person.cx = x(person.isEU ? 1 : 0);
    person.cy = shared.height * .5;
  });
}

function addUnknownPersons(){

  for(var i = 0; i < unknownPersonCount; i++){
    data.persons.push({ 
      isEu : Math.random() > .5 , 
      cx : x( Math.random() > .5 ? 1 : 0 ), 
      cy : shared.height * .5, 
      isUnknown : true, 
      radius : 4 })
  }

}

function tick(e) {
  svg.selectAll('.person')
    .each(gravity(.2 * e.alpha))
    //.each(collide(.02))
    .attr({
      cx :function(d) {
        return d.x;
      },
      cy : function(d) {
      return d.y;
      }
    });
}

function collide(alpha) {

  var quadtree = d3.geom.quadtree(data.persons);
  var collidePadding = 15;

  return function(d) {

    var r = d.radius + collidePadding,
      nx1 = d.x - r,
      nx2 = d.x + r,
      ny1 = d.y - r,
      ny2 = d.y + r;
    quadtree.visit(function(quad, x1, y1, x2, y2) {
      if (quad.point && (quad.point !== d)) {
        var x = d.x - quad.point.x,
          y = d.y - quad.point.y,
          l = Math.sqrt(x * x + y * y),
          r = d.radius + quad.point.radius + collidePadding;
        if (l < r) {
          l = (l - r) / l * (alpha*2);
          d.x -= x *= l;
          d.y -= y *= l;
          quad.point.x += x;
          quad.point.y += y;
        }
      }

      return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
    });
  };
}

function gravity(alpha) {
  return function(d) {
    d.y += (d.cy - d.y) * (alpha);
    d.x += (d.cx - d.x) * (alpha);
  };
}

module.exports.init = init;