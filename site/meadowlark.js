/**
 * 
 * @authors guotong
 * @date    2015-09-28 11:13:36
 */

var express = require('express'),
	handlebars = require('express-handlebars'),
	formidable = require('formidable'),
	jqupload = require('jquery-file-upload-middleware'),
	connect = require('connect'),
	fs = require('fs');
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
var cartValidation = require('./lib/cartValidation.js');
// 设置端口和根目录
app.set('port',process.env.PORT || 3000);
app.use(express.static(__dirname + '/public'));

// 加载中间件
app.use(require('body-parser')());
// 设置cookie
app.use(require('cookie-parser')(credentials.cookieSecret));
// 设置会话
app.use(require('express-session')());
// 责任免除条款
app.use(require('./lib/tourRequiresWaiver.js'));
// 购物车检测
app.use(cartValidation.checkWaivers);
app.use(cartValidation.checkGuestCounts);

// 将天气数据添加给中间件的对象
app.use(function (req, res, next){
	if(!res.locals.partials) res.locals.partials = {};
 	res.locals.partials.weatherContext = weatherData.getWeatherData();
 	next();
});
// 添加过滤即显消息的中间件
app.use(function (req,res,next){
	// 如果有即显示消息，把它传递到上下文中，然后清除它
	res.locals.flash = req.session.flash;
	delete req.session.flash;
	next();
})

// setting main router
app.get('/',function (req,res){
	res.render('home');
});




/***************************** 基础路由测试 ******************************/

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


/***************************** 表单处理测试 ******************************/



app.get('/newsletter', function(req, res){
    res.render('newsletter', { csrf: 'CSRF token goes here' });
});
// 表单提交成功后的重定向
app.get('/thank-you',function (req,res){
	res.render('thank-you')
});
// ajax 表单处理
app.post('/process',function (req,res){
	if (req.xhr || req.accepts('json,html') === 'json') {
		//如果发生错误，应该发送{ error : 'error description'}
		res.send({success : true});
	}else{
		//如果发生错误，应该重定向到错误页面
		res.redirect(303,'/thank-you');
	}
});

/***************************** 订阅简报处理 ******************************/
// 输入验证具体
var VALID_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

function NewsletterSignup(){
};

NewsletterSignup.prototype.save = function(cb){
	cb();
};

app.post('/newsletter', function(req, res){
   	var name = req.body.name || '' , email = req.body.email || '';
    // 输入验证
    if(!email.match(VALID_EMAIL_REGEX)){
    	if(req.xhr) return res.json({error : 'Invalid name email address.'});
    	req.session.flash = {
    		type : 'danger',
    		intro : 'validation error',
    		message : 'the email address you entered was not valid.',
    	};
    	return res.redirect(303 , '/newsletter/archive');
    }
    new NewsletterSignup({name : name, email : email}).save(function(err){
    	if(err){
    		if(req.xhr) return res.json({error : 'Database error'});
    		req.session.flash = {
    			type : 'danger',
    			intro : "Database error!",
    			message : 'There was a database error; plase try again.',
    		};
    		return res.redirect(303 ,'/newsletter/archive');
    	};
    	if (req.xhr) return res.json({success : true});
    	req.session.flash = {
    		type : 'success',
    		intro : 'Thank you!',
    		message : 'You have now been signed up for the newsletter',
    	};
    	return res.redirect(303,'/newsletter/archive');
    });
});

app.get('/newsletter/archive', function(req, res){
	res.render('newsletter/archive');
});

/***************************** 摄影大赛******************************/
// 声明数据文件目录
var dataDir = __dirname+'/data';
var vacationPhotoDir = dataDir + 'vacation-photo';
// 创建文件位置
fs.existsSync(dataDir) || fs.mkdirSync(dataDir);
fs.existsSync(vacationPhotoDir) || fs.mkdirSync(vacationPhotoDir);

function saveContestEntry(contestName,email,year,month,photopath){
	// 
}
// 摄影大赛路由
app.get('/contest/vacation-photo',function (req,res){
	var now = new Date();
	res.render('contest/vacation-photo',{ year : now.getFullYear(), month : now.getMonth() });
});
// 摄影大赛表单处理
app.post('/contest/vacation-photo/:year/:month',function (req,res){
	var form = new formidable.IncomingForm();
	form.parse(req,function(err,fields,files){
		if(err) return res.redirect(303,"/error");
		if(err){
			res.session.flash = {
				type : 'danger',
				intro : 'Oops!',
				message : 'There was an error processing your submission. plase try again!',
			};
			return res.redirect(303,'contest/vacation-photo');
		}
		var photo = files.photo;
		var dir  = vacationPhotoDir + '/' + Date.now();
		var path = dir + photo.name;
		fs.mkdirSync(dir);
		fs.renameSync(photo.path,dir + '/' + photo.name);
		saveContestEntry('vacation-photo',fileds.email,req.params.year,req.params.month,path);
		req.session.flash = {
			type : 'success',
			intro : 'Good Luck',
			message : 'You have been entered into the contest.',
		};
		return res.redirect(303 , '/contest/vacation-photo/entries');
	});
});

// 图片文件上传
app.use('/upload' ,function(req,res,next){
	var now = Date.now();
	jqupload.fileHandler({
		uploadDir : function(){
			return __dirname + '/public/uploads/' + now;
		},
		uploadUrl : function(){
			return '/uploads/' + now;
		}
	})(req,res,next);
});




/***************************** 基础设置 ******************************/

// 关于页面 幸运饼干测试
app.get('/about',function (req,res){
	res.render('about',{
		fortune : fortune.getFortune(),
		pageTestScript : '/qa/test-about.js'
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
















