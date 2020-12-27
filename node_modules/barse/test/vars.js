var test = require('tape');
var parse = require('..');

test('vars', function (t) {
  var parser = parse()
    .readUInt8('length')
    .string('str', 'length')
    .string('str2', 'length')

  parser.on('data', function (data) {
    t.deepEqual(data, { length : 3, str : 'foo', str2 : 'bar' });
    t.end();
  });

  var buf = new Buffer(7);
  buf.writeUInt8(3, 0);
  buf.write('foo', 1);
  buf.write('bar', 4);
  parser.write(buf);
});
