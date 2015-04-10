var d3 = require('d3');
var $ = require('jquery');
var datahandler = require('./datahandler');

var container;

var personSelectLabel = 'Person auswählen';
var organisationSelectLabel = 'Person auswählen';


function init(element){
  container = element;

  var data = datahandler.getData(),
    selectPerson = container.select('.select-person'),
    selectOrganisation = container.select('.select-organisation'),
    personData = data.persons.sort(personSort),
    organisationData = data.organisations.sort(organisationSort);

  personData.unshift({name : personSelectLabel});
  organisationData.unshift({id : organisationSelectLabel});

  selectPerson
    .selectAll('option')
    .data(personData)
    .enter()
    .append('option')
    .text(function(d){
      return d.name;
    });

  selectOrganisation
    .selectAll('option')
    .data(organisationData)
    .enter()
    .append('option')
    .text(function(d){
      return d.id;
    });

  bindEvents();
}

function bindEvents(){
  $('.select-person', container[0][0]).on('change', function(e){
    var activePerson = $(this).val();

    if(activePerson === personSelectLabel){
      $(document).trigger({type : 'reset'});
      return false;
    }

    $(document).trigger({
      type : 'activate:person',
      person : activePerson
    });
  });

  $('.select-organisation', container[0][0]).on('change', function(e){
    var activeOrganisation = $(this).val();

    if(activeOrganisation === organisationSelectLabel){
      $(document).trigger({type : 'reset'});
      return false;
    }

    $(document).trigger({
      type : 'activate:organisation',
      organisation : activeOrganisation
    });
  });
}

function personSort(a, b){
  if(a.name < b.name){
    return -1;
  }else if(a.name > b.name){
    return 1;
  }
  return 0;
}

function organisationSort(a, b){
  if(a.id < b.id){
    return -1;
  }else if(a.id > b.id){
    return 1;
  }
  return 0;
}

module.exports.init = init;
