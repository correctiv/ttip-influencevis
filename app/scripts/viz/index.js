var d3 = require('d3');
var shared = require('./shared');
var infoArea = require('./info');
var tooltip = require('./tooltip');
var dataHandler = require('./datahandler');
var organisation = require('./organisation');
var person = require('./person');
var selects = require('./selects');

d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
  this.parentNode.appendChild(this);
  });
};

function init(){

  infoArea.init(shared);
  tooltip.init();

  var svg = shared.createBaseSVG();
  shared.appendCircleMask(svg);
  shared.appendChapterCircleGroup(svg);
  shared.appendConnectionGroup(svg); 
  

  // here we can specify if a certain person or organisation should be preselected
  var activePerson = null;
  var activeOrganisation = null;

  d3.json('data/ttip.json', function(err, data) { 
    dataHandler.init(data);
    organisation.init(svg, data);
    person.init(svg, activePerson, activeOrganisation);
    selects.init();
  });
}


module.exports.init = init;