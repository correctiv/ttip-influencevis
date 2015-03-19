var d3 = require('d3');
var shared = require('./shared');
var infoArea = require('./info');
var dataHandler = require('./datahandler');
var tooltip = require('./tooltip');

var svg = null;
var data = null;
var arc = d3.svg.arc()
  .outerRadius(shared.radius - 15)
  .innerRadius(shared.radius - 70);

var activeOrganisation = null;

var pieSort = function(a, b) {
  var n = b.count - a.count;
  if (n) {
    return n;
  }

  if(b.id < a.id){
    return -1;
  }else if(b.id > a.id){
    return 1;
  }else{
    return 0;
  }
}

var piePersonInOrga = d3.layout.pie()
  .sort(pieSort)
  .value(function(d) {
    return 1;
  });

var pieOrga = d3.layout.pie()
  .sort(pieSort)
  .value(function(d) {
    return d.count;
  });

var line = d3.svg.line()
  .x(function(d) {
    return d[0];
  })
  .y(function(d) {
    return d[1];
  })
  .interpolate('basis');


function init(baseSvg, d) {

  svg = baseSvg;
  data = dataHandler.getData();

  arcs = svg.append('g')
    .attr('transform', 'translate(' + shared.width / 2 + ',' + shared.height / 2 + ')');

  arcs.selectAll('.organisation')
    .data(pieOrga(data.organisations))
    .enter()
    .append('path')
    .classed('organisation', true)
    .attr('d', arc)
    .style({
      fill: function(d) {
        return shared.color(d.data.id);
      },
      opacity: .8
    })
    .on({
      mouseenter: handleMouseEnter,
      mouseleave: handleMouseOut,
      mousemove: handleMouseMove,
      click: handleClick
    });

  // add organisations
  arcs.selectAll('.person-in-organisation')
    .data(piePersonInOrga(data.personsInOrganisations))
    .enter()
    .append('path')
    .classed('person-in-organisation', true)
    .attr('d', arc)
    .style('fill', 'none');

  shared.dispatch.on('reset.organisation', function(){
    activeOrganisation = null;
  });

}

function handleClick(d){

  // inactivate all active persons and organisations
  shared.resetActiveOrganisation();
  shared.resetActivePerson();

  // organisation is already active. 
  if(activeOrganisation && activeOrganisation === d.data.name){
    activeOrganisation = null;
    infoArea.reset();

    return false;
  }

  activeOrganisation = d.data.name;
  
  d3.select(this)
    .style({
      stroke: '#555',
      'stroke-width' : '3px'
    });

  infoArea.setOrganisationData(d.data);
}

function handleMouseMove(){
  var point = d3.mouse(this);
  tooltip.setPosition({x: point[0] + shared.width / 2 , y: point[1] + shared.height / 2  });
}

function handleMouseEnter(e) {

  tooltip.show('organisation', { title : e.data.name, count : e.data.count});

  var activeOrgaId = e.data.id;

  var links = [];

  d3.selectAll('.person-in-organisation')
    .filter(function(d) {
      return d.data.id === e.data.id;
    })
    .each(function(d) {
      var link = shared.getLink(svg, d);
      links.push(link);
    });

  shared.drawConnections(svg, links);

  d3.selectAll('.person')
    .style('opacity', 1)
    .filter(function(p) {
      if (typeof p.orgaIds === 'undefined') {
        return false;
      }

      return p.orgaIds.indexOf(activeOrgaId) === -1;
    })
    .style('opacity', .25);

}

function handleMouseOut(e) {

  tooltip.hide();

  d3.selectAll('.person')
    .style('opacity', 1);

  svg.selectAll('.connection')
    .remove();
}


module.exports.init = init;