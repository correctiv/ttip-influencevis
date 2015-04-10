var $ = require('jquery');
var Hogan = require('hogan');

var infoArea, infoWrapper;

var personTemplate = null;
var organisationTemplate = null;
var introTemplate = null;

function setPersonData(data){
  infoArea.html(personTemplate.render(data));
  infoWrapper.classed('active', true);
}

function setOrganisationData(data){
  infoArea.html(organisationTemplate.render(data));
  infoWrapper.classed('active', true);
}

function reset(){
  infoArea.html(introTemplate.render());
  infoWrapper.classed('active', false);
}

function init(container){
  infoWrapper = container.select('.viz-info');
  infoArea = container.select('.viz-info-content');
  var closeButton = container.select('.viz-info-close');

  personTemplate = Hogan.compile(container.select('.template-info-person').html());
  organisationTemplate = Hogan.compile(container.select('.template-info-organisation').html());
  introTemplate = Hogan.compile(container.select('.template-info-intro').html());

  $(document).on('click', '.viz-info-close' , function(){
    $(document).trigger({type : 'reset'});
  });

  reset();
}

module.exports = {
  init : init,
  reset : reset,
  setPersonData : setPersonData,
  setOrganisationData : setOrganisationData
};
