/*jshint node:true */

var vows = require('vows'),
    assert = require('assert');

// Our library

var bitmapper = require('../lib/bitmapper.js');

// Prerequesties

var black = new bitmapper.Pixel(0,0,0),
	orange = new bitmapper.Pixel(0xff, 0xa5, 0x00),
	white = new bitmapper.Pixel(0xff, 0xff, 0xff),
	line = [ black, orange, black, black, orange ];

vows.describe('Work with Scanline').addBatch({
	'When creating Scanline': {
		'with type 0 and width of 10': {
			topic: new bitmapper.Scanline(0, 10),

			'we get Buffer-compatible object': function (topic) {
				assert.instanceOf( topic, Buffer );
			},
			'we get object of 41 byte length (byte for type and 4 bytes for each pixel)': function (topic) {
				assert.strictEqual( topic.length, 41 );
			}
		},
		'with type 0 and array of 5 pixels': {
			topic: new bitmapper.Scanline(0, line),

			'we get Buffer-compatible object': function (topic) {
				assert.instanceOf( topic, Buffer );
			},
			'we get object of 21 byte length (byte for type and 4 bytes for each pixel)': function (topic) {
				assert.strictEqual( topic.length, 21 );
			},
			'and then get second pixel': {
				topic: function (topic) {
					return topic.getPixel(1);
				},

				'we get Pixel object': function (topic) {
					assert.instanceOf( topic, bitmapper.Pixel );
				},

				'we get pixel of appropriate color': function (topic) {
					assert.strictEqual( topic.toString(), orange.toString() );
				}
			},
			'and then set third pixel to white': {
				topic: function (topic) {
					return topic.setPixel(2, white);
				},

				'we get line with appropriate third pixel': function (topic) {
					assert.strictEqual( topic.slice(9, 13).toString(), white.toString() );
				}
			}
		}
	}
})['export'](module);