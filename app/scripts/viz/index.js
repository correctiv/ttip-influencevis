var d3 = require('d3');


d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
  this.parentNode.appendChild(this);
  });
};

function init(container, config){
  var path = config.path;
  var lang = config.lang || 'de';
  if (lang !== 'de' && lang !== 'en') {
    lang = 'de';
  }

  var shared = require('./shared');
  container = d3.select(container);
  shared.container = container;
  shared.lang = lang;

  var svg = shared.createBaseSVG(container, lang);

  var infoArea = require('./info');
  var tooltip = require('./tooltip');

  infoArea.init(container, lang);
  tooltip.init(container, lang);

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

  d3.json(path + 'data/ttip_' + lang + '.json', function(err, data) {
    dataHandler.init(data, lang);
    organisation.init(svg, lang);
    person.init(svg, activePerson, activeOrganisation);
    selects.init(container);
  });
}


module.exports.init = init;
