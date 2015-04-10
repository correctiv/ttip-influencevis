var d3 = require('d3');
var $ = require('jquery');
var utils = require('../utils');
var shared;
var infoArea = require('./info');
var tooltip = require('./tooltip');
var dataHandler = require('./datahandler');

var data = null;
var svg = null;
var personNodes = null;

var unknownPersonCount = 120;

var svgWidth = 0;
var charge = -120;
var personRaduis = 4;
var chapterTitleOffset = 20;

var force = d3.layout.force();
var x = d3.scale.ordinal();

function init(svgBase, activePerson, activeOrganisation) {
  shared = require('./shared');

  force.size([shared.dim.width, shared.dim.height])
    .gravity(0.3)
    .on('tick', tick);
  x.domain(d3.range(2))
    .rangePoints([shared.dim.width * .45 - (shared.dim.radius * .5), shared.dim.width * .55 + (shared.dim.radius * .5)], 1);


  svg = svgBase;
  data = dataHandler.getData();

  svgWidth = parseInt(svg.attr('width'))

  if(svgWidth < 400){
    charge = -25;
    personRaduis = 2;
    chapterTitleOffset = 10;
  }else if(svgWidth < 600){
    charge = -50;
    personRaduis = 3;
    chapterTitleOffset = 15;
  }else if(svgWidth < 700){
    charge = -100;
    personRaduis = 4;
    chapterTitleOffset = 15;
  }

  force.charge(charge)
    .on('end', function(){
      if(activePerson){
        var personData = dataHandler.getPersonByName(activePerson);
        if(personData){
          handleClick(personData);
        }
      }else if(activeOrganisation){
        $(document).trigger('activate:organisation', { organisation : activeOrganisation });
      }
    });

  // add data we need for the visualization
  data.persons.forEach(function(person) {
    person.cx = x(person.isEU ? 1 : 0);
    person.cy = shared.dim.height * .5;
  });
  // add grey dots
  addUnknownPersons();

  personNodes = createPersonNodes()

  // add eventhandler
  personNodes.on({
      mouseenter: handleMouseEnter,
      mouseleave: handleMouseOut,
      mousemove: handleMouseMove,
      click: handleClick
    });

  // do a transition at the beginning
  personNodes
    .transition()
    .duration(750)
    .delay(function(d, i) { return i * 7; })
    .attrTween('r', function(d) {
      var i = d3.interpolate(0, personRaduis);
      return function(t) { return d.radius = i(t); };
    });

  // handle force
  force.nodes(data.persons).start();

  bindEvents();

}

function handleClick(e){

  if(e.isUnknown){
    return false;
  }

  // inactivate all active persons and organisations
  shared.resetActiveOrganisation();
  shared.resetActivePerson();
  shared.resetActiveChapterPersons();

  // organisation is already active.
  if(shared.activePerson && shared.activePerson === e.name){
    shared.activePerson = null;
    infoArea.reset();

    return false;
  }

  shared.activePerson = e.name;
  shared.activeOrganisation = null;

  var personSelection = shared.container.select('#person-' + utils.slugify(e.name));

  personSelection
    .style({
      stroke: '#555',
      'stroke-width' : '3px',
      opacity : 1
    })
    .attr({
      cx : e.oldX,
      cy : e.oldY
    });

  infoArea.setPersonData(e);

  svg.selectAll('.connection')
    .remove();

  drawLinks(e);

  handleChapter(personSelection, e);
}

function handleMouseMove(e){
  var point = d3.mouse(this);
  tooltip.setPosition({x: point[0], y: point[1] });
}

function handleMouseEnter(e) {

  // do nothing if it's a grey dot
  if(e.isUnknown){
    return false;
  }

  // update tooltip
  tooltip.show('person', { title : e.name, subtitle : e.ttip_institution, count : e.jobs.length });

  if(!shared.activePerson && !shared.activeOrganisation){
    drawLinks(e);
  }
}

function handleMouseOut(e) {

  tooltip.hide();

  if(shared.activePerson || shared.activeOrganisation){
    return false;
  }

  personNodes.style('opacity', 1);

  svg.selectAll('.connection')
    .remove();
}


