var $ = require('jquery');
var firebase = require('firebase');
var moment = require('moment');

//initialize firebase
var app = firebase.initializeApp({
    apiKey: "AIzaSyB3zz3KE0kciIbTF8ftRuoDoZh8OzAPMZY",
    authDomain: "train-table-5c460.firebaseapp.com",
    databaseURL: "https://train-table-5c460.firebaseio.com",
    storageBucket: "train-table-5c460.appspot.com",
    messagingSenderId: "1086915366740"
});

//get the database
var database = firebase.database();

//Load existing train data on the UI..No need as child added event will trigger this automatically
/*database.ref().once("value")
  .then(function(snapshot){
   var result = snapshot.val();
   console.log(result);
   if(result!==null){
     var index = 0;
     for(var p in result){
       console.log("The key is" + p +" value is " + result[p]);
       //Create a new row in UI with required fields
       var data=result[p];
       var nextTrainArrival = calculateNextTrainArrival(data.start_time,data.frequency);
       var arrivalMinutes = nextTrainArrival['arrivalMinutes'];
       console.log("minutes_to_arrival " + arrivalMinutes);
       var nextTrain = nextTrainArrival['nextTrain'];
       console.log("next_train_time " + nextTrain);
       index = index + 1;
       var markup = "<tr><td>"+(index)+"</td><td>"+data.train_name+"</td><td>"+data.source+"</td><td>"+data.destination+"</td><td>"
                     +arrivalMinutes+"</td><td>"+nextTrain+"</td></tr>";
        $("table > tbody").append(markup);
     }
   }
});**/

//Add a new train to database on submitting the form
$('body').on('click','#submit',function(){

 var train_name = $('#train_name').val();
 var source = $('#source').val();
 var destination = $('#destination').val();
 var start_time = $('#start_time').val();
 var frequency = $('#frequency').val();


 //validation # 1 start time should be a valid moment.js date
if(!(moment(start_time, 'HH:mm').isValid())){
  $('.validation').html("Enter your time in military format i.e. HH:MM").fadeIn(3000).fadeOut(3000);
  $('#start_time').val("");
  return console.log("start time not in hh:mm format");
}

 //add to firebase
var trainname_base64 = window.btoa(train_name);
console.log(trainname_base64);

// Test for the existence of train name key in a DataSnapshot
database.ref().once("value")
  .then(function(snapshot){
   var train = snapshot.child(trainname_base64).val();
   console.log(train);
   if(train!==null){
      $('.validation').html("Train name already exists.Please enter a new name!").fadeIn(3000).fadeOut(3000);
      $('#train_name').val("");
       return console.log("Train name already exists");
    } else{
    //database.ref().set(trainname_base64);
    database.ref('/'+trainname_base64).set({
      'train_name': train_name,
      'source': source,
      'destination':destination,
      'start_time':start_time,
      'frequency':frequency
      
  });

  }
    
  });

  //reset all input values
  $('#addTrainForm').find('input[type=text], input[type=number], input[type=date]').each(function(){
     $(this).val('');
  });


});
//Trigger child added event
database.ref().on("child_added", function(snapshot, prevChildKey) {

  var data= snapshot.val();
  console.log("train_name" + data.train_name);
  console.log("source" + data.source);
  console.log("destination" + data.destination);
  var nextTrainArrival = calculateNextTrainArrival(data.start_time,data.frequency);
  var arrivalMinutes = nextTrainArrival['arrivalMinutes'];
  console.log("minutes_to_arrival " + arrivalMinutes);
  var nextTrain = nextTrainArrival['nextTrain'];
  console.log("next_train_time " + nextTrain);
  
  //Create a new row in UI with required fields
  var rowCount = $('#table_train tr').length - 1;
  var markup = "<tr><td>"+(rowCount+1)+"</td><td>"+data.train_name+"</td><td>"+data.source+"</td><td>"+data.destination+"</td><td>"
                     +arrivalMinutes+"</td><td>"+nextTrain+"</td></tr>";
  $("table > tbody").append(markup);
  
});



//arrival minutes is a function
 
 function calculateNextTrainArrival(startTime,frequency){
   
    // First Time (pushed back 1 year to make sure it comes before current time)
    var startTimeConverted = moment(startTime, "hh:mm").subtract(2, "years");
    console.log(startTimeConverted);

    // Current Time
    var currentTime = moment();
    console.log("CURRENT TIME: " + moment(currentTime).format("hh:mm"));

    // Difference between the times
    var diffTime = moment().diff(moment(startTimeConverted), "minutes");
    console.log("DIFFERENCE IN TIME: " + diffTime);

    // Time apart (remainder)
    var tRemainder = diffTime % frequency;
    console.log(tRemainder);

    // Minute Until Train
    var tMinutesTillTrain = frequency - tRemainder;
    console.log("MINUTES TILL TRAIN: " + tMinutesTillTrain);

    // Next Train
    var nextTrain = moment().add(tMinutesTillTrain, "minutes");
    console.log("ARRIVAL TIME: " + moment(nextTrain).format("hh:mm"));

    var obj = { 'arrivalMinutes' : tMinutesTillTrain,
                'nextTrain'      : moment(nextTrain).format("hh:mm")
              }
  
    return obj;
 };

// Retrieve new posts as they are added to our database




//Trigger child update event




//Trigger child deleted event
