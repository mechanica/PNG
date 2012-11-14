/*jshint node:true */

var vows = require('vows'),
    assert = require('assert');

// Our library

var Packer = require('../lib/packer.js');

// Prerequesties

var pic6 = new Buffer('89504E470D0A1A0A0000000D4948445200000015000000070806000000E70906060000003C49444154789C63606060F84F03CCF01F0490696C6C18C0C52768282EC584C4510CC5E54A422EC76B283617E2F31E512E25E47D62C214CDF5D48F7D000CDA18F6EF2A27150000000049454E44AE426082', 'hex'),
	idat6 = {
		width: pic6.readUInt32BE( 0x10 ),
		height: pic6.readUInt32BE( 0x14 ),
		data: pic6.slice( 0x29, 0x65 )
	},
	plte = new Buffer('SOMEDATA');

// Common tests

var tests = {
	haveChunk: function (type, payload) {
		'use strict';
		return function (topic) {
			assert.include( topic.chunks[type], payload );
		};
	},
	haveNotChunk: function (type, payload) {
		'use strict';
		return function (topic) {
			assert.strictEqual( topic.chunks[type] ? topic.chunks[type].indexOf(payload) : -1, -1);
		};
	},
	buildError: function (type) {
		'use strict';
		return function (topic) {
			assert.throws(function () {
				topic.build();
			}, type);
		};
	}
};

vows.describe('Build Packer').addBatch({
	'When building Packer': {
		'without width and height': {
			topic: new Packer(),

			'it would throw an error': tests.buildError()
		},
		'without IDAT chunk': {
			topic: new Packer(2,2),

			'it would throw an error': tests.buildError()
		},
		'with IDAT chunk': {
			topic: new Packer( idat6.width, idat6.height ).addChunk( 'IDAT', idat6.data ).build(),

			'we get valid image': function (topic) {
				'use strict';
				assert.strictEqual(topic.toString('hex'), pic6.toString('hex'));
			}
		},
		'with multiple IDAT chunks': {
			topic: new Packer( idat6.width, idat6.height ).addChunk( 'IDAT', idat6.data.slice(0, idat6.data.length / 2) ).addChunk( 'IDAT', idat6.data.slice(idat6.data.length / 2) ).build(),

			'all of them are added': function (topic) {
				'use strict';
				assert.strictEqual( topic.slice( 0, 0x21 ).toString('hex'), pic6.slice( 0, 0x21 ).toString('hex') ); // Both Magic and IHDR are ok
				assert.strictEqual( topic.slice( 0x29, 0x47 ).toString('hex'), pic6.slice( 0x29, 0x47 ).toString('hex') ); // First IDAT is ok
				assert.strictEqual( topic.slice( 0x53, 0x71 ).toString('hex'), pic6.slice( 0x47, 0x65 ).toString('hex') ); // Second IDAT is ok

			}
		},
		'of color type 3 without PLTE': {
			topic: new Packer(2,2,{type:3}).addChunk( 'IDAT', idat6.data ),

			'it would throw an error': tests.buildError()
		},
		'of color type 0 with PLTE': {
			topic: new Packer(2,2,{type:0}).addChunk( 'PLTE', plte ).addChunk( 'IDAT', idat6.data ),

			'it would throw an error': tests.buildError()
		},
		'of color type 4 with PLTE': {
			topic: new Packer(2,2,{type:4}).addChunk( 'PLTE', plte ).addChunk( 'IDAT', idat6.data ),

			'it would throw an error': tests.buildError()
		}
	}
})['export'](module);