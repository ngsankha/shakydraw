var slice = [].slice;

var FONT = "20pt 'Gloria Hallelujah'";

var ShakyCanvas = function(canvas) {
  this.ctx = canvas.getContext('2d');
  this.ctx.lineWidth = 3;
  this.ctx.font = FONT;
  this.ctx.textBaseline = 'middle';
}

ShakyCanvas.prototype.moveTo = function(x01, y01) {
  this.x0 = x01;
  this.y0 = y01;
};

ShakyCanvas.prototype.lineTo = function(x1, y1) {
  this.shakyLine(this.x0, this.y0, x1, y1);
  return this.moveTo(x1, y1);
};

ShakyCanvas.prototype.shakyLine = function(x0, y0, x1, y1) {
  var K, dx, dy, k1, k2, l, l3, l4, x3, x4, y3, y4;
  dx = x1 - x0;
  dy = y1 - y0;
  l = Math.sqrt(dx * dx + dy * dy);
  K = Math.sqrt(l) / 1.5;
  k1 = Math.random();
  k2 = Math.random();
  l3 = Math.random() * K;
  l4 = Math.random() * K;
  x3 = x0 + dx * k1 + dy / l * l3;
  y3 = y0 + dy * k1 - dx / l * l3;
  x4 = x0 + dx * k2 - dy / l * l4;
  y4 = y0 + dy * k2 + dx / l * l4;
  this.ctx.moveTo(x0, y0);
  return this.ctx.bezierCurveTo(x3, y3, x4, y4, x1, y1);
};

ShakyCanvas.prototype.bulb = function(x0, y0) {
  var fuzziness, i, j, results;
  fuzziness = function() {
    return Math.random() * 2 - 1;
  };
  results = [];
  for (i = j = 0; j <= 2; i = ++j) {
    this.beginPath();
    this.ctx.arc(x0 + fuzziness(), y0 + fuzziness(), 5, 0, Math.PI * 2, true);
    this.ctx.closePath();
    results.push(this.ctx.fill());
  }
  return results;
};

ShakyCanvas.prototype.arrowhead = function(x0, y0, x1, y1) {
  var alpha, alpha3, alpha4, dx, dy, l3, l4, x3, x4, y3, y4;
  dx = x0 - x1;
  dy = y0 - y1;
  alpha = dy === 0 ? dx < 0 ? -Math.PI : 0 : Math.atan(dy / dx);
  alpha3 = alpha + 0.5;
  alpha4 = alpha - 0.5;
  l3 = 20;
  x3 = x1 + l3 * Math.cos(alpha3);
  y3 = y1 + l3 * Math.sin(alpha3);
  this.beginPath();
  this.moveTo(x3, y3);
  this.lineTo(x1, y1);
  this.stroke();
  l4 = 20;
  x4 = x1 + l4 * Math.cos(alpha4);
  y4 = y1 + l4 * Math.sin(alpha4);
  this.beginPath();
  this.moveTo(x4, y4);
  this.lineTo(x1, y1);
  return this.stroke();
};

ShakyCanvas.prototype.beginPath = function() {
  return this.ctx.beginPath();
};

ShakyCanvas.prototype.stroke = function() {
  return this.ctx.stroke();
};

ShakyCanvas.prototype.setStrokeStyle = function(val) {
  return this.ctx.strokeStyle = val;
};

ShakyCanvas.prototype.setFillStyle = function(val) {
  return this.ctx.fillStyle = val;
};

ShakyCanvas.prototype.fillText = function() {
  var args, ref;
  args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
  return (ref = this.ctx).fillText.apply(ref, args);
};

var CELL_SIZE = 15;

var X = function(x) {
  return x * CELL_SIZE + (CELL_SIZE / 2);
};

var Y = function(y) {
  return y * CELL_SIZE + (CELL_SIZE / 2);
};

var Point = function(x2, y2) {
  this.x = x2;
  this.y = y2;
}

var Line = function(x01, y01, start1, x11, y11, end1, color1) {
  this.x0 = x01;
  this.y0 = y01;
  this.start = start1;
  this.x1 = x11;
  this.y1 = y11;
  this.end = end1;
  this.color = color1;
}

Line.prototype.draw = function(ctx) {
  ctx.setStrokeStyle(this.color);
  ctx.setFillStyle(this.color);
  ctx.beginPath();
  ctx.moveTo(X(this.x0), Y(this.y0));
  ctx.lineTo(X(this.x1), Y(this.y1));
  ctx.stroke();
  this._ending(ctx, this.start, X(this.x1), Y(this.y1), X(this.x0), Y(this.y0));
  return this._ending(ctx, this.end, X(this.x0), Y(this.y0), X(this.x1), Y(this.y1));
};

