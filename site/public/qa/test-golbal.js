/**
 * 
 * @authors guotong
 * @date    2015-10-08 13:24:44
 */

suite('Global Tests' , function(){
	test('page has a valid title',function(){
		assert(document.title && document.title.match(/\S/) && document.title.toUpperCase() !== 'TODO');
	});
});