var utils = require('../utils');
var shared = require('./shared');
var data = {};
var sektorTypes = {};
var chapters = {};

var orgaSorting = {
  de: [
      'US-Handelsbehörde (USTR)',
      'Öffentlicher Arbeitgeber (US)',
      'Privater Arbeitgeber',
      'Öffentlicher Arbeitgeber (EU)',
      'Europäische Kommission'
      ],
  en: [
    'Office of the U.S. Trade Representative (USTR)',
    'Public sector (US)',
    'Private sector',
    'Public Sector (EU)',
    'European Commission'
  ]
};
var orgaPersons = {};

var translations ={
  publicSector: {
    de: 'Öffentlicher Arbeitgeber',
    en: 'Public sector',
  },
  commission: {
    de: 'Europäische Kommission',
    en: 'European Commission',
  },
  commissionOther: {
    de: 'Europäische Kommission Sonstige',
    en: 'European Commission Other',
  },
  directorateGeneral: {
    de: 'Generaldirektion',
    en: 'Directorate-General',
  },
  since: {
    de: 'seit',
    en: 'since'
  },
  until: {
    de: 'bis',
    en: 'until'
  }
};

function init(d, lang){

  var publicSector = translations.publicSector[lang];
  var commission =  translations.commission[lang];
  var commissionOther = translations.commissionOther[lang];
  var directorateGeneral = translations.directorateGeneral[lang];

  // handle person data
  var persons = getPersonsAsArray(d.persons);

  persons.forEach(function(person){
    // add attributes we need for the visualization
    person.isEU = person.ttip_party === 'EU';
    person.orgaIds = [];
    person.id = person.name;

    person.jobs.forEach(function(job){

      job.sektorType = '';

      if(job.sektor){

        if(job.sektor === publicSector){
          job.sektor = person.isEU ? job.sektor + ' (EU)' : job.sektor + ' (US)';
          job.sektorType = job.organisation;
        }else if(job.sektor === commission){

          if(job.organisation.indexOf(directorateGeneral) !== -1){
            job.sektorType = job.organisation;
          }else{
            job.sektorType = commissionOther;
          }
        }else{
          job.sektorType = job.sektor;
        }

        person.orgaIds.push(job.sektorType);

        var color = person.isEU ? shared.personColors.euColor : shared.personColors.usColor;

        if(utils.isUndefined(orgaPersons[job.sektorType])){
          orgaPersons[job.sektorType] = [{name : person.name, isEU : person.isEU , color : color }]
        }else{
          if(!isPersonInList(person, job.sektorType)){
            orgaPersons[job.sektorType].push({name : person.name, isEU : person.isEU, color : color });
          }
        }

      }

      job.color = shared.orgaColors[lang][job.sektor];

      // count organisations
      if(utils.isUndefined(sektorTypes[job.sektorType]) && job.sektorType){
        sektorTypes[job.sektorType] = {
          count : 1,
          sektor : job.sektor
        };
      }else{
        sektorTypes[job.sektorType].count += 1;
      }

      // add proper dateLabel we use to display in the list
      job.dateLabel = '';

      var fromSplit = job.from.split('-'),
          toSplit = job.to.split('-');

      if(job.from && !job.to){
        job.dateLabel = translations.since[lang] + ' ' + fromSplit[0];
      }else if(!job.from && job.to){
        job.dateLabel = translations.until[lang] + ' ' + toSplit[0];
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

    // remove empty chapters
    if(person.chapters.length === 1 && !person.chapters[0]){
      person.chapters = [];
    }

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

  // handle person in organisation data (we need this for drawing the connections)

  var personsInOrganisations = [];

  persons.forEach(function(person){
    person.jobs.forEach(function(job){
      var count = sektorTypes[job.sektorType].count,
        sortIndex = orgaSorting[lang].indexOf(job.sektor);

      if(sortIndex !== -1){
        personsInOrganisations.push({
          id: job.sektorType,
          orgaName: job.organisation,
          pId: person.name,
          count: count,
          sortIndex : sortIndex,
          isSubSektor: job.isSubSektor
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

  for (var sektorType in sektorTypes) {

    var sektorData = sektorTypes[sektorType],
      count = sektorData.count,
      sortIndex = orgaSorting[lang].indexOf(sektorData.sektor);

    if(sortIndex !== -1){
      organisations.push({
        id: sektorType,
        sektor : sektorData.sektor,
        count: count,
        sortIndex : sortIndex,
        persons : orgaPersons[sektorType]
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
  // we slice the arrays to clone them
  return {
    persons : data.persons.slice(0),
    personsInOrganisations : data.personsInOrganisations.slice(0),
    organisations : data.organisations.slice(0),
    chapters: data.chapters
  };
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

function getPersonByName(name){
  var personList = data.persons,
    length = personList.length,
    foundPerson = null;

  for(var i = 0; i < length; i++){
    var currentPerson = personList[i];
    if(currentPerson.name === name){
      foundPerson = currentPerson;
      break;
    }
  }

  return foundPerson;
}

function getOrgaById(id){
  var orgaList = data.organisations,
    length = orgaList.length,
    foundOrga = null;

  for(var i = 0; i < length; i++){
    var currentOrga = orgaList[i];
    if(currentOrga.id === id){
      foundOrga = currentOrga;
      break;
    }
  }

  return foundOrga;
}

module.exports = {
  init : init,
  getData : getData,
  getPersonByName: getPersonByName,
  getOrgaById: getOrgaById
}
