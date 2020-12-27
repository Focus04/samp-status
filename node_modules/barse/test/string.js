var test = require('tape');
var parse = require('..');

test('variable string lengths', function (t) {
  var parser = parse()
    .readUInt8('length')
    .string('str', 'length')
    .string('str2', 'length')

  var i = 0;
  parser.on('data', function (data) {
    if (i === 0) {
      t.deepEqual(data, { length : 3, str : 'foo',  str2 : 'bar'  });
    } else {
      t.deepEqual(data, { length : 4, str : 'abcd', str2 : 'efgh' });
      t.end();
    }
    i++;
  });

  var buf = new Buffer(7);
  buf.writeUInt8(3, 0);
  buf.write('foo', 1);
  buf.write('bar', 4);

  var buf2 = new Buffer(9);
  buf2.writeUInt8(4, 0);
  buf2.write('abcd', 1);
  buf2.write('efgh', 5);

  parser.write(buf);
  parser.write(buf2);
});