Line.prototype._ending = function(ctx, type, x0, y0, x1, y1) {
  switch (type) {
    case 'circle':
      return ctx.bulb(x1, y1);
    case 'arrow':
      return ctx.arrowhead(x0, y0, x1, y1);
  }
};

var Text = function(x01, y01, text1, color1) {
  this.x0 = x01;
  this.y0 = y01;
  this.text = text1;
  this.color = color1;
}

Text.prototype.draw = function(ctx) {
  ctx.setFillStyle(this.color);
  return ctx.fillText(this.text, X(this.x0), Y(this.y0));
};

var parseASCIIArt = function(string) {
  var at, data, dir, erase, eraseChar, extractLine, extractText, figures, findLineChar, height, isLineEnding, isPartOfLine, j, k, len, line, lines, ref, ref1, toColor, width, x, y;
  lines = string.split('\n');
  height = lines.length;
  width = Math.max.apply(Math, (function() {
    var j, len, results;
    results = [];
    for (j = 0, len = lines.length; j < len; j++) {
      line = lines[j];
      results.push(line.length);
    }
    return results;
  })());
  data = [];
  at = function(y, x) {
    var ref;
    return (ref = data[y]) != null ? ref[x] : void 0;
  };
  for (y = j = 0, len = lines.length; j < len; y = ++j) {
    line = lines[y];
    data[y] = line.split('');
    for (x = k = ref = line.length, ref1 = width; ref <= ref1 ? k < ref1 : k > ref1; x = ref <= ref1 ? ++k : --k) {
      data[y][x] = ' ';
    }
  }
  isPartOfLine = function(x, y) {
    var c;
    c = at(y, x);
    return c === '|' || c === '-' || c === '+' || c === '~' || c === '!';
  };
  toColor = function(x, y) {
    switch (at(y, x)) {
      case '~':
      case '!':
        return '#666';
    }
  };
  isLineEnding = function(x, y) {
    var c;
    c = at(y, x);
    return c === '*' || c === '<' || c === '>' || c === '^' || c === 'v';
  };
  findLineChar = function() {
    var m, n, ref2, ref3;
    for (y = m = 0, ref2 = height; 0 <= ref2 ? m < ref2 : m > ref2; y = 0 <= ref2 ? ++m : --m) {
      for (x = n = 0, ref3 = width; 0 <= ref3 ? n < ref3 : n > ref3; x = 0 <= ref3 ? ++n : --n) {
        if (data[y][x] === '|' || data[y][x] === '-') {
          return new Point(x, y);
        }
      }
    }
  };
  dir = {
    '-': new Point(1, 0),
    '|': new Point(0, 1)
  };
  eraseChar = function(x, y, dx, dy) {
    switch (at(y, x)) {
      case '|':
      case '-':
      case '*':
      case '>':
      case '<':
      case '^':
      case 'v':
      case '~':
      case '!':
        return data[y][x] = ' ';
      case '+':
        dx = 1 - dx;
        dy = 1 - dy;
        data[y][x] = ' ';
        switch (at(y - dy, x - dx)) {
          case '|':
          case '!':
          case '+':
            data[y][x] = '|';
            return;
          case '-':
          case '~':
            data[y][x] = '-';
            return;
        }
        switch (at(y + dy, x + dx)) {
          case '|':
          case '!':
          case '+':
            return data[y][x] = '|';
          case '-':
          case '~':
            return data[y][x] = '-';
        }
    }
  };
  erase = function(line) {
    var dx, dy, x_, y_;
    dx = line.x0 !== line.x1 ? 1 : 0;
    dy = line.y0 !== line.y1 ? 1 : 0;
    if (dx !== 0 || dy !== 0) {
      x = line.x0 + dx;
      y = line.y0 + dy;
      x_ = line.x1 - dx;
      y_ = line.y1 - dy;
      while (x <= x_ && y <= y_) {
        eraseChar(x, y, dx, dy);
        x += dx;
        y += dy;
      }
      eraseChar(line.x0, line.y0, dx, dy);
      return eraseChar(line.x1, line.y1, dx, dy);
    } else {
      return eraseChar(line.x0, line.y0, dx, dy);
    }
  };
  figures = [];
  extractLine = function() {
    var ch, color, d, end, start, x0, x1, y0, y1;
    ch = findLineChar();
    if (ch == null) {
      return false;
    }
    d = dir[data[ch.y][ch.x]];
    x0 = ch.x;
    y0 = ch.y;
    color = null;
    while (isPartOfLine(x0 - d.x, y0 - d.y)) {
      x0 -= d.x;
      y0 -= d.y;
      if (color == null) {
        color = toColor(x0, y0);
      }
    }
    start = null;
    if (isLineEnding(x0 - d.x, y0 - d.y)) {
      x0 -= d.x;
      y0 -= d.y;
      start = data[y0][x0] === '*' ? 'circle' : 'arrow';
    }
    x1 = ch.x;
    y1 = ch.y;
    while (isPartOfLine(x1 + d.x, y1 + d.y)) {
      x1 += d.x;
      y1 += d.y;
      if (color == null) {
        color = toColor(x1, y1);
      }
    }
    end = null;
    if (isLineEnding(x1 + d.x, y1 + d.y)) {
      x1 += d.x;
      y1 += d.y;
      end = data[y1][x1] === '*' ? 'circle' : 'arrow';
    }
    line = new Line(x0, y0, start, x1, y1, end, color != null ? color : 'black');
    figures.push(line);
    erase(line);
    if (start === 'arrow') {
      line.x0 -= d.x;
      line.y0 -= d.y;
    }
    if (end === 'arrow') {
      line.x1 += d.x;
      line.y1 += d.y;
    }
    return true;
  };
  extractText = function() {
    var color, end, m, prev, ref2, results, start, text;
    results = [];
    for (y = m = 0, ref2 = height; 0 <= ref2 ? m < ref2 : m > ref2; y = 0 <= ref2 ? ++m : --m) {
      x = 0;
      results.push((function() {
        var results1;
        results1 = [];
        while (x < width) {
          if (data[y][x] === ' ') {
            results1.push(x++);
          } else {
            start = end = x;
            while (end < width && data[y][end] !== ' ') {
              end++;
            }
            text = data[y].slice(start, end).join('');
            prev = figures[figures.length - 1];
            if ((prev != null ? prev.constructor.name : void 0) === 'Text' && prev.x0 + prev.text.length + 1 === start) {
              prev.text = prev.text + " " + text;
            } else {
              color = 'black';
              if (text[0] === '\\' && text[text.length - 1] === '\\') {
                text = text.substring(1, text.length - 1);
                color = '#666';
              }
              figures.push(new Text(x, y, text, color));
            }
            results1.push(x = end);
          }
        }
        return results1;
      })());
    }
    return results;
  };
  while (extractLine()) {}
  extractText();
  return figures;
};

