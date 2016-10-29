//NOTE: You need Auth with twitter API 1.1 to do anything, so sadly this code won't work w/o it. 
//Feel free to plug in your auth into twitterAuth.js or email me directly. 

var express = require('express'); 
var app = express(); 
var server = require('http').createServer(app); 
var io = require('socket.io')(server); 
var redis = require('redis'); 
var redisClient = redis.createClient(); 
var twitter = require('./twitterAuth'); 
var messages = [], tweets = [], name, tweet, thisTweet; 


var storeMessages = function(name, tweet){
  var tweets = JSON.stringify({name: name, tweet: tweet}); 
 // Stringify to easily send to Redis, then lpush to push to redis list, ltrim to cut the list to the first 50 items
  redisClient.lpush("tweetStore", tweets, function(err, response){
    redisClient.ltrim("tweetStore", 0, 50); 
  }); 
}; 

// Client's initial connection to server/logging on
io.on('connection', function(client){
  redisClient.lrange('tweetStore', 0, -1, function(err, messages){
    messages = messages.reverse(); 
    messages.forEach(function(el){  
      message = JSON.parse(el); 
      client.emit('messages', message.name, message.tweet);
    }); 
  });
  
  //when user searches for tweets by content
  client.on('messages', function(query){
    tweets = []; // Remove any pre-existing tweets from the array for clean display
    // Twitter package to reach out and grab tweets
    twitter.stream('statuses/filter', {track: query}, function(stream){
      stream.on('data', function(data){
        // Collecting twitter handle and tweet
        for (var x in data){
          if (x === 'user'){
            for (var y in data[x]){
              if (y === 'screen_name') {
                name = data[x][y];  
              }
            }
          }
        }
        for (var z in data){
          if (z === 'text') {
            tweet = data[z]; 
            tweets.push({name: name, tweet: tweet}); 
            storeMessages(name, tweet); 
          }
        }
      });
      // 3 second setTimeout to allow for collection of tweets based on user input 
      setTimeout(function(){
        stream.destroy(); 
        tweets.forEach(function(el){
          client.broadcast.emit('messages', el.name, el.tweet); 
          client.emit("messages", el.name, el.tweet); 
        }); 
      }, 3000); 
    }); 
  }); 

  // Random collection of recent tweets
  client.on('rando', function(){
    tweets = []; 
    twitter.stream('statuses/sample', {}, function(stream){  
      stream.on('data', function(data){
        for (var x in data){
          if (x === 'user'){
            for (var y in data[x]){
              if (y === 'screen_name') {
                name = data[x][y];  
              }
            }
          }
        }
        for (var z in data){
          if (z === 'text') {
            tweet = data[z]; 
            tweets.push({name: name, tweet: tweet}); 
            storeMessages(name, tweet); 
          }
        }
      });
        // 3 second setTimeout to allow for collection of tweets based on user input 
      setTimeout(function(){
        stream.destroy(); 
        tweets.forEach(function(el){
          client.broadcast.emit('messages', el.name, el.tweet); 
          client.emit("messages", el.name, el.tweet); 
        }); 
      }, 3000); 
    }); 
  }); 

  // Gather 7 tweets from a specific user given twitter handle
  // used twitter.get because streams do not apply to user timelines
  client.on('user', function(query){
    tweets = []; 
    twitter.get('https://api.twitter.com/1.1/statuses/user_timeline/' + query + '.json', { count: 7 }, function(err, params, data){     
      if (err) console.log('err', err);
      else {
        //Got different object back using .get instead of .stream, so traversing code for tweet and handle is different
        data = JSON.stringify(data); 
        data = JSON.parse(data); 
        for (var x in data) {
          if (x ==='body') {
            data[x] = JSON.parse(data[x]); 
            for (var i = 0; i < 7; i++){ 
              console.log('text', data[x][i].text);
              console.log('user', data[x][i].user.screen_name); 
              name = data[x][i].user.screen_name; 
              tweet = data[x][i].text; 
              tweets.push({name: name, tweet: tweet}); 
              storeMessages(name, tweet); 
            }
          }
        } 
      }
      });
        // 3 second setTimeout to allow for collection of tweets based on user input 
      setTimeout(function(){
        tweets.forEach(function(el){
          client.broadcast.emit('messages', el.name, el.tweet); 
          client.emit("messages", el.name, el.tweet); 
        }); 
      }, 3000); 
   }); 

  // When user clicks 'delete all stored tweets' button 
  client.on('delete', function(data){
    redisClient.del("tweetStore");
    client.emit("delete",  "All tweets deleted!"); 
    });

}); 
 

// Serving files
app.get('/', function(req, res){
  res.sendFile(__dirname + '/twitterSearch.html'); 
}); 

app.get('/twitterSearchStyle.css', function(req, res){
  res.set('Content-Type', 'text/css; charset=UTF-8');
  res.status(200);
  res.sendFile(__dirname + '/twitterSearchStyle.css'); 
}); 

app.get('/twitterSearch.js', function(req, res){
  res.set('Content-Type', 'application/javascript; charset=UTF-8');
  res.status(200);
  res.sendFile(__dirname + '/twitterSearch.js'); 
}); 

server.listen(8000, function(){
  console.log('up on 8000'); 
}); 
