var utils = require('../utils');
var d3 = require('d3');
var Hogan = require('hogan');

var tooltip = null
var tooltipTemplatePerson = null;
var tooltipTemplateOrganisation = null;

var offset = {
  x : 10,
  y : 0
};

// compiles template and init tooltip dom element
function init(){
  tooltipTemplatePerson = Hogan.compile(d3.select('#template-tooltip-person').html());
  tooltipTemplateOrganisation = Hogan.compile(d3.select('#template-tooltip-organisation').html());

  tooltip = d3.select('.viz')
    .append('div')
    .attr('id', 'tooltip');
}

// display tooltip template. Type has to be person or organisation.
function show(type, params){

  var template = type === 'person' ? tooltipTemplatePerson : tooltipTemplateOrganisation;

  tooltip
    .html(template.render(params))
    .style('display', 'block');

  // we set the offset so that the cursor is in the left bottom corner of the tooltip
  offset.y = -parseInt(tooltip.style('height'));
}

function hide(){
  tooltip.style('display', 'none');
}

function setPosition(params){

  params.x = params.x || 0;
  params.y = params.y || 0;

  tooltip.style({
    top : (params.y + offset.y) + 'px',
    left: (params.x + offset.x) + 'px'
  });
}

module.exports = {
  init : init,
  hide : hide,
  show: show,
  setPosition: setPosition
}