var doc = document;

var $ = function(id) {
  return doc.getElementById(id);
};

var drawDiagram = function() {
  var canvas, ctx, figure, figures, height, j, k, len, len1, results, width;
  localStorage.setItem('leftPane', textarea.value);
  figures = parseASCIIArt($('textarea').value);
  width = 0;
  height = 0;
  for (j = 0, len = figures.length; j < len; j++) {
    figure = figures[j];
    if (figure.constructor.name === 'Line') {
      width = Math.max(width, X(figure.x1 + 1));
      height = Math.max(height, Y(figure.y1 + 1));
    }
  }
  canvas = $('canvas');
  canvas.width = width;
  canvas.height = height;
  ctx = new ShakyCanvas(canvas);
  results = [];
  for (k = 0, len1 = figures.length; k < len1; k++) {
    figure = figures[k];
    results.push(figure.draw(ctx));
  }
  return results;
};

var textarea = $('textarea');

textarea.addEventListener('change', function() {
  ga('send', {
    hitType: 'event',
    eventCategory: 'general',
    eventAction: 'click',
    eventLabel: 'redraw'
  });
  drawDiagram();
});
textarea.addEventListener('keyup', function() {
  ga('send', {
    hitType: 'event',
    eventCategory: 'general',
    eventAction: 'click',
    eventLabel: 'redraw'
  });
  drawDiagram();
});
doc.addEventListener('DOMContentLoaded', drawDiagram, false);
var oldText = localStorage.getItem('leftPane');
if (oldText)
  textarea.value = oldText;

if (doc.fonts)
  doc.fonts.ready.then(drawDiagram);
else
  setTimeout(drawDiagram, 2000); // Things you need to do for Edge and IE :(

$('download').addEventListener('click', function() {
  ga('send', {
    hitType: 'event',
    eventCategory: 'general',
    eventAction: 'click',
    eventLabel: 'download'
  });
  var dataURL = $('canvas').toDataURL('image/png');
  $('download').href = dataURL;
}, false);
$('close').addEventListener('click', function() {
  $('overlay').style['display'] = 'none';
}, false);
$('about').addEventListener('click', function() {
  ga('send', {
    hitType: 'event',
    eventCategory: 'general',
    eventAction: 'click',
    eventLabel: 'about'
  });
  $('overlay').style['display'] = 'block';
}, false);
