// require express and path
var express = require("express");
var path = require("path");
// create the express app
var app = express();
app.set('port', (process.env.PORT || 5000));
var messages = [];
var users = {};
// static content 
app.use(express.static(path.join(__dirname, "./static")));
// setting up ejs and our views folder
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
// root route to render the index.ejs view
app.get('/', function(req, res) {
 res.render("index");
})
// tell the express app to listen on port 8000
var server = app.listen(app.get('port'), function() {
  console.log('Node app is runing on port', app.get('port'));
});

var io=require("socket.io").listen(server);
io.sockets.on("connection", function(socket){
  socket.on("got_a_new_user", function(data){
    users[socket.id] = data.name;
    // users.push({socketID: socket.id, name: data.name});
    io.emit("update_users", {users: users});
    var new_message = data.name + " has joined the chat";
    socket.emit("initial_messages", {messages: messages});
    // messages.push(new_message);
    socket.broadcast.emit("new_user", {message: new_message});
    
  })
  console.log("We are using sockets");
  console.log(socket.id);

  socket.on("message_submit", function(data){
    console.log(data.message);
    messages.push(data.message);
    io.emit("new_message", {message: data.message});
  })
  socket.on("disconnect", function(){
    var new_message = users[socket.id] + " has disconnected.";
    // messages.push(new_message);
    delete users[socket.id];
    io.emit("update_users", {users: users});
    socket.broadcast.emit("user_disconnected", {message: new_message});
    

  })

});