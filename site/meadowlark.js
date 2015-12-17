/**
 * 
 * @authors guotong
 * @date    2015-09-28 11:13:36
 */

var express = require('express');
var app = express();
var handlebars = require('express-handlebars');
var formidable = require('formidable');

// 引入幸运饼干模块
var fortune = require('./lib/fortune.js');
// 引入获取天气数据模块
var weatherData = require('./lib/weatherData.js');
var credentials = require('./lib/credentials.js');

var VALID_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

app.set('port',process.env.PORT || 3000);
app.use(express.static(__dirname + '/public'));

// 加载中间件
app.use(require('body-parser')());
app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('express-session')({
	resave: false,
    saveUninitialized: false,
    secret: credentials.cookieSecret,
}));
app.use(require('./lib/tourRequiresWaiver.js'));

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

// 测试
app.use(function (req,res,next){
	if (!res.locals.partials) res.locals.partials = {};
	res.locals.partials.weatherContext = weatherData.getWeatherData();
	next();
})
app.use(function (req,res,next){
	res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
	next();
});
app.use(function (req,res,next){
	res.locals.flash = req.session.flash;
	delete req.session.flash;
	next();
})

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

app.get('/contest/vacation-photo',function (req,res){
	var now = new Date();
	res.render('contest/vacation-photo',{
		year : now.getFullYear(),
		month : now.getMonth()
	});
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
})
// for now, we're mocking NewsletterSignup:
function NewsletterSignup(){
}
NewsletterSignup.prototype.save = function(cb){
	cb();
};
/*
	？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？
*/ 
app.get('/newsletter',function (req,res){
	var name = req.body.name || '', 
		email = req.body.emial || '';
		// 输入验证
		if (email.match(VALID_EMAIL_REGEX)) {
			if(req.xhr) return res.json({error:'Invalid name email address.'});
			req.session.flash = {
				type : 'danger',
				intro : 'Validation error!',
				message : 'the email address you entered was not valid.'
			};
			return res.redirect(303,'/newsletter/archive');
		};
		new NewsletterSignup({name : name,email : email}).save(function(err){
			if(err){
				if (req.xhr) return res.json({error : 'Database error.'});
				req.session.flash = {
					type : 'danger',
					intro : 'Database error.',
					message : 'There was a database error;please try again alter.'
				}
				return res.redirect(303,'/newsletter/archive')
			}
			if (req.xhr) return res.json({success : true});
			req.session.falsh = {
				type : 'success',
				intro : 'thank you !',
				message : 'you have now been signed up for the newsletter.'
			};
			return res.redirect(303,'/newsletter/archive')
		});
});
/*
	？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？
*/ 
app.post('/process',function (req,res){
	if (req.xhr || req.accepts('json,html') === 'json') {
		//如果发生错误，应该发送{ error : 'error description'}
		res.send({success : true});
	}else{
		//如果发生错误，应该重定向到错误页面
		res.redirect(303,'/thank-you');
	}
});

app.get('/thank-you',function (req,res){
	res.render('thank-you')
});

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















