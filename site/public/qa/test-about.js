/**
 * 
 * @authors guotong
 * @date    2015-10-08 13:24:44
 */

suite('"About" page Tests' , function(){
	test('page should contain link to contact page',function(){
		assert($('a[href = "/contact"]').length);
	});
});