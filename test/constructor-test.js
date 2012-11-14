/*jshint node:true */

var vows = require('vows'),
    assert = require('assert');

// Our library

var Packer = require('../lib/packer.js');

// Prerequesties

var default_flags = {
        depth: 8,
        type: 6,
        compression: 0,
        filter: 0,
        interlace: 0
    };

// Common tests

var tests = {
    isSize: function (width, height) {
        'use strict';
        return function (topic) {
            assert.strictEqual( topic.width, width );
            assert.strictEqual( topic.height, height );
        };
    },
    isCustomFlags: function (flags) {
        'use strict';
        return function (topic) {
            for (var key in flags) {
                assert.strictEqual( topic.flags[key], flags[key] );
            }
        };
    },
    isDefaultFlags: function () {
        'use strict';
        return tests.isCustomFlags(default_flags);
    },
    isEmptyBitmap: function () {
        'use strict';
        return function (topic) {
            assert.isUndefined( topic.data );
        };
    },
    noCallback: function () {
        'use strict';
        return function (topic) {
            assert.isUndefined( topic.callback );
        };
    },
    withCallback: function () {
        'use strict';
        return function (topic) {
            var test = 'Bingo!';
            assert.isFunction( topic.callback );
            assert.strictEqual( test, topic.callback(test) );
        };
    },
    withNoChunks: function () {
        'use strict';
        return function (topic) {
            assert.isEmpty(topic.chunks);
        };
    }
};

// Spec
vows.describe('Creating Packer').addBatch({
    'When instantiating Packer': {
        'without arguments': {
            topic: new Packer(),

            'we get an object': function (topic) {
                'use strict';
                assert.isObject( topic );
            },
            'with Undefined width and height': tests.isSize( undefined, undefined ),
            'with default flags': tests.isDefaultFlags(),
            'without chunks': tests.withNoChunks()
        },
        'with width and height': {
            topic: new Packer( 2, 2 ),

            'we get an object': {
                'with proper width and height': tests.isSize(2, 2),
                'with default flags': tests.isDefaultFlags(),
                'without chunks': tests.withNoChunks()
            },
            'and also a custom flags': {
                topic: new Packer( 2, 2, { depth: 16, type: 3, filter: 1 } ),

                'we get an object': {
                    'with proper width and height': tests.isSize(2, 2),
                    'with our custom flags': tests.isCustomFlags({ depth: 16, type: 3, filter: 1 }),
                    'without chunks': tests.withNoChunks()
                }
            }
        }
    }
})['export'](module);