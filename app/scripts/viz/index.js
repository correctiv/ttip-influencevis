var d3 = require('d3');


d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
  this.parentNode.appendChild(this);
  });
};

function init(container, path){
  var shared = require('./shared');
  container = d3.select(container);
  shared.container = container;
  var svg = shared.createBaseSVG(container);

  var infoArea = require('./info');
  var tooltip = require('./tooltip');

  infoArea.init(container);
  tooltip.init(container);

  var dataHandler = require('./datahandler');
  var organisation = require('./organisation');
  var person = require('./person');
  var selects = require('./selects');


  shared.appendCircleMask(svg);
  shared.appendChapterCircleGroup(svg);
  shared.appendConnectionGroup(svg);


  // here we can specify if a certain person or organisation should be preselected
  var activePerson = null;
  var activeOrganisation = null;

  d3.json(path + 'data/ttip.json', function(err, data) {
    dataHandler.init(data);
    organisation.init(svg, data);
    person.init(svg, activePerson, activeOrganisation);
    selects.init(container);
  });
}


module.exports.init = init;
