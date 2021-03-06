var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());


app.get('/', function(req, res){
	res.send('TODO API root');
});

//GET /todos
app.get('/todos', function(req, res){
	var query = req.query;
	var where = {};

	if(query.hasOwnProperty('completed') && query.completed === 'true')	{
		where.completed = true;
	} else if(query.hasOwnProperty('completed') && query.completed === 'false') {
		where.completed = false;
	}

	if(query.hasOwnProperty('q') && query.q.length > 0){
		where.description = {
			$like: '%' + query.q + '%'
		};
	}

	db.todo.findAll({where: where}).then(function(todos){
		res.json(todos);
	}, function(e){
		res.status(500).send('Error in Findind all');
	});
});

//GET /todos/:id
app.get('/todos/:id', function(req, res){
	var todoId = parseInt(req.params.id);

	db.todo.findById(todoId).then(function(todo){
		if(!!todo){
			res.json(todo.toJSON());
		}else {
			res.status(404).send('Item not found');
		}

	}, function(e){
		res.status(500).send('*****Internal Server Error*******');
	});
});

//POST /todos
app.post('/todos', function(req, res){
	var body = _.pick(req.body, 'description', 'completed');
	
	body.description = body.description.trim();

	console.log(body);

	db.todo.create(body).then(function(todo){
		res.json(todo.toJSON());
	}, function(e){
		res.status(400).json(e);
		console.log(e);
	});

});

//DELETE /todos/:id

app.delete('/todos/:id', function(req, res){
	var todoId = parseInt(req.params.id);

	db.todo.destroy({
		where: {
			id: todoId
		}
	}).then (function(rowsDeleted){
		if(rowsDeleted == 0){
			res.status(404).json({"error" : "No item found with that ID"});
		} else {
			res.status(204).send('Item Deleted Successfully');
		}
	}, function(e){
		res.status(500).json({"error" : "Deleting Item"});
	});
});

// PUT /todos/:id
app.put ('/todos/:id', function(req, res){
	var todoId = parseInt(req.params.id);
	//var matchedTodo = _.findWhere(todos, {id: todoId});
	var body = _.pick(req.body, 'description', 'completed');
	var attributes = {};


	//body.hasOwnProperty('completed')

	if(body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
  	}

	if(body.hasOwnProperty('description')) {
		attributes.description = body.description;
	}

	db.todo.findById(todoId).then( function (todo){
		if(todo){
			return todo.update(attributes);
		}else{
			res.status(404).send("ID not found to update");
		}

	}, function(){
		res.status(500).send("Error when updating the record");
	
	}).then(function(todo){  //update successful
		res.json(todo.toJSON());
	}, function(e){
		res.status(400).json(e);
	});

});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//POST /users - Create a user
app.post('/users', function(req, res){
	var body = _.pick(req.body, 'email', 'password');
	
	body.email = body.email.trim();
	body.password = body.password.trim();

	console.log(body);
	
	db.user.create(body).then(function(todo){
		res.json(todo.toPublicJSON());
	}, function(e){
		res.status(400).json(e);
		console.log('Error creating user: ' + e);
	});

});

//POST method to allow users to log into application
// /users/Login

app.post('/users/login', function(req, res){
	var body = _.pick(req.body, 'email', 'password');

	db.user.authenticate(body).then(function(user){
		res.json(user.toPublicJSON());
	}, function(){
		res.status(401).send('User with the email not found');
	});


	// if(typeof body.email !== 'string' || typeof body.password !== 'string') {
	// 	return res.status(400).send();
	// }

	// db.user.findOne({
	// 	where: {
	// 		email: body.email
	// 	}
	// }).then (function (user){
	// 	if(!user || !bcrypt.compareSync(body.password, user.get('password_hash'))){
	// 		return res.status(401).send();
	// 	}

	// 	res.json(user.toPublicJSON());

	// }, function (e){
	// 	res.status(404).send('User with the email not found');
	// });
});


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

db.sequelize.sync({force: true}).then(function(){
		app.listen (PORT, function(){
		console.log('Express listening on port: ' + PORT);
	});
});
