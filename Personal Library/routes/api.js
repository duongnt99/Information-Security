/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        if (err) res.json({"message": "db connection error", "error": err});
  
        var query = {};
        db.collection("personallibrary_books").find(query, {_id: 1, title: 1, comments: 1}).toArray(function(err, doc) {
          if (err) res.json({"message": "Error occurred while finding", "error": err});
          if(doc !== null && doc !== undefined && doc.length > 0){
            for(var i=0;i<doc.length;i++) {
              doc[i].commentcount = doc[i].comments.length;
              delete doc[i].comments;
            }
            res.json(doc);
          }else{
            res.json({"message": "no book exists"});
          }
          db.close();
        });
                      
      });
    })
    
    .post(function (req, res){
      var title = req.body.title;
      //response will contain new book object including atleast _id and title
    
      if(!title){
        res.json({"error": "title is empty!"});
      }else{
        MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
          if (err) res.json({"message": "db connection error", "error": err});

          var query = { title: title, comments: [] };
          db.collection("personallibrary_books").insertOne(query, function(err, doc) {
            if (err) res.json({"message": "Error occurred while inserting", "error": err});
            res.json(doc.ops[0]);
            db.close();
          });

        });
      }
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
    
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        if (err) res.json({"message": "db connection error", "error": err});
  
        var query = {};
        db.collection("personallibrary_books").deleteMany(query, function(err, doc) {
          if (err) res.json({"message": "Error occurred while deleting", "error": err});
          console.log(doc);
          res.json({"message": "complete delete successful"});
          db.close();
        });
        
      });
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        if (err) res.json({"message": "db connection error", "error": err});
  
        var query = {"_id" : bookid.length === 24 ? ObjectId(bookid) : bookid };
        db.collection("personallibrary_books").findOne(query, function(err, doc) {
          if (err) res.json({"message": "Error occurred while finding", "error": err});
          
          if(doc !== null && doc !== undefined){
            //console.log(doc);
            res.json(doc);
          }else{
            res.json({"message": "could not found", "_id": bookid});
          }
          
          db.close();
        });
        
      });
      
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get
      
      if(!comment){
        res.json({"error": "comment is empty!"});
      }else{
        MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
          if (err) res.json({"message": "db connection error", "error": err});

          var query = {"_id" : bookid.length === 24 ? ObjectId(bookid) : bookid };
          //var query = {"_id" : new ObjectId(bookid)};
          db.collection("personallibrary_books").findOneAndUpdate(query, { $push: {comments: comment } }, function(err, doc) {
            if (err) res.json({"message": "Error occurred while finding", "error": err});

            if(doc !== null && doc !== undefined){
              doc.value.comments.push(comment);
              console.log(doc.value);
              res.json(doc.value);
            }else{
              res.json({"message": "could not found or update", "_id": bookid});
            }

            db.close();
          });

        });
      }
      /*
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        if (err) res.json({"message": "db connection error", "error": err});
  
        var query = {"_id" : bookid.length === 24 ? ObjectId(bookid) : bookid };
        db.collection("personallibrary_books").findOne(query, function(err, doc) {
          if (err) res.json({"message": "Error occurred while finding", "error": err});
          
          if(doc !== null && doc !== undefined){
            
            db.collection("personallibrary_books").updateOne(query, { $push: {comments: comment } }, function(err, doc) {
              if (err) res.json({"message": "Error occurred while updating", "error": err});
              res.json(doc.ops[0]);
            });
            
          }else{
            res.json({"message": "could not found", "_id": bookid});
          }
          
          db.close();
        });
        
      });
      */
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        if (err) res.json({"message": "db connection error", "error": err});
  
        var query = {"_id" : bookid.length === 24 ? ObjectId(bookid) : bookid };
        db.collection("personallibrary_books").deleteOne(query, function(err, doc) {
          if (err) res.json({"message": "Error occurred while deleting", "error": err});
          console.log(doc);
          res.json({"message": "delete successful", "_id": bookid});
          db.close();
        });
        
      });
    });
  
};
