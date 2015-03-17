var d3 = require('d3');
var shared = require('./shared');
var infoArea = require('./info');
var dataHandler = require('./datahandler');

var svg = null;
var data = null;
var arc = d3.svg.arc()
  .outerRadius(shared.radius - 15)
  .innerRadius(shared.radius - 70);


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
      mouseleave: handleMouseOut
    });

  // add organisations
  arcs.selectAll('.person-in-organisation')
    .data(piePersonInOrga(data.personsInOrganisations))
    .enter()
    .append('path')
    .classed('person-in-organisation', true)
    .attr('d', arc)
    .style('fill', 'none');

}

function handleMouseEnter(e) {
  infoArea.setOrganisationData(e.data);

  d3.select(this)
    .style('stroke', '#555');

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

  infoArea.reset();

  d3.select(this)
    .style('stroke', '#fff');

  d3.selectAll('.person')
    .style('opacity', 1);

  svg.selectAll('.connection')
    .remove();
}


module.exports.init = init;