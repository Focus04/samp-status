var test = require('tape');
var parse = require('..');

test('basic loop', function (t) {
  var parser = parse()
    .loop('numbers', 3, function (loop) {
      loop.readUInt8('one');
      loop.readUInt8('two');
    });

  parser.on('data', function (data) {
    t.deepEqual(data.numbers, [
      { one : 1, two : 1 },
      { one : 2, two : 2 },
      { one : 3, two : 3 },
    ]);
    t.end();
  });

  var buf;
  
  buf = new Buffer(2);
  buf.writeUInt8(1, 0);
  buf.writeUInt8(1, 1);
  parser.write(buf);
  
  buf = new Buffer(2);
  buf.writeUInt8(2, 0);
  buf.writeUInt8(2, 1);
  parser.write(buf);
  
  buf = new Buffer(2);
  buf.writeUInt8(3, 0);
  buf.writeUInt8(3, 1);
  parser.write(buf);
});
