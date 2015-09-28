/**
 * 
 * @authors guotong
 * @date    2015-09-28 11:13:36
 */

var express = require('express');
var app = express();
var handlebars = require('express-handlebars');

app.set('port',process.env.PORT || 3000);
app.use(express.static(__dirname + '/public'));

// set view engine
app.engine('handlebars', handlebars({defaultLayout: 'main'}));
app.set('view engine','handlebars');

// setting main router
app.get('/',function (req,res){
	res.render('home');
});

app.get('/about',function (req,res){
	res.render('about');
});

// setting 404 page
app.use(function (req,res){
	res.status(404);
	res.render('404');
});

// setting 500 page
app.use(function (req,res){
	console.log(err.stack);
	res.status(500);
	res.render('500');
	
});



app.listen(app.get('port'),function(){
	console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl+C to terminate.');
})