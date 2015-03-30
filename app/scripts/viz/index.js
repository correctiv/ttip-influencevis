var d3 = require('d3');
var shared = require('./shared');
var infoArea = require('./info');
var tooltip = require('./tooltip');
var dataHandler = require('./datahandler');
var organisation = require('./organisation');
var person = require('./person');
var shared = require('./shared');

function init(){

  infoArea.init(shared);
  tooltip.init();

  var svg = shared.createBaseSVG();
  shared.appendCircleMask(svg);
  shared.appendChapterCircleGroup(svg);
  shared.appendConnectionGroup(svg); 

    
  d3.json('data/ttip.json', function(err, data) { 
    dataHandler.init(data);
    organisation.init(svg, data);
    person.init(svg, data);
  });
}


module.exports.init = init;