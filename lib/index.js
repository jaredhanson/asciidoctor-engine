/**
 * Module dependencies.
 */
var fs = require('fs')
  , asciidoctor = require('asciidoctor.js')()
  , merge = require('utils-merge');


/**
 * Render the given `str` of Markdown and invoke the callback `fn(err, str)`.
 *
 * Options:
 *
 *   - `cache`    enable template caching
 *   - `filename` filename required for caching
 *
 * @param {String} str
 * @param {Object|Function} options or fn
 * @param {Function} fn
 * @api public
 */
exports.render = function(str, options, fn) {
  console.log('ADOC RENDER! ' + str);
  
  if ('function' == typeof options) {
    fn = options, options = {};
  }

  // cache requires .filename
  if (options.cache && !options.filename) {
    return fn(new Error('the "filename" option is required for caching'));
  }

  var opts = {};
  //merge(opts, marked.defaults);
  merge(opts, options);

  try {
    console.log('RENDER ADOC...');
    
    //var html = asciidoctor.convert(str);
    var html = asciidoctor.convert(str, {safe: 'safe', attributes: {showtitle: true, icons: 'fonts'}});
    console.log('HTML:')
    console.log(html)
    
    //fn(null, 'foo');
    fn(null, html);
    
    return;
    
    var path = options.filename;
    var tokens = options.cache
      ? exports.cache[path] || (exports.cache[path] = marked.lexer(str, opts))
      : marked.lexer(str, opts);
    fn(null, marked.parser(tokens, opts));
  } catch (err) {
    fn(err);
  }
}

/**
 * Render a Markdown file at the given `path` and callback `fn(err, str)`.
 *
 * @param {String} path
 * @param {Object|Function} options or callback
 * @param {Function} fn
 * @api public
 */
exports.renderFile = function(path, options, fn) {
  console.log('ADOC RENDER FILE! ' + path);
  
  var key = path + ':string';

  if ('function' == typeof options) {
    fn = options, options = {};
  }

  try {
    options.filename = path;
    var str = options.cache
      ? exports.cache[key] || (exports.cache[key] = fs.readFileSync(path, 'utf8'))
      : fs.readFileSync(path, 'utf8');
    exports.render(str, options, fn);
  } catch (err) {
    fn(err);
  }
}

/**
 * Lexer tokens cache.
 */
exports.cache = {};

/**
 * Express support.
 */
exports.__express = exports.renderFile;
