var d3 = require('d3');
var Hogan = require('hogan');

var infoArea = d3.select('.viz-info-content');
var personTemplate = null;
var organisationTemplate = null;
var introTemplate = null;

function setPersonData(data){ 
  infoArea.html(personTemplate.render(data));
}

function setOrganisationData(data){ 
  infoArea.html(organisationTemplate.render(data));
}

function reset(){
  infoArea.html(introTemplate.render());
}

function init(){
  personTemplate = Hogan.compile(d3.select('#template-info-person').html());
  organisationTemplate = Hogan.compile(d3.select('#template-info-organisation').html());
  introTemplate = Hogan.compile(d3.select('#template-info-intro').html());
  reset();
}

module.exports = {
  init : init,
  reset : reset,
  setPersonData : setPersonData,
  setOrganisationData : setOrganisationData
};