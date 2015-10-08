/**
 * 
 * @authors guotong
 * @date    2015-10-08 15:53:32
 */

var fortune = require('../lib/fortune.js');
var expect = require('chai').expect;
suite('Fortune cookie tests', function() {
	test('getFortune() should return a fortune ', function() {
		expect(typeof fortune.getFortune() === 'string');
	});
});