/**
 * 
 * @authors guotong
 * @date    2015-09-28 11:13:36
 */

var express = require('express');
var app = express();
var handlebars = require('express-handlebars');

// 引入幸运饼干模块
var fortune = require('./lib/fortune.js');

app.set('port',process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));


// set view engine
app.engine('handlebars', handlebars({defaultLayout: 'main'}));
app.set('view engine','handlebars');

// 测试
app.use(function (req,res,next){
	res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
	next();
});

// setting main router
app.get('/',function (req,res){
	res.render('home');
});

app.get('/about',function (req,res){
	res.render('about',{
		fortune : fortune.getFortune(),
		pageTestScript : '/qa/test-about.js'
	});
});

app.get('/tours/hood-river',function (req,res){
	res.render('tours/hood-river');
});

app.get('/tours/request-group-rate',function (req,res){
	res.render('tours/request-group-rate');
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
});