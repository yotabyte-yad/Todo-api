var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;

var todos = [{
		id: 1,
		description: 'Meet Ben for Dinner',
		completed: false
	},{
		id: 2,
		description: 'Go to Fish Market',
		completed: false
	},{
		id: 3,
		description: 'Get up at 6AM',
		completed: true
	} 
];

app.get('/', function(req, res){
	res.send('TODO API root');
});

//GET /todos
app.get('/todos', function(req, res){
	res.json(todos);
});

//GET /todos/:id
app.get('/todos/:id', function(req, res){
	var todoId = parseInt(req.params.id);
	var matchedTodo;

	todos.forEach(function (todo){
		if (todoId === todo.id){
			matchedTodo = todo;
		}
	});

	if(matchedTodo){
		res.json(matchedTodo);
	}
	else {
		res.status(404).send();
	}

	//res.send ('Asking for todo of id of ' + req.params.id);
});


app.listen (PORT, function(){
	console.log('Express listening on port: ' + PORT);
});
