
# barse

Binary parser with a fluent API.

[![build status](https://secure.travis-ci.org/juliangruber/barse.png)](http://travis-ci.org/juliangruber/barse)

[![testling badge](https://ci.testling.com/juliangruber/barse.png)](https://ci.testling.com/juliangruber/barse)

## Usage

```js
var parse = require('..');

var parser = parse()
  .readUInt8('string length')
  .string('string', 'string length')
  .readUInt8('field count')
  .loop('fields', 2, function (loop) {
    loop.readUInt8('some');
    loop.readUInt8('numbers');
  })

parser.on('data', console.log);
/*
{
  "string length" : 3,
  "string" : "foo",
  "field count" : 2,
  "fields" : [
    { "some" : 13, "numbers" : 37 },
    { "some" : 73, "numbers" : 31 }
  ]
}
*/

var buf = new Buffer(9);
buf.writeUInt8(3, 0); // string length
buf.write('foo', 1); // string
buf.writeUInt8(2, 4); // field count
buf.writeUInt8(13, 5); // fields[0].some
buf.writeUInt8(37, 6); // fields[0].numbers
buf.writeUInt8(73, 7); // fields[1].some
buf.writeUInt8(31, 8); // fields[1].numbers

parser.write(buf);
```

## API

### parse()

Create a new streaming parser.

### parse#string(name, length[, encoding])
### parse#buffer(name, length)
### parse#read(U)Int{8,16,32}{BE,LE}(name)
### parse#read{Float,Double}{BE,LE}(name)

Parse the given type with optional length and store in the results object under
`name`.

`length` can also be the name of a previously read field, e.g.:

```js
parse()
  .readUInt8('length')
  .string('content', 'length');
```

### parse#next(name, length, fn)

Consume a chunk of binary data with the given `length`.

`fn` is called with the current `chunk` and `offset` and is expected to synchronously return the parsed Object/String/whatever, which then will be emitted under `name` in the results object.
In addition, `fn` is bound to the object containing the parsed data of the current chunk.

The example above written using `next`:

```js
parse()
  .next('foo', 3, function (chunk, offset) {
    return chunk.toString('utf8', offset, offset + 3);
  })
  .next('bar', 3, function (chunk, offset) {
    return chunk.toString('utf8', offset, offset + 3);
  })
```

### parse#loop(name, length, fn)

Read `length` buffers and store under `name`.

```js
var parser = parse()
  .readUInt8('count')
  .loop('strings', 'count', function (loop) {
    loop.string('value', 3);
  });

parser.on('data', console.log);
// => { strings : [{ value : 'foo' }, { value : 'bar' }]}

var count = new Buffer(1); count.writeUInt8(1, 0); parser.write(count);
parser.write(new Buffer('foobar'));
```

## Installation

With [npm](http://npmjs.org) do

```bash
$ npm install barse
```

## License

The MIT License (MIT)

Copyright (c) 2013 Julian Gruber &lt;julian@juliangruber.com&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
