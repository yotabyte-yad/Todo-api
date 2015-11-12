var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

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
	var queryParams = req.query;
	var filteredTodos = todos;

	if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'true'){
		filteredTodos = _.where(filteredTodos, {completed: true});
	} else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false'){
		filteredTodos = _.where(filteredTodos, {completed: false})
	}


	if(queryParams.hasOwnProperty('q') && queryParams.q.length > 0){
		filteredTodos = _.filter(filteredTodos, function(todo){
			return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
		});
	}

	res.json(filteredTodos);
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
	
	db.todo.create(body).then(function(todo){
		res.json(todo.toJSON());
	}, function(e){
		res.status(400).json(e);
		console.log(e);
	});

	// if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0){

	// 	return res.status(400).send('Invalid User Input');

	// }

	// body.description = body.description.trim();
	// body.id = todoNextId;
	// todoNextId++;

	// //push body into array
	// todos.push(body);

	// res.json(body);

});

//DELETE /todos/:id

app.delete('/todos/:id', function(req, res){
	var todoId = parseInt(req.params.id);
	var matchedTodo = _.findWhere(todos, {id: todoId});

	if(!matchedTodo){
		res.status(404).json({"error" : "No item found with that ID"});
	} else {
		todos = _.without(todos,matchedTodo);
		res.json(matchedTodo);
	}
});

// PUT /todos/:id
app.put ('/todos/:id', function(req, res){
	var todoId = parseInt(req.params.id);
	var matchedTodo = _.findWhere(todos, {id: todoId});
	var body = _.pick(req.body, 'description', 'completed');
	var validAttributes = {};

	if(!matchedTodo){
		return res.status(404).json({"error" : "No item found to update with that ID"});
	} 

	//body.hasOwnProperty('completed')

	if(body.hasOwnProperty('completed') && _.isBoolean(body.completed)){
		validAttributes.completed = body.completed;
	} else if(body.hasOwnProperty('completed')) {
		// Bad
		return res.status(400).send('Error is delete.... property --> completed');
	} else {
		// Never provided Attribute, no problem here
	}

	if(body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0){
		validAttributes.description = body.description;
	} else if(body.hasOwnProperty('description')) {
		// Bad
		return res.status(400).send('Error is delete.... property --> description');
	}

	///Doing actual update of the values as Objects are passed by Reference
	/// No need to explicitly update the TODO object array
	_.extend(matchedTodo, validAttributes);
	res.json(matchedTodo);


});

db.sequelize.sync().then(function(){
		app.listen (PORT, function(){
		console.log('Express listening on port: ' + PORT);
	});
});

