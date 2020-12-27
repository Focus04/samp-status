var parse = require('..');
var test = require('tape');

test('next', function (t) {
  var parser = parse()
    .next('foo', 3, function (chunk, offset) {
      return chunk.toString('utf8', offset, offset + 3);
    })
    .next('bar', 3, function (chunk, offset) {
      return chunk.toString('utf8', offset, offset + 3);
    })

  var i = 0;
  parser.on('data', function (data) {
    if (i === 0) {
      t.deepEqual(data, { foo : 'foo', bar : 'bar' });
    } else if (i === 1) {
      t.deepEqual(data, { foo : 'oof', bar : 'rab' });
    } else {
      t.deepEqual(data, { foo : 'fff', bar : 'uuu' });
      t.end();
    }
    i++;
  });

  parser.write(new Buffer('foobar'));

  parser.write(new Buffer('oof'));
  parser.write(new Buffer('rab'));

  parser.write(new Buffer('ff'));
  parser.write(new Buffer('fu'));
  parser.write(new Buffer('uu'));
});
