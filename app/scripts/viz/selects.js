var d3 = require('d3');
var $ = require('jquery');
var datahandler = require('./datahandler');

var personSelectLabel = 'Person auswählen';
var organisationSelectLabel = 'Person auswählen';


function init(){
  var data = datahandler.getData(),
    selectPerson = d3.select('#select-person'),
    selectOrganisation = d3.select('#select-organisation'),
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
  $('#select-person').on('change', function(e){
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

  $('#select-organisation').on('change', function(e){
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