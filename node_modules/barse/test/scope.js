var test = require('tape');
var parse = require('..');

test('scope', function (t) {
  var parser = parse()
    .readUInt8('length')
    .next('body', 'length', function (chunk, offset) {
      return chunk.toString('utf8', offset, offset + this.length);
    });

  parser.on('data', function (data) {
    t.deepEquals(data, { length : 3, body : 'foo' });
    t.end();
  });

  var length = new Buffer(1); length.writeUInt8(3, 0); parser.write(length);
  parser.write('foo', 1);
});
