var d3 = require('d3');
var Hogan = require('hogan');


var infoArea = d3.select('.viz-info-content');
var closeButton = d3.select('.viz-info-close');

var personTemplate = null;
var organisationTemplate = null;
var introTemplate = null;

function setPersonData(data){ 
  infoArea.html(personTemplate.render(data));
  closeButton.style('display', 'block');
}

function setOrganisationData(data){ 
  infoArea.html(organisationTemplate.render(data));
  closeButton.style('display', 'block');
}

function reset(){
  infoArea.html(introTemplate.render());
  closeButton.style('display', 'none');
}

function init(sharedModule){

  shared = sharedModule; // we can't require shared in this module because of circle dependencies

  personTemplate = Hogan.compile(d3.select('#template-info-person').html());
  organisationTemplate = Hogan.compile(d3.select('#template-info-organisation').html());
  introTemplate = Hogan.compile(d3.select('#template-info-intro').html());
  
  closeButton.on('click', shared.dispatch.reset);
  reset();
}

module.exports = {
  init : init,
  reset : reset,
  setPersonData : setPersonData,
  setOrganisationData : setOrganisationData
};