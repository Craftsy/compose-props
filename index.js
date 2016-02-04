import _ from 'lodash';
import shallowequal from 'shallowequal';

/**
 * [mapStateToProps description]
 * (a -> b -> b) -> (a -> b -> b)
 */
export function mapStateToProps(propsMapper) {
  return (state, props) => {
    return {...props, ...propsMapper(state, props)};
  }
}

/**
 * [mapPropsOnChange description]
 * [k] -> (a -> b -> b) -> (a -> b -> b)
 */
export function mapPropsOnChange(dependentPropKeys, propsMapper) {
  let prevProps, computedProps;
  return function localMapPropsOnChange(state, props) {
    const pickDependentProps = props => _.pick(props, dependentPropKeys);
    if (!computedProps) {
      prevProps = props;
      computedProps = propsMapper(state, props);
    } else {
      if (!shallowequal(
        pickDependentProps(prevProps),
        pickDependentProps(props)
      )) {
        computedProps = propsMapper(state, props);
        prevProps = props;
      }
    }
    return {...computedProps, ..._.omit(props, dependentPropKeys)};
  }
}

/**
 * [setPropTypes description]
 * (c -> d) -> (a -> b -> b)
 */
export function setPropTypes(propTypes, viewModelName) {
  return (state, props) => {
    if (process.env.NODE_ENV !== 'production') {
      Object.keys(propTypes).forEach((key) => {
        const message = propTypes[key](props, key, viewModelName);
        if (message) {
          console.error(message);
        }
      })
    }
    return props;
  }
}

/**
 * [compose description]
 * [(a -> b -> b)] -> b
 */
export function compose(...funcs) {
  return (state, props) => {
    return funcs.reduce((accProps, func) => {
      return {...accProps, ...func(state, accProps)};
    }, props);
  }
}
