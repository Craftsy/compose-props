'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mapProps = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.mapStateToProps = mapStateToProps;
exports.mapPropsOnChange = mapPropsOnChange;
exports.hasObjectTypeError = hasObjectTypeError;
exports.setPropTypes = setPropTypes;
exports.setStateTypes = setStateTypes;
exports.composeProps = composeProps;

var _pick = require('lodash/pick');

var _pick2 = _interopRequireDefault(_pick);

var _omit = require('lodash/omit');

var _omit2 = _interopRequireDefault(_omit);

var _shallowequal = require('shallowequal');

var _shallowequal2 = _interopRequireDefault(_shallowequal);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * [mapStateToProps method type description]
 * (a -> b -> b) -> (a -> b -> b)
 */
function mapStateToProps(propsMapper) {
  return function mapStateToPropsMethod(state, props) {
    return _extends({}, props, propsMapper(state, props));
  };
}

// alias of mapStateToProps
var mapProps = exports.mapProps = mapStateToProps;

/**
 * [mapPropsOnChange method type description]
 * [k] -> (a -> b -> b) -> (a -> b -> b)
 */
function mapPropsOnChange(dependentPropKeys, propsMapper) {
  var prevProps = void 0,
      computedProps = void 0;
  return function mapPropsOnChangeMethod(state, props) {
    if (!computedProps) {
      prevProps = props;
      computedProps = propsMapper(state, props);
    } else {
      var pickDependentProps = function pickDependentProps(props) {
        return (0, _pick2.default)(props, dependentPropKeys);
      };
      if (!(0, _shallowequal2.default)(pickDependentProps(prevProps), pickDependentProps(props))) {
        computedProps = propsMapper(state, props);
        prevProps = props;
      }
    }
    return _extends({}, (0, _omit2.default)(props, dependentPropKeys), computedProps);
  };
}

function hasObjectTypeError(types, obj) {
  var viewModelName = arguments.length <= 2 || arguments[2] === undefined ? 'hasObjectTypeError Checker' : arguments[2];

  // Always perform checks when running on react native
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative' || typeof process === 'undefined' || process.env.NODE_ENV !== 'production') {
    return Object.keys(types).reduce(function (acc, key) {
      var message = types[key](obj, key, viewModelName);
      if (message) {
        console.warn(message);
        return true;
      }
      return acc || false;
    }, false);
  }
  return false;
}

/**
 * [setPropTypes method type description]
 * (c -> d) -> (a -> b -> b)
 */
function setPropTypes(propTypes) {
  var viewModelName = arguments.length <= 1 || arguments[1] === undefined ? 'setPropTypes Checker' : arguments[1];

  return function setPropTypesMethod(state, props) {
    // return null if checker found errors
    return hasObjectTypeError(propTypes, props, viewModelName) ? null : props;
  };
}

/**
 * [setStateTypes method type description]
 * (c -> d) -> (a -> b -> b)
 */
function setStateTypes(stateTypes) {
  var viewModelName = arguments.length <= 1 || arguments[1] === undefined ? 'setStateTypes Checker' : arguments[1];

  return function setStateTypesMethod(state, props) {
    return hasObjectTypeError(stateTypes, state, viewModelName) ? null : props;
  };
}

/**
 * [composeProps method type description]
 * [(a -> b -> b)] -> (a -> b -> b)
 */
function composeProps() {
  for (var _len = arguments.length, funcs = Array(_len), _key = 0; _key < _len; _key++) {
    funcs[_key] = arguments[_key];
  }

  return function composePropsMethod(state, props) {
    props = props || {};
    var composedProps = funcs.reduce(function (accProps, func) {
      // Short circuit if accProps are null, React Native helper
      if (accProps === null) return null;
      return func(state, accProps);
    }, props);
    return composedProps || {};
  };
}
