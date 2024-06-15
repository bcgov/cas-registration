"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/validate.io-integer-array";
exports.ids = ["vendor-chunks/validate.io-integer-array"];
exports.modules = {

/***/ "(ssr)/../../node_modules/validate.io-integer-array/lib/index.js":
/*!*****************************************************************!*\
  !*** ../../node_modules/validate.io-integer-array/lib/index.js ***!
  \*****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("/**\n*\n*\tVALIDATE: integer-array\n*\n*\n*\tDESCRIPTION:\n*\t\t- Validates if a value is an integer array.\n*\n*\n*\tNOTES:\n*\t\t[1]\n*\n*\n*\tTODO:\n*\t\t[1]\n*\n*\n*\tLICENSE:\n*\t\tMIT\n*\n*\tCopyright (c) 2015. Athan Reines.\n*\n*\n*\tAUTHOR:\n*\t\tAthan Reines. kgryte@gmail.com. 2015.\n*\n*/\n\n\n\n// MODULES //\n\nvar isArray = __webpack_require__( /*! validate.io-array */ \"(ssr)/../../node_modules/validate.io-array/lib/index.js\" ),\n\tisInteger = __webpack_require__( /*! validate.io-integer */ \"(ssr)/../../node_modules/validate.io-integer/lib/index.js\" );\n\n\n// IS INTEGER ARRAY //\n\n/**\n* FUNCTION: isIntegerArray( value )\n*\tValidates if a value is an integer array.\n*\n* @param {*} value - value to be validated\n* @returns {Boolean} boolean indicating if a value is an integer array\n*/\nfunction isIntegerArray( value ) {\n\tvar len;\n\tif ( !isArray( value ) ) {\n\t\treturn false;\n\t}\n\tlen = value.length;\n\tif ( !len ) {\n\t\treturn false;\n\t}\n\tfor ( var i = 0; i < len; i++ ) {\n\t\tif ( !isInteger( value[i] ) ) {\n\t\t\treturn false;\n\t\t}\n\t}\n\treturn true;\n} // end FUNCTION isIntegerArray()\n\n\n// EXPORTS //\n\nmodule.exports = isIntegerArray;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi4vLi4vbm9kZV9tb2R1bGVzL3ZhbGlkYXRlLmlvLWludGVnZXItYXJyYXkvbGliL2luZGV4LmpzIiwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFYTs7QUFFYjs7QUFFQSxjQUFjLG1CQUFPLEVBQUUsa0ZBQW1CO0FBQzFDLGFBQWEsbUJBQU8sRUFBRSxzRkFBcUI7OztBQUczQzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVUsR0FBRztBQUNiLFlBQVksU0FBUztBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQixTQUFTO0FBQzNCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFOzs7QUFHRjs7QUFFQSIsInNvdXJjZXMiOlsid2VicGFjazovLy8uLi8uLi9ub2RlX21vZHVsZXMvdmFsaWRhdGUuaW8taW50ZWdlci1hcnJheS9saWIvaW5kZXguanM/ZWViNCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbipcbipcdFZBTElEQVRFOiBpbnRlZ2VyLWFycmF5XG4qXG4qXG4qXHRERVNDUklQVElPTjpcbipcdFx0LSBWYWxpZGF0ZXMgaWYgYSB2YWx1ZSBpcyBhbiBpbnRlZ2VyIGFycmF5LlxuKlxuKlxuKlx0Tk9URVM6XG4qXHRcdFsxXVxuKlxuKlxuKlx0VE9ETzpcbipcdFx0WzFdXG4qXG4qXG4qXHRMSUNFTlNFOlxuKlx0XHRNSVRcbipcbipcdENvcHlyaWdodCAoYykgMjAxNS4gQXRoYW4gUmVpbmVzLlxuKlxuKlxuKlx0QVVUSE9SOlxuKlx0XHRBdGhhbiBSZWluZXMuIGtncnl0ZUBnbWFpbC5jb20uIDIwMTUuXG4qXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8vIE1PRFVMRVMgLy9cblxudmFyIGlzQXJyYXkgPSByZXF1aXJlKCAndmFsaWRhdGUuaW8tYXJyYXknICksXG5cdGlzSW50ZWdlciA9IHJlcXVpcmUoICd2YWxpZGF0ZS5pby1pbnRlZ2VyJyApO1xuXG5cbi8vIElTIElOVEVHRVIgQVJSQVkgLy9cblxuLyoqXG4qIEZVTkNUSU9OOiBpc0ludGVnZXJBcnJheSggdmFsdWUgKVxuKlx0VmFsaWRhdGVzIGlmIGEgdmFsdWUgaXMgYW4gaW50ZWdlciBhcnJheS5cbipcbiogQHBhcmFtIHsqfSB2YWx1ZSAtIHZhbHVlIHRvIGJlIHZhbGlkYXRlZFxuKiBAcmV0dXJucyB7Qm9vbGVhbn0gYm9vbGVhbiBpbmRpY2F0aW5nIGlmIGEgdmFsdWUgaXMgYW4gaW50ZWdlciBhcnJheVxuKi9cbmZ1bmN0aW9uIGlzSW50ZWdlckFycmF5KCB2YWx1ZSApIHtcblx0dmFyIGxlbjtcblx0aWYgKCAhaXNBcnJheSggdmFsdWUgKSApIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblx0bGVuID0gdmFsdWUubGVuZ3RoO1xuXHRpZiAoICFsZW4gKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cdGZvciAoIHZhciBpID0gMDsgaSA8IGxlbjsgaSsrICkge1xuXHRcdGlmICggIWlzSW50ZWdlciggdmFsdWVbaV0gKSApIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHRydWU7XG59IC8vIGVuZCBGVU5DVElPTiBpc0ludGVnZXJBcnJheSgpXG5cblxuLy8gRVhQT1JUUyAvL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGlzSW50ZWdlckFycmF5O1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/../../node_modules/validate.io-integer-array/lib/index.js\n");

/***/ })

};
;