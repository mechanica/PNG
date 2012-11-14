/*jshint node:true */
var fs = require('fs'),
	PNG = require('./packer.js');

var black = new PNG.Pixel( 0, 0, 0 ),
	white = new PNG.Pixel( 0xff, 0xff, 0xff );

var bitmap = [
	[ black, black, black, black, black, black, black, black, black, black, black, black, black, black, black, black, black, black, black, black, black ],
	[ black, white, black, white, black, black, white, black, black, white, white, white, black, white, white, white, black, white, black, black, black ],
	[ black, white, black, white, black, white, black, white, black, black, black, white, black, white, black, black, black, white, black, black, black ],
	[ black, black, white, black, black, white, black, white, black, black, white, black, black, white, white, black, black, white, black, black, black ],
	[ black, white, black, white, black, white, white, white, black, white, black, black, black, white, black, black, black, white, black, black, black ],
	[ black, white, black, white, black, white, black, white, black, white, white, white, black, white, white, white, black, white, white, white, black ],
	[ black, black, black, black, black, black, black, black, black, black, black, black, black, black, black, black, black, black, black, black, black ]
];

var image = new PNG.Bitmap( bitmap ).build(function (err, payload) {
	'use strict';
	var png = new PNG( image.width, image.height ).addChunk( 'IDAT', payload ).build();
	fs.writeFile(process.argv[2], png, 0, png.length, 0);
});