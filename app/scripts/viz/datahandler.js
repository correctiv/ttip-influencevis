var utils = require('../utils');
var data = {};
var organisationCounts = {};
var chapters = {};

var orgaSorting = ['US-Handelsbehörde (USTR)','Privater Arbeitgeber', 'Öffentlicher Arbeitgeber','Europäische Kommission'];
var orgaPersons = {};

function init(d){

  // handle person data
  var persons = getPersonsAsArray(d.persons);

  persons.forEach(function(person){
    // add attributes we need for the visualization
    person.isEU = person.ttip_party === 'EU';
    person.radius = 4; 
    person.orgaIds = [];
    person.id = person.name;

    
    person.jobs.forEach(function(job){

      if(job.sektor){
        person.orgaIds.push(job.sektor);

        if(utils.isUndefined(orgaPersons[job.sektor])){
          orgaPersons[job.sektor] = [{name : person.name, isEU : person.isEU , color : person.isEU ? shared.personColors.euColor : shared.personColors.usColor }]
        }else{
          if(!isPersonInList(person, job.sektor)){
            orgaPersons[job.sektor].push({name : person.name, isEU : person.isEU, color : person.isEU ? shared.personColors.euColor : shared.personColors.usColor });
          }
        }

      }

      // count organisations
      if(utils.isUndefined(organisationCounts[job.sektor]) && job.sektor){
        organisationCounts[job.sektor] = 1;
      }else{
        organisationCounts[job.sektor]++;
      }

      // add proper dateLabel we use to display in the list
      job.dateLabel = '';

      var fromSplit = job.from.split('-'),
        toSplit = job.to.split('-')

      if(job.from && !job.to){
        job.dateLabel = 'seit ' + fromSplit[0];
      }else if(!job.from && job.to){
        job.dateLabel = 'bis ' + toSplit[0];
      }else if(job.from && job.to){

        var toYear = toSplit[0],
          fromYear = fromSplit[0];

        if(toYear === fromYear){
          job.dateLabel = toYear;
        }else{
          job.dateLabel = fromYear + ' - ' + toYear;
        }

      }

    });

    person.hasJobs = person.jobs.length > 0;
    person.hasChapters = person.chapters.length > 0;

    // handle chapter data
    person.chapters.forEach(function(chapterName){

      if(utils.isUndefined(chapters[chapterName])){
        chapters[chapterName] = [person.name];
      }else if(!utils.isUndefined(chapters[chapterName])){
        chapters[chapterName].push(person.name);
      }
    });

  });

  // handle person in organisation data (small parts of the organisation)
  
  var personsInOrganisations = [];

  persons.forEach(function(person){
    person.jobs.forEach(function(job){
      var count = organisationCounts[job.organisation],
        sortIndex = orgaSorting.indexOf(job.sektor);

      if(sortIndex !== -1){
        personsInOrganisations.push({
          id: job.sektor, 
          orgaName: job.organisation,
          pId: person.name,
          count: count,
          sortIndex : sortIndex
        });
      }
    });

  });


  // handle organisation data
  var organisations = [];

  for(var orgaId in orgaPersons){
    var list = orgaPersons[orgaId];

    list = list.sort(function(a, b){
      return b.isEU - a.isEU;
    });

  }
  
  for (var orgaId in organisationCounts) {
    var count = organisationCounts[orgaId],
      sortIndex = orgaSorting.indexOf(orgaId);

    if(sortIndex !== -1){
      organisations.push({
        id: orgaId,
        count: count,
        sortIndex : sortIndex,
        persons : orgaPersons[orgaId]
      });     
    }
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

function isPersonInList(person, sektor){

  var isInList = false,
    list = orgaPersons[sektor],
    listLength = list.length;

  for(var i = 0; i < listLength; i++){
    var listPerson = list[i];
    if(listPerson.name === person.name){
      isInList = true;
      break;
    }
  }

  return isInList;

}


module.exports = {
  init : init,
  getData : getData
}