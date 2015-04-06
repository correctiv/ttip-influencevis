var d3 = require('d3');
var $ = require('jquery');
var Hogan = require('hogan');

var infoWrapper = d3.select('.viz-info');
var infoArea = d3.select('.viz-info-content');
var closeButton = d3.select('.viz-info-close');

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

function init(){

  personTemplate = Hogan.compile(d3.select('#template-info-person').html());
  organisationTemplate = Hogan.compile(d3.select('#template-info-organisation').html());
  introTemplate = Hogan.compile(d3.select('#template-info-intro').html());
  
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