/*jshint node:true */

var vows = require('vows'),
    assert = require('assert');

// Our library

var Packer = require('../lib/packer.js');

// Prerequesties

var tests = {
	haveChunk: function (type, payload) {
		'use strict';
		return function (topic) {
			assert.include( topic.chunks[type], payload );
		};
	},
	haveNoChunk: function (type, payload) {
		'use strict';
		return function (topic) {
			assert.strictEqual( topic.chunks[type] ? topic.chunks[type].indexOf(payload) : -1, -1);
		};
	}
};

// Common tests

vows.describe('Adding custom Chunks').addBatch({
	'When adding': {
		'custom chunk': {
			topic: new Packer().addChunk( 'tEXt', 'Tested' ),

			'it appears inside our object': tests.haveChunk( 'tEXt', 'Tested' ),

			'and then add another one': {
				topic: function (topic) {
					'use strict';
					return topic.addChunk( 'tEXt', 'again' );
				},

				'they both appears': function (topic) {
					'use strict';
					tests.haveChunk( 'tEXt', 'Tested' )(topic);
					tests.haveChunk( 'tEXt', 'again' )(topic);
				}
			}
		},
		'custom chunk that does not allow to be multiple': {
			topic: new Packer().addChunk( 'bKGD', 'FFA500' ),

			'it appears inside our object': tests.haveChunk( 'bKGD', 'FFA500' ),

			'and then add another one': {
				topic: function (topic) {
					'use strict';
					return function () {
						return topic.addChunk( 'bKGD', 'EEEEEE' );
					};
				},
				'it would throw an error': function (topic) { // May be it's better if chunk will be replaced. Both less API and less errors, but more confussion.
					'use strict';
					assert.throws( topic );
				}
			}
		},
		'multiple chunks at once': {
			topic: new Packer().addChunk('tEXt', ['Tested', 'again']),

			'they both appears': function (topic) {
				'use strict';
				tests.haveChunk( 'tEXt', 'Tested' )(topic);
				tests.haveChunk( 'tEXt', 'again' )(topic);
			}
		},
		'multiple chunks that does not allow to be multiple': {
			topic: new Packer(),
			'it would throw an error': function (topic) {
				'use strict';
				assert.throws( function () {
					return topic.addChunk( 'bKGD', ['FFA500', 'EEEEEE'] );
				} );
			},
			'it would not add any of them': function (topic) {
				'use strict';
				tests.haveNoChunk( 'bKGD', 'FFA500' )(topic);
				tests.haveNoChunk( 'bKGD', 'EEEEEE' )(topic);
			}
		},
		'both iCCP and sRGB chunks simulatesly': {
			topic: new Packer().addChunk( 'iCCP', 'SOMEDATA' ),
			'it would throw an error': function (topic) {
				'use strict';
				assert.throws( function () {
					return topic.addChunk( 'sRGB', 'SOMEDATA' );
				} );
			},
			'first one would be kept': function (topic) {
				'use strict';
				tests.haveChunk( 'iCCP', 'SOMEDATA' )(topic);
			},
			'second one would be ignored': function (topic) {
				'use strict';
				tests.haveNoChunk( 'sRGB' )(topic);
			}
		}
	}
})['export'](module);