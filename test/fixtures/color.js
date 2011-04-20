
/**
 * Parse `rgb` string, ex "#ff0000".
 */

var parseRGB = exports.parseRGB = function(rgb) {
  if ('#' == rgb[0]) rgb = rgb.substr(1);
  var rgb = parseInt(rgb, 16);
  return {
      r: (rgb & 0xff0000) >> 16
    , g: (rgb & 0x00ff00) >> 8
    , b: (rgb & 0x0000ff)
  }
};

/**
 * Parse `rgb` string and return the lightness
 * value, aka an average of the max/min components.
 */

var lightness = exports.lightness = function(rgb){
  rgb = parseRGB(rgb);
  var r = rgb.r / 255
    , g = rgb.g / 255
    , b = rgb.b / 255
    , min = Math.min(r,g,b)
    , max = Math.max(r,g,b);
  return (min + max) / 2 * 100;
};

/**
 * Return true if the `rgb` string is light. 
 */

exports.light = function(rgb) {
  return lightness(rgb) > 50;
};

/**
 * Return true if the `rgb` string is dark.
 */

exports.dark = function(rgb) {
  return lightness(rgb) <= 50;
};