function handleChapter(currentPerson, e){

  var chapterPersons = [];

  e.chapters.forEach(function(chapterName){
    chapterPersons = chapterPersons.concat(data.chapters[chapterName]);
  });

  if(!utils.isUndefined(chapterPersons) && chapterPersons.length > 1){

    var currentCenter = [e.oldX, e.oldY];

    var nodesToMove = svg.selectAll('.person')
      .filter(function(d){
        return d.name !== e.name && chapterPersons.indexOf(d.name) !== -1;
      })
      .style('opacity', 1)
      .classed('chapter-person', true)
      .each(function(d){
        d.cx = d.x - currentCenter[0] > 0 ? currentCenter[0] + 10 : currentCenter[0] - 10;
        d.cy = d.y - currentCenter[1] > 0 ? currentCenter[1] + 10 : currentCenter[1] - 10;
      });

    force.stop();

    shared.chapterForce
      .nodes([])
      .on('tick', function(d){
        nodesToMove
          .each(collide(nodesToMove.data(), .3))
          .each(gravity(1 * d.alpha))
          .attr({
            cx :function(d) {
              return d.x;
            },
            cy : function(d) {
              return d.y;
            }
          });
      })
      .start();

    svg.select('.person-group')
      .append('circle')
      .classed('chapter-circle', true)
      .attr({
        cx : currentCenter[0] ,
        cy : currentCenter[1] ,
        r : 50
      })
      .style({
        fill : '#f3f3f3',
        stroke : '#ddd',
        'stroke-dasharray' : '3, 3'
      });

    var isPointRight = currentCenter[0] > (svgWidth/2),
      chapterTitleLeft = isPointRight ? currentCenter[0] - (200 + chapterTitleOffset) : currentCenter[0] + chapterTitleOffset;

    shared.container.selectAll('.chapter-title')
      .style({
        left : chapterTitleLeft + 'px',
        top : (currentCenter[1] + chapterTitleOffset) + 'px',
        display : 'block',
        'text-align': isPointRight ? 'right' : 'left'
      })
      .html(e.chapters.join(', '));


    svg.selectAll('.connection').moveToFront();
    nodesToMove.moveToFront();
    currentPerson.moveToFront();

  }
}

function drawLinks(e){
  // reduce opacity of all other nodes
  personNodes
    .filter(function(p) {
      return p.id !== e.id;
    })
    .style({
      opacity: .25
    });

  // create links
  var links = [];

  shared.container.selectAll('.person-in-organisation')
    // select all parts of the organisation of the hovered person
    .filter(function(p) {
      return p.data.pId === e.id;
    })
    .each(function(d){
      var link = shared.getLink(svg, d);
      links.push(link);
    });

  shared.drawConnections(svg, links);
}

function resize(){
  force.size([shared.dim.width, shared.dim.height]);
  x.rangePoints([shared.dim.width * .45 - (shared.dim.radius * .5), shared.dim.width * .55 + (shared.dim.radius * .5)], 1);

  force.start();
}

function bindEvents(){

  $(document).on('activate:person', function(evt){
    var personData = dataHandler.getPersonByName(evt.person);
    handleClick(personData);
  });

  // eventhandler if you click on a person in the organisation template
  $(document).on('click', '.info-organisation-person', function(){
      var personName = $(this).text(),
        personData = dataHandler.getPersonByName(personName);

    handleClick(personData);
  });
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
    .attr({
      id : function(d){
        return 'person-' + utils.slugify(d.name);
      },
      r : 0
    })
    .style({
      opacity: 1,
      fill: function(d) {
        if(d.isUnknown){
          return shared.personColors.unknownColor;
        }
        return d.isEU ? shared.personColors.euColor : shared.personColors.usColor;
      }
    });
}

function appendPersonGroup(){
  return svg
    .append('g')
    .classed('person-group', true)
    .attr('mask', 'url("#mask-circle")')
}

function addUnknownPersons(){

  for(var i = 0; i < unknownPersonCount; i++){
    data.persons.push({
      isEu : Math.random() > .5 ,
      cx : x( Math.random() > .5 ? 1 : 0 ),
      cy : shared.dim.height * .5,
      isUnknown : true,
      radius : 4 })
  }

}

function tick(e) {
  svg.selectAll('.person')
    .each(gravity(.2 * e.alpha))
    //.each(collide(.02))
    .each(function(d){
      d.oldX = d.x;
      d.oldY = d.y;
    })
    .attr({
      cx :function(d) {
        return d.x;
      },
      cy : function(d) {
      return d.y;
      }
    });
}

function collide(d, alpha) {

  var quadtree = d3.geom.quadtree(d);
  var collidePadding = 15;

  return function(d) {
    if(d.fixed){
      return false;
    }

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
    if(d.fixed){
      return false;
    }

    d.y += (d.cy - d.y) * (alpha);
    d.x += (d.cx - d.x) * (alpha);
  };
}



module.exports.init = init;
