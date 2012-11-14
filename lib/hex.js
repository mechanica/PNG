module.exports = function Hex (i, n) {
	var pad = new Array(n).join('0');
	return (pad + i.toString(16)).slice(-n);
}