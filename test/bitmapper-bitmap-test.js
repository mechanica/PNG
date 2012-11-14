/*jshint node:true */

var vows = require('vows'),
    assert = require('assert');

// Our library

var bitmapper = require('../lib/bitmapper.js');

// Prerequesties

var black = new bitmapper.Pixel(0,0,0),
	orange = new bitmapper.Pixel(0xff, 0xa5, 0x00),
	white = new bitmapper.Pixel(0xff, 0xff, 0xff),
	bitmap = [
		[ black, orange, black, black, orange ],
		[ black, orange, black, black, orange ],
		[ black,  white, black, black, orange ],
		[ black, orange, black, black, orange ],
		[ black, orange, black, black, orange ],
		[ black, orange, black, black, orange ]
	];

vows.describe('Creating Bitmap').addBatch({
	'When creating Bitmap': {
		'with width and height': {
			topic: new bitmapper.Bitmap(5, 10),

			'we get object':{
				'with appropriate width and height': function (topic) {
					'use strict';
					assert.strictEqual( topic.width, 5 );
					assert.strictEqual( topic.height, 10 );
				},
				'filled by transparent black color': function (topic) {
					'use strict';
					assert.strictEqual( topic.getPixel(3,3).toString('hex'), '00000000' );
				}
			},
			'and then setting one of a pixels to orange': {
				topic: function (topic) {
					'use strict';
					return topic.setPixel( 2, 2, orange );
				},

				'we get object with appropriate pixels': function (topic) {
					'use strict';
					assert.strictEqual( topic.getPixel( 2, 2 ).toString('hex'), orange.toString('hex') );
				}
			}
		},
		'with width, height and color': {
			topic: new bitmapper.Bitmap( 5, 10, orange ),

			'we get object':{
				'with appropriate width and height': function (topic) {
					'use strict';
					assert.strictEqual( topic.width, 5 );
					assert.strictEqual( topic.height, 10 );
				},
				'filled by transparent black color': function (topic) {
					'use strict';
					assert.strictEqual( topic.getPixel(3,3).toString('hex'), 'ffa500ff' );
				}
			}
		},
		'with array of Scanlines': {
			topic: new bitmapper.Bitmap( bitmap.map(function (i) {
				'use strict';
				return new bitmapper.Scanline(0, i);
			}) ),

			'we get object':{
				'with appropriate width and height': function (topic) {
					'use strict';
					assert.strictEqual( topic.width, 5 );
					assert.strictEqual( topic.height, 6 );
				},
				'filled by transparent black color': function (topic) {
					'use strict';
					assert.strictEqual( topic.getPixel(1,2).toString('hex'), 'ffffffff' );
				}
			}
		},
		'with bitmap of Pixels': {
			topic: new bitmapper.Bitmap( bitmap ),

			'we get object':{
				'with appropriate width and height': function (topic) {
					'use strict';
					assert.strictEqual( topic.width, 5 );
					assert.strictEqual( topic.height, 6 );
				},
				'filled by transparent black color': function (topic) {
					'use strict';
					assert.strictEqual( topic.getPixel(1,3).toString('hex'), 'ffa500ff' );
				}
			},
			'and then building it': {
				topic: function (topic) {
					'use strict';
					topic.build(this.callback);
				},
				'we get no errors': function (err, payload) {
					'use strict';
					assert.isNull( err );
					assert.isNotNull( payload );
				},
				'we get buffer': function (err, payload) {
					'use strict';
					assert.instanceOf( payload, Buffer );
				},
				'we get expected payload': function (err, payload) {
					'use strict';
					assert.strictEqual( payload.toString('hex'), '789c63606060f8ff7f29c37f108dc4c625080444aa244610005dd832ec' );
				}
			}
		}
	}
})['export'](module);