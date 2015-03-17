var d3 = require('d3');

var svg = null;

var width = window.innerWidth,
  height = window.innerHeight,
  radius = Math.min(width, height) / 2;

var force = d3.layout.force()
  .size([width, height])
  .gravity(0.01)
  .charge(1)
  .on('tick', tick)

var nodes = null;
var color = d3.scale.category20c();

var arc = d3.svg.arc()
  .outerRadius(radius - 15)
  .innerRadius(radius - 70);

var pieTransparent = d3.layout.pie()
  .sort(function(a, b){
    var n = b.count - a.count;
    if(n){
      return n;
    }
    return b.id - a.id;
  })
  .value(function(d) { 
    return 1; 
  });

var pie = d3.layout.pie()
  .value(function(d){
    return d.count;
  });

function tick(e) {
  svg.selectAll('.person')
    .each(gravity(.4 * e.alpha))
    .each(collide(.2))
    .attr('cx', function(d) { return d.x; })
    .attr('cy', function(d) { return d.y; });
}

function gravity(alpha) {
  return function(d) {
    d.y += (d.cy - d.y) * alpha;
    d.x += (d.cx - d.x) * alpha;
  };
}

// Resolve collisions between nodes.
function collide(alpha) {
  var quadtree = d3.geom.quadtree(personData);
  var padding = 15;
  return function(d) {
    var r = d.radius + padding,
        nx1 = d.x - r,
        nx2 = d.x + r,
        ny1 = d.y - r,
        ny2 = d.y + r;
    quadtree.visit(function(quad, x1, y1, x2, y2) {
      if (quad.point && (quad.point !== d)) {
        var x = d.x - quad.point.x,
            y = d.y - quad.point.y,
            l = Math.sqrt(x * x + y * y),
            r = d.radius + quad.point.radius + padding;
        if (l < r) {
          l = (l - r) / l * alpha;
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

function init(){

  svg = d3.select('#visualization')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
  
  var innerRad = arc.innerRadius()();

  svg
    .append('defs')
    .append('mask')
    .attr('id', 'mask-circle')
    .append('circle')
    .attr('r', arc.innerRadius()())
    .attr('cx', width / 2)
    .attr('cy', height / 2)
    .style('fill', '#fff');


  var x = d3.scale.ordinal()
    .domain(d3.range(2))
    .rangePoints([width * .45 - (innerRad * .5), width * .55 + (innerRad * .5)], 1);   

  arcs = svg.append('g')
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

  d3.json('data/cleaned-data.json', function(error, data) {

    var pieTransparentData = [],
      pieData = [];

    data.persons.forEach(function(el, ii){
      el.radius = 5;
      el.isEU = Math.random() > .5;
      el.cluster = el.isEU;
      el.cx = x(el.isEU ? 1 : 0);
      el.cy = height * .5;
      el.orgaIds = [];
      el.x = width * .5;
      el.y = height / 2 ;
      el.organisations.forEach(function(o){
        var count = data.organisations[o.id] 
        pieTransparentData.push({ id : count === 1 ? 1 : o.id, pId : el.id, count : data.organisations[o.id] });
        el.orgaIds.push(o.id);
      });
    });

    personData = data.persons;


    for(var p in data.organisations){
      var count = data.organisations[p];
      pieData.push({ id : count === 1 ? 1 : p, count : count });
    }

    arcs.selectAll('.organisation')
      .data(pie(pieData))
      .enter()
      .append('path')
      .classed('organisation', true)
      .attr('d', arc)
      .style({
        fill: function(d) { 
          return color(d.data.id); 
        },
        opacity: .8
      })
      .on({
        mouseenter: function(e){
          d3.select(this)
            .style('stroke', '#555');

          nodes.filter(function(p){
            return p.orgaIds.indexOf(parseInt(e.data.id)) === -1;
          })
          .style('opacity', .25);

        },
        mouseout: function(){

          d3.select(this)
            .style('stroke', '#fff');

          nodes.style('opacity', 1);
        }
      });

    // add organisations
    arcs.selectAll('.person-in-organisation')
      .data(pieTransparent(pieTransparentData))
      .enter()
      .append('path')
      .classed('person-in-organisation', true)
      .attr('d', arc)
      .style('fill', 'none');

    // add persons
    var circleGroup = svg
      .append('g')
      .classed('circles', true)
      .attr('mask', 'url("#mask-circle")')

    var nodes = circleGroup.selectAll('circle')
      .data(data.persons)
      .enter()
      .append('circle')
      .attr('r', 7)
      .classed('person', true)
      
      .style('opacity', 0)
      .style('fill', function(d){
        return d.isEU ? 'red' : 'blue';
      });

    nodes
      .on({
        mouseenter : function(d){

          nodes
            .filter(function(p){
              return p.id !== d.id;
            })
            .style({
              opacity : .25
            })


          d3.selectAll('.person-in-organisation')
            .filter(function(p){
              return p.data.pId === d.id;
            })
            .style('stroke','#eee')
            .style('fill', function(d) {
                return color(d.data.id); 
            })
            .style('stroke-width', 1)
        },
        mouseout : function(){

          d3.selectAll('.person-in-organisation')
            .style('stroke', 'none')
            .style('fill', 'none');

          nodes
            .style({
                opacity : 1
              })
        }
      });

    nodes.transition()
      .duration(250)
      //.delay(400)
      .style('opacity', 1);

    // handle force
    force.nodes(data.persons)
    force.start();
    
  });

}


module.exports.init = init;