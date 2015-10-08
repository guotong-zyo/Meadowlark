/**
 * 幸运饼干模块
 * @authors guotong
 * @date    2015-10-08 10:55:51
 */

var fortuneCookies = [

	"Conquer your fears or they will conquer you.",
	"Rivers need springs.",
	"Do not fear what you don't know. ",
	"You will have a pleasent surprise.",
	"Whenever possible, keep it simple."
];

exports.getFortune = function(){
	var idx = Math.floor(Math.random() * fortuneCookies.length);
	return fortuneCookies[idx];
};