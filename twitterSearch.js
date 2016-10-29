//Using sockets to send information back and forth between client/server/twitter
// On page load, required 
$(function(){
  // Provides randomized colors for twitter handles and tweets cause it's a search PARTY! (sorry)
  function getRandomColor() {
      var letters = '0123456789ABCDEF';
      var color = '#';
      for (var i = 0; i < 6; i++ ) {
          color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
  }

  var socket = io.connect('http://localhost:8080'); 
  socket.on('connect', function(data){
    $('#status').html('Twitter Search Party!'); 
  }); 
  //Upon retrieving tweets/twitter handles, display them to the user like so
  socket.on('messages', function(name, tweet){
      $('#game-box').prepend('<p id="tweetbox" style="color:' + getRandomColor() + '"><b>' + name + '</b>: <span style="color:' + getRandomColor() + '">' + tweet + '</span></p>');
  });
   // When user clicks 'search twitter by content' button 
  $('#contentSearch').click(function(e){
    var message = $('#chat').val(); 
     $('#search').text('Searching twitter for ' + message).css('color', '#00aced');
     setTimeout(function(){
      $('#search').text('');
     },3000); 
      socket.emit('messages', message); 
  });
  // When user clicks 'search twitter by user' button 
  $('#userSearch').click(function(e){
    var user = $('#user').val(); 
     $('#search').text('Searching twitter for ' + user + '\'s tweets').css('color', '#00aced');
     setTimeout(function(){
      $('#search').text('');
     },3000); 
      socket.emit('user', user); 
  });   
  // When user clicks 'get random recent tweets' button 
  $('#rando').click(function(e){
    var user = $('#user').val(); 
     $('#search').text('Searching twitter for recent tweets').css('color', '#00aced');
     setTimeout(function(){
      $('#search').text('');
     },3000); 
      socket.emit('rando'); 
  }); 
    // When user clicks 'delete stored tweets' button 
    $('#delete').click(function(e){
    var test = $('#chat').val(); 
    socket.emit('delete', test); 
  }); 
   socket.on('delete', function(data){
     $('#status1').text(data);
     setTimeout(function(){
    $('#status1').fadeOut(1500, function(){
      $('#status1').html('').fadeIn(1500); 
    }); 
     }, 1500);
      $('#game-box').html(''); 
   });   
}); 