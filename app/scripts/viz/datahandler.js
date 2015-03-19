var utils = require('../utils');
var data = {
 
};

var organisationCounts = {};
var chapters = {};

function init(d){

  // handle person data
  var persons = getPersonsAsArray(d.persons);

  persons.forEach(function(person){
    // add attributes we need for the visualization
    person.isEU = person.ttip_party === 'EU';
    person.radius = 4 + (person.jobs.length * 1.2);
    person.orgaIds = [];
    person.id = person.name;

    // count organisations
    person.jobs.forEach(function(job){
      person.orgaIds.push(job.organisation);
      if(utils.isUndefined(organisationCounts[job.organisation])){
        organisationCounts[job.organisation] = 1;
      }else{
        organisationCounts[job.organisation]++;
      }
    });

    // handle chapter data
    if(person.ttip_chapter && utils.isUndefined(chapters[person.ttip_chapter])){
      chapters[person.ttip_chapter] = [person.name];
    }else if(person.ttip_chapter && !utils.isUndefined(chapters[person.ttip_chapter])){
      chapters[person.ttip_chapter].push(person.name);
    }

    // sort jobs alphabetically
    person.jobs.sort(function(a,b){
      if(a.organisation < b.organisation){
        return -1;
      }else if(a.organisation > b.organisation){
        return 1;
      }else{
        return 0;
      }
    });
  });


  // handle person in organisation data (small parts of the organisation)
  
  var personsInOrganisations = [];

  persons.forEach(function(person){
    person.jobs.forEach(function(job){
      var count = organisationCounts[job.organisation];

      personsInOrganisations.push({
        id: job.organisation, 
        pId: person.name,
        count: count
      });
    });

  });

  // handle organisation data
  var organisations = [];
  
  for (var orgaId in organisationCounts) {
    var count = organisationCounts[orgaId];
    organisations.push({
      id: orgaId, 
      name: orgaId,
      count: count
    });
  }

  // set data variable
  data = {
    persons : persons,
    personsInOrganisations : personsInOrganisations,
    organisations : organisations,
    chapters: chapters
  };

}

function getData(){
  return data;
}

function getPersonsAsArray(persons){

  var personsArray = [];

  for(var personName in persons){
    var person = persons[personName];
    personsArray.push(person);
  }

  return personsArray;


}

function countOrganisations(){

}

module.exports = {
  init : init,
  getData : getData
}