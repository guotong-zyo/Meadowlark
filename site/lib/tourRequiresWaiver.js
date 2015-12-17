/**
 * tourRequiresWaiver
 * @authors guotong
 * @date    2015-10-20 14:55:27
 */

module.exports = function(req,res,next){
	var cart = req.session.cart;
	if(!cart) return next();
	if(cart.some(function(item){ return item.product.requiresWaiver;})){
		if (!cart.warnings) cart.warnings = [];
		cart.warnings.push('one or more of your selected tours requires a waiver.')
	}
	next();
}