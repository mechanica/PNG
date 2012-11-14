/*jshint node:true */

var crc32 = require('crc32'),
	hex = require('./hex.js'),
	bitmapper = require('./bitmapper.js');

function extend(obj) {
    'use strict';
	Array.prototype.slice.call(arguments, 1).forEach(function(source) {
		for (var prop in source) {
			obj[prop] = source[prop];
		}
	});
	return obj;
}

function extract(obj, key) {
	'use strict';
	var item = obj[key];
	delete obj[key];
	return item;
}

function parse(type) {
	/*jshint validthis:true */
    'use strict';
	var content = extract(this.chunks, type);
	if (content) {
		return Buffer.concat(
			content.map(function (payload) { 
				return new Chunk( type, payload );
			})
		);
	} else {
		return new Buffer(0);
	}
}

var multiChunks = [ 'IDAT', 'sPLt', 'iTXt', 'tEXt', 'zTXt' ];

var Chunk = function (type, payload) {
    'use strict';
	if (typeof(type) === "string") type = new Buffer(type);
	if (!payload) payload = new Buffer(0);
	return Buffer.concat([
		new Buffer( hex(payload.length, 8), 'hex'),
		type,
		payload,
		new Buffer( hex(crc32( Buffer.concat([type, payload], type.length + payload.length) ), 8), 'hex' )
	]);
};

var magic = new Buffer('89504E470D0A1A0A', 'hex'),
	ending = new Chunk('IEND');

var Header = function (width, height, flags) {
    'use strict';
	return new Chunk( 'IHDR', Buffer.concat([
		new Buffer( hex(width, 8), 'hex'),
		new Buffer( hex(height, 8), 'hex'),
		new Buffer( hex(flags.depth, 2) + hex(flags.type, 2) + hex(flags.compression, 2) + hex(flags.filter, 2) + hex(flags.interlace, 2), 'hex' )
	]) );
};

var Packer = function ( width, height, flags ) {
    'use strict';
	this.width = width;
	this.height = height;
	this.flags = extend({
		depth: 8,
		type: 6,
		compression: 0,
		filter: 0,
		interlace: 0
	}, flags);
	this.chunks = {};
	return this;
};

Packer.prototype.addChunk = function ( type, payload ) {
    'use strict';

	if ( multiChunks.indexOf(type) === -1 && ( (this.chunks[type] && this.chunks[type].length) || (payload && payload.constructor == Array && payload.length > 1) ) ) {
		throw new Error('Only one ' + type + ' chunk is allowed');
	}

	if ( (type === 'iCCP'&&this.chunks.sRGB) || (type === 'sRGB'&&this.chunks.iCCP) ) {
		throw new Error( 'If the ' + (type === 'iCCP' ? 'sRGB' : 'iCCP') + ' chunk is present, the ' + type + ' chunk should not be present' );
	}

	this.chunks[type] = ( this.chunks[type] || [] ).concat( payload );

	return this;
};

Packer.prototype.mergeChunks = function (types) {
	'use strict';
	return Buffer.concat( types.map( parse.bind(this) ) );
};

Packer.prototype.build = function () {
	'use strict';

	//	TYPE	Mult	Spec
	// ------+-------+--------------------
	//	cHRM	No		Before PLTE and IDAT
	//	gAMA	No		Before PLTE and IDAT
	//	iCCP	No		Before PLTE and IDAT. If the iCCP chunk is present, the sRGB chunk should not be present.
	//	sBIT	No		Before PLTE and IDAT
	//	sRGB	No		Before PLTE and IDAT. If the sRGB chunk is present, the iCCP chunk should not be present.
	//	bKGD	No		After PLTE; before IDAT
	//	hIST	No		After PLTE; before IDAT
	//	tRNS	No		After PLTE; before IDAT
	//	pHYs	No		Before IDAT
	//	sPLT	Yes		Before IDAT
	//	tIME	No		None
	//	iTXt	Yes		None
	//	tEXt	Yes		None
	//	zTXt	Yes		None

	var header = new Header( this.width, this.height, this.flags ),

		prePLTE = this.mergeChunks( [ 'cHRM', 'gAMA', 'iCCP', 'sRGB', 'sBit'] ),

		plte = this.mergeChunks( ['PLTE'] ),

		preIDAT = this.mergeChunks( [ 'bKGD', 'hIST', 'tRNS', 'sPLT', 'pHYs'] ),

		data = this.mergeChunks( ['IDAT'] ),

		others = this.mergeChunks( Object.keys(this.chunks) );

	if (!data.length) {
		throw new Error('At least one IDAT chunk is required');
	}

	if (!plte.length && this.flags.type === 3) {
		throw new Error('PLTE shall appear for colour type 3');
	}

	if (plte.length && (this.flags.type === 0 || this.flags.type === 4)) {
		throw new Error('PLTE shall not appear for colour type 0 and 4');
	}

	return Buffer.concat([
		magic,
		header,
		prePLTE,
		plte,
		preIDAT,
		data,
		others,
		ending
	]);
};

module.exports = Packer;
module.exports.Pixel = bitmapper.Pixel;
module.exports.Scanline = bitmapper.Scanline;
module.exports.Bitmap = bitmapper.Bitmap;