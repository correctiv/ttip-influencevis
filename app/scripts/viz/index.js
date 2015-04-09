var d3 = require('d3');


d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
  this.parentNode.appendChild(this);
  });
};

function init(container, path){
  var shared = require('./shared');
  var svg = shared.createBaseSVG(container);

  var infoArea = require('./info');
  var tooltip = require('./tooltip');
  var dataHandler = require('./datahandler');
  var organisation = require('./organisation');
  var person = require('./person');
  var selects = require('./selects');

  infoArea.init(shared);
  tooltip.init();

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
    selects.init();
  });
}


module.exports.init = init;
