/**
 * 
 * @authors guotong
 * @date    2015-09-28 11:13:36
 */

var express = require('express'),
	handlebars = require('express-handlebars'),
	formidable = require('formidable');
	jqupload = require('jquery-file-upload-middleware');
var app = express();

// set view engine
app.engine('handlebars', handlebars({ 
	defaultLayout: 'main',
	helpers : {
		section: function(name, options){
            if(!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        }
	}
}));
app.set('view engine','handlebars');



// 引入幸运饼干模块
var fortune = require('./lib/fortune.js');
// 引入获取天气数据模块
var weatherData = require('./lib/weatherData.js');
var credentials = require('./lib/credentials.js');
// 设置端口和根目录
app.set('port',process.env.PORT || 3000);
app.use(express.static(__dirname + '/public'));

// 加载中间件
app.use(require('body-parser')());


app.use(function(req, res, next){
	if(!res.locals.partials) res.locals.partials = {};
 	res.locals.partials.weatherContext = getWeatherData();
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

/*----------------------------------------------- */
app.get('/tours/hood-river',function (req,res){
	res.render('tours/hood-river');
});

app.get('/tours/request-group-rate',function (req,res){
	res.render('tours/request-group-rate');
});

app.get('/jquerytest', function (req,res){
	res.render('jquerytest');
});
app.get('/nursery-rhyme',function (req,res){
	res.render('nursery-rhyme');
});
app.get('/data/nursery-rhyme',function (req,res){
	res.json({
		animal:'squirrl',
		bodyPart : 'tail',
		adjective : 'bushy',
		noun : 'heck'
	});
});
app.get('/thank-you',function (req,res){
	res.render('thank-you')
});
app.get('/newsletter', function(req, res){

    res.render('newsletter', { csrf: 'CSRF token goes here' });
});

app.post('/process',function (req,res){
	if (req.xhr || req.accepts('json,html') === 'json') {
		//如果发生错误，应该发送{ error : 'error description'}
		res.send({success : true});
	}else{
		//如果发生错误，应该重定向到错误页面
		res.redirect(303,'/thank-you');
	}
});

app.get('/contest/vacation-photo',function (req,res){
	var now = new Date();
	res.render('contest/vacation-photo',{ year : now.getFullYear(), month : now.getMonth() });
});

app.post('/contest/vacation-photo/:year/:month',function (req,res){
	var form = new formidable.IncomingForm();
	form.parse(req,function(err,fields,files){

		if(err) return res.redirect(303,"/error");
		console.log('received fileds:');
		console.log(fields);
		console.log('received files:');
		console.log(files);
		res.redirect(303,'/thank-you');
	})
});

/*----------------------------------------------- */


/* jquery 文件上传 */
// app.use('/upload' ,function(req,res,next){
// 	var now = Date.now();
// 	jqupload.fileHandler({
// 		uploadDir : function(){
// 			return __dirname + '/public/upload' + now;
// 		},
// 		uploadUrl : function(){
// 			return '/uploads/' + now;
// 		}
// 	})(req,res,next);
// });

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















