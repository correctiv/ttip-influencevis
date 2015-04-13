var utils = require('../utils');
var d3 = require('d3');
var Hogan = require('hogan');

var tooltip;
var tooltipTemplatePerson = null;
var tooltipTemplateOrganisation = null;

var offset = {
  x : 10,
  y : 0
};

// compiles template and init tooltip dom element
function init(container, lang){
  tooltipTemplatePerson = Hogan.compile(container.select('.template-tooltip-person_' + lang).html());
  tooltipTemplateOrganisation = Hogan.compile(container.select('.template-tooltip-organisation_' + lang).html());

  tooltip = container
    .append('div')
    .attr('class', 'tooltip');
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
