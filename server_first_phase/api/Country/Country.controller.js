'use strict';

var _ = require('lodash');
var Country = require('./Country.model');
var parseXlsx = require('excel');

//reading excel data
exports.exceldataread =  function(req, res){
  parseXlsx('./file/state_country.xlsx', 2, function(err, data) {
    if(err){ return handleError(res, err); }
    if(data.length > 0){
      var arr = [];
      var count = 0;
      console.log(">>>>>>>>>>>>>>>>",data.length);
      data.forEach(function(element, index){
        //adding data function
        addingdata(req, res, element, function(dataobj){
          count++;
            if(dataobj){
              arr.push(dataobj);
            }
            if(count == data.length){
              res.status(200).json(arr);
            }
        })
      })
    }else{
      res.status(200).json("no data found");
    }
  });
}

//adding countrys into database
function addingdata(req, res, doc, callback){
  req.body.Country = doc[0];
  req.body.CountryCode = doc[1];
  Country.create(req.body, function(err, data){
    if(err){ return handleError(res, err); }
    callback(data);
  })

}

// Get list of Countrys
exports.index = function(req, res) {
  Country.find({},{CountryCode: 0, Status: 0}).lean().sort({Country: 1}).exec(function (err, Countrys) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(Countrys);
  });
};

// Get a single Country
exports.show = function(req, res) {
  Country.findById(req.params.id, function (err, Country) {
    if(err) { return handleError(res, err); }
    if(!Country) { return res.status(404).send('Not Found'); }
    return res.json(Country);
  });
};

// Creates a new Country in the DB.
exports.create = function(req, res) {
  Country.create(req.body, function(err, Country) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(Country);
  });
};

// Updates an existing Country in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Country.findById(req.params.id, function (err, Country) {
    if (err) { return handleError(res, err); }
    if(!Country) { return res.status(404).send('Not Found'); }
    var updated = _.merge(Country, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(Country);
    });
  });
};

// Deletes a Country from the DB.
exports.destroy = function(req, res) {
  Country.findById(req.params.id, function (err, Country) {
    if(err) { return handleError(res, err); }
    if(!Country) { return res.status(404).send('Not Found'); }
    Country.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}