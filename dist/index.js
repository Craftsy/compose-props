'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mapStateToProps = mapStateToProps;
exports.mapPropsOnChange = mapPropsOnChange;
exports.setPropTypes = setPropTypes;
exports.setStateTypes = setStateTypes;
exports.compose = compose;

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
  return function (state, props) {
    return _extends({}, props, propsMapper(state, props));
  };
}

/**
 * [mapPropsOnChange method type description]
 * [k] -> (a -> b -> b) -> (a -> b -> b)
 */
function mapPropsOnChange(dependentPropKeys, propsMapper) {
  var prevProps = undefined,
      computedProps = undefined;
  return function localMapPropsOnChange(state, props) {
    var pickDependentProps = function pickDependentProps(props) {
      return (0, _pick2.default)(props, dependentPropKeys);
    };
    if (!computedProps) {
      prevProps = props;
      computedProps = propsMapper(state, props);
    } else {
      if (!(0, _shallowequal2.default)(pickDependentProps(prevProps), pickDependentProps(props))) {
        computedProps = propsMapper(state, props);
        prevProps = props;
      }
    }
    return _extends({}, computedProps, (0, _omit2.default)(props, dependentPropKeys));
  };
}

/**
 * [setPropTypes method type description]
 * (c -> d) -> (a -> b -> b)
 */
function setPropTypes(propTypes, viewModelName) {
  return function (state, props) {
    if (process.env.NODE_ENV !== 'production') {
      Object.keys(propTypes).forEach(function (key) {
        var message = propTypes[key](props, key, viewModelName);
        if (message) {
          console.error(message);
        }
      });
    }
    return props;
  };
}

/**
 * [setStateTypes method type description]
 * (c -> d) -> (a -> b -> b)
 */
function setStateTypes(stateTypes, viewModelName) {
  return function (state, props) {
    if (process.env.NODE_ENV !== 'production') {
      Object.keys(stateTypes).forEach(function (key) {
        var message = stateTypes[key](state, key, viewModelName);
        if (message) {
          console.error(message);
        }
      });
    }
    return props;
  };
}

/**
 * [compose method type description]
 * [(a -> b -> b)] -> (a -> b -> b)
 */
function compose() {
  for (var _len = arguments.length, funcs = Array(_len), _key = 0; _key < _len; _key++) {
    funcs[_key] = arguments[_key];
  }

  return function (state, props) {
    return funcs.reduce(function (accProps, func) {
      return _extends({}, accProps, func(state, accProps));
    }, props);
  };
}
