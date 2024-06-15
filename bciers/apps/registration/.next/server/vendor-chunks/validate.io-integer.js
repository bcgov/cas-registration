"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/validate.io-integer";
exports.ids = ["vendor-chunks/validate.io-integer"];
exports.modules = {

/***/ "(ssr)/../../node_modules/validate.io-integer/lib/index.js":
/*!***********************************************************!*\
  !*** ../../node_modules/validate.io-integer/lib/index.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("/**\n*\n*\tVALIDATE: integer\n*\n*\n*\tDESCRIPTION:\n*\t\t- Validates if a value is an integer.\n*\n*\n*\tNOTES:\n*\t\t[1]\n*\n*\n*\tTODO:\n*\t\t[1]\n*\n*\n*\tLICENSE:\n*\t\tMIT\n*\n*\tCopyright (c) 2014. Athan Reines.\n*\n*\n*\tAUTHOR:\n*\t\tAthan Reines. kgryte@gmail.com. 2014.\n*\n*/\n\n\n\n// MODULES //\n\nvar isNumber = __webpack_require__( /*! validate.io-number */ \"(ssr)/../../node_modules/validate.io-number/lib/index.js\" );\n\n\n// ISINTEGER //\n\n/**\n* FUNCTION: isInteger( value )\n*\tValidates if a value is an integer.\n*\n* @param {Number} value - value to be validated\n* @returns {Boolean} boolean indicating whether value is an integer\n*/\nfunction isInteger( value ) {\n\treturn isNumber( value ) && value%1 === 0;\n} // end FUNCTION isInteger()\n\n\n// EXPORTS //\n\nmodule.exports = isInteger;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi4vLi4vbm9kZV9tb2R1bGVzL3ZhbGlkYXRlLmlvLWludGVnZXIvbGliL2luZGV4LmpzIiwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFYTs7QUFFYjs7QUFFQSxlQUFlLG1CQUFPLEVBQUUsb0ZBQW9COzs7QUFHNUM7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVLFFBQVE7QUFDbEIsWUFBWSxTQUFTO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBLEVBQUU7OztBQUdGOztBQUVBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vLy4uLy4uL25vZGVfbW9kdWxlcy92YWxpZGF0ZS5pby1pbnRlZ2VyL2xpYi9pbmRleC5qcz8yZDBmIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuKlxuKlx0VkFMSURBVEU6IGludGVnZXJcbipcbipcbipcdERFU0NSSVBUSU9OOlxuKlx0XHQtIFZhbGlkYXRlcyBpZiBhIHZhbHVlIGlzIGFuIGludGVnZXIuXG4qXG4qXG4qXHROT1RFUzpcbipcdFx0WzFdXG4qXG4qXG4qXHRUT0RPOlxuKlx0XHRbMV1cbipcbipcbipcdExJQ0VOU0U6XG4qXHRcdE1JVFxuKlxuKlx0Q29weXJpZ2h0IChjKSAyMDE0LiBBdGhhbiBSZWluZXMuXG4qXG4qXG4qXHRBVVRIT1I6XG4qXHRcdEF0aGFuIFJlaW5lcy4ga2dyeXRlQGdtYWlsLmNvbS4gMjAxNC5cbipcbiovXG5cbid1c2Ugc3RyaWN0JztcblxuLy8gTU9EVUxFUyAvL1xuXG52YXIgaXNOdW1iZXIgPSByZXF1aXJlKCAndmFsaWRhdGUuaW8tbnVtYmVyJyApO1xuXG5cbi8vIElTSU5URUdFUiAvL1xuXG4vKipcbiogRlVOQ1RJT046IGlzSW50ZWdlciggdmFsdWUgKVxuKlx0VmFsaWRhdGVzIGlmIGEgdmFsdWUgaXMgYW4gaW50ZWdlci5cbipcbiogQHBhcmFtIHtOdW1iZXJ9IHZhbHVlIC0gdmFsdWUgdG8gYmUgdmFsaWRhdGVkXG4qIEByZXR1cm5zIHtCb29sZWFufSBib29sZWFuIGluZGljYXRpbmcgd2hldGhlciB2YWx1ZSBpcyBhbiBpbnRlZ2VyXG4qL1xuZnVuY3Rpb24gaXNJbnRlZ2VyKCB2YWx1ZSApIHtcblx0cmV0dXJuIGlzTnVtYmVyKCB2YWx1ZSApICYmIHZhbHVlJTEgPT09IDA7XG59IC8vIGVuZCBGVU5DVElPTiBpc0ludGVnZXIoKVxuXG5cbi8vIEVYUE9SVFMgLy9cblxubW9kdWxlLmV4cG9ydHMgPSBpc0ludGVnZXI7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/../../node_modules/validate.io-integer/lib/index.js\n");

/***/ })

};
;