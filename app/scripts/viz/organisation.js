var d3 = require('d3');
var $ = require('jquery');
var shared; // init later;
var infoArea = require('./info');
var dataHandler = require('./datahandler');
var tooltip = require('./tooltip');
var utils = require('../utils');

var svg = null;
var data = null;
var arc = d3.svg.arc();

var pieSort = function(a, b) {

  if(b.sortIndex < a.sortIndex){
    return -1;
  }else if(b.sortIndex > a.sortIndex){
    return 1;
  }

  if(b.count < a.count){
    return -1;
  }else if(b.count > a.count){
    return 1;
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

function init(baseSvg, lang) {
  shared = require('./shared');

  arc.outerRadius(shared.dim.radius - 15)
     .innerRadius(shared.dim.radius - shared.getPieRadius());

  svg = baseSvg;
  data = dataHandler.getData();

  arcs = svg.append('g')
    .attr('transform', 'translate(' + shared.dim.width / 2 + ',' + shared.dim.height / 2 + ')');

  arcs.selectAll('.organisation')
    .data(pieOrga(data.organisations))
    .enter()
    .append('path')
    .classed('organisation', true)
    .attr({
      d : arc,
      id : function(d){
        return 'organisation-' + utils.slugify(d.sektorType);
      }
    })
    .style({
      fill: function(d) {
        return shared.orgaColors[lang][d.data.sektor];
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

  bindEvents();
}

function handleClick(e){

  // inactivate all active persons and organisations
  shared.resetActiveOrganisation();
  shared.resetActivePerson();
  shared.resetActiveChapterPersons();

  // organisation is already active.
  if(shared.activeOrganisation && shared.activeOrganisation === e.data.id){
    shared.activeOrganisation = null;
    infoArea.reset();
    return false;
  }

  shared.activeOrganisation = e.data.id;
  shared.activePerson = null;

  var orgaSelection = shared.container.select('.organisation-' + e.data.sektorType);

  orgaSelection
    .style({
      stroke: '#555',
      'stroke-width' : '3px'
    });

  infoArea.setOrganisationData(e.data);

  svg.selectAll('.connection')
    .remove();

  drawLinks(e);
}

function handleMouseMove(e){
  var point = d3.mouse(this);
  tooltip.setPosition({x: point[0] + shared.dim.width / 2 , y: point[1] + shared.dim.height / 2  });
}

function handleMouseEnter(e) {

  tooltip.show('organisation', { title : e.data.id, count : e.data.count});

  if(!shared.activeOrganisation && !shared.activePerson){
    drawLinks(e);
  }

}

function drawLinks(e){
  var activeOrgaId = e.data.id;

  var links = [];

  shared.container.selectAll('.person-in-organisation')
    .filter(function(d) {
      return d.data.id === e.data.id;
    })
    .each(function(d) {
      var link = shared.getLink(svg, d);
      links.push(link);
    });

  shared.drawConnections(svg, links);

  shared.container.selectAll('.person')
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

  if(shared.activeOrganisation || shared.activePerson){
    return false;
  }

  shared.container.selectAll('.person').style('opacity', 1);
  svg.selectAll('.connection').remove();
}

function bindEvents(){
  // eventhandler if you click on a organisation in the person template
  $(document).on('click', '.info-person-organisation', function(){
    var sektorName = $(this).find('.sektor-name').text(),
        orgaData = dataHandler.getOrgaById(sektorName);
    handleClick({data : orgaData});
  });

  $(document).on('activate:organisation', function(evt){
    var orgaData = dataHandler.getOrgaById(evt.organisation);
    handleClick({data : orgaData});
  });
}

module.exports.init = init;
