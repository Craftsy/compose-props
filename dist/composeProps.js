'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mapProps = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.mapStateToProps = mapStateToProps;
exports.mapPropsOnChange = mapPropsOnChange;
exports.setPropTypes = setPropTypes;
exports.setStateTypes = setStateTypes;
exports.composeProps = composeProps;

var _lodash = require('lodash');

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
        return (0, _lodash.pick)(props, dependentPropKeys);
      };
      if (!(0, _shallowequal2.default)(pickDependentProps(prevProps), pickDependentProps(props))) {
        computedProps = propsMapper(state, props);
        prevProps = props;
      }
    }
    return _extends({}, (0, _lodash.omit)(props, dependentPropKeys), computedProps);
  };
}

function checkObjectTypes(types, obj, viewModelName) {
  if (process.env.NODE_ENV !== 'production') {
    Object.keys(types).forEach(function (key) {
      var message = types[key](obj, key, viewModelName);
      if (message) {
        console.error(message);
      }
    });
  }
}

/**
 * [setPropTypes method type description]
 * (c -> d) -> (a -> b -> b)
 */
function setPropTypes(propTypes, viewModelName) {
  return function setPropTypesMethod(state, props) {
    checkObjectTypes(propTypes, props, viewModelName);
    return props;
  };
}

/**
 * [setStateTypes method type description]
 * (c -> d) -> (a -> b -> b)
 */
function setStateTypes(stateTypes, viewModelName) {
  return function setStateTypesMethod(state, props) {
    checkObjectTypes(stateTypes, state, viewModelName);
    return props;
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
    return funcs.reduce(function (accProps, func) {
      return func(state, accProps);
    }, props);
  };
}
