/*jshint node:true */

var vows = require('vows'),
    assert = require('assert');

// Our library

var bitmapper = require('../lib/bitmapper.js');

vows.describe('Work with pixels').addBatch({
	'When creating pixel': {
		'without arguments': {
			topic: new bitmapper.Pixel(),

			'we get Buffer-compatible object': function (topic) {
				'use strict';
				assert.instanceOf( topic, Buffer );
			},
			'we get opaque black pixel': function (topic) {
				'use strict';
				assert.strictEqual( topic.toString('hex'), '000000ff' );
			}
		},
		'without alpha': {
			topic: new bitmapper.Pixel(0xff, 0xa5, 0x00),

			'we get opaque pixel of appropriate color': function (topic) {
				'use strict';
				assert.strictEqual( topic.toString('hex'), 'ffa500ff' );
			}
		},
		'with alpha': {
			topic: new bitmapper.Pixel(0xff, 0xff, 0xff, 0x00),

			'we get transparent pixel of appropriate color': function (topic) {
				'use strict';
				assert.strictEqual( topic.toString('hex'), 'ffffff00');
			}
		}
	}
})['export'](module);