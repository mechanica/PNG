/*jshint node:true */

var zlib = require('zlib'),
	util = require('util');

function makeArray(length, val) {
	'use strict';
    var array = [];
    for (var i = 0; i < length; i++) {
        array[i] = val;
    }
    return array;
}

function Pixel(r,g,b,a) {
	'use strict';
	this.constructor.super_.call(this, 4);
	this.set(0, r);
	this.set(1, g);
	this.set(2, b);
	this.set(3, typeof a !== 'undefined' ? a : 0xff);
	return this;
}

util.inherits( Pixel, Buffer );

function Scanline( type, pixels ) {
	'use strict';
	var width;
	if ( pixels.constructor === Array ) {
		width = pixels.length;
		pixels = Buffer.concat( pixels );
	} else if ( pixels.constructor === Number ) {
		width = pixels;
	} else {
		throw new Error('Second argument should be Number or Array');
	}

	this.constructor.super_.call(this, width * 4 + 1);
	this.set(0, type);

	if ( pixels.constructor === Buffer) {
		pixels.copy(this, 1);
	}
	return this;
}

util.inherits( Scanline, Buffer );

Scanline.prototype.getPixel = function (x) {
	'use strict';
	var offset = x * 4 + 1;
	return new Pixel( this[offset], this[offset+1], this[offset+2], this[offset+3] );
};

Scanline.prototype.setPixel = function (x, color) {
	'use strict';
	var offset = x * 4 + 1;
	color.copy(this, offset);
	return this;
};

function Bitmap( a, b, c ) {
	'use strict';
	var width, height, lines;

	if ( a.constructor === Array ) {
		if ( a[0].constructor === Array ) {
			// Bitmap (array of array of pixels)
			lines = a.map(function (i) {
				return new Scanline(0, i);
			});
			width = a[0].length;
			height = a.length;
		} else {
			// Linemap (array of Scanlines)
			lines = a;
			width = (a[0].length - 1) / 4;
			height = a.length;
		}
	} else {
		if ( a.constructor !== Number || a < 0 || b.constructor !== Number || b < 0 ) {
			throw new Error('Width and height should be non-negative Numbers');
		}
		if (!c) {
			c = new Pixel(0,0,0,0);
		}
		width = a;
		height = b;
		lines = makeArray(height, new Scanline(0, makeArray(width, c)));
	}

	this.width = width;
	this.height = height;
	this.lines = lines;
}

Bitmap.prototype.getPixel = function (x,y) {
	'use strict';
	return this.lines[y].getPixel(x);
};

Bitmap.prototype.setPixel = function (x,y, color) {
	'use strict';
	this.lines[y].setPixel(x, color);
	return this;
};

Bitmap.prototype.build = function (callback) {
	'use strict';
	zlib.deflate( Buffer.concat(this.lines), callback );
	return this;
};

module.exports = {
	Pixel: Pixel,
	Scanline: Scanline,
	Bitmap: Bitmap
};