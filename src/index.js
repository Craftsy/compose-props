import pick from 'lodash/pick';
import omit from 'lodash/omit';
import shallowequal from 'shallowequal';

/**
 * [mapStateToProps method type description]
 * (a -> b -> b) -> (a -> b -> b)
 */
export function mapStateToProps(propsMapper) {
  return (state, props) => {
    return {...props, ...propsMapper(state, props)};
  }
}

/**
 * [mapPropsOnChange method type description]
 * [k] -> (a -> b -> b) -> (a -> b -> b)
 */
export function mapPropsOnChange(dependentPropKeys, propsMapper) {
  let prevProps, computedProps;
  return function localMapPropsOnChange(state, props) {
    const pickDependentProps = props => pick(props, dependentPropKeys);
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
    return {...computedProps, ...omit(props, dependentPropKeys)};
  }
}

/**
 * [setPropTypes method type description]
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
 * [setStateTypes method type description]
 * (c -> d) -> (a -> b -> b)
 */
export function setStateTypes(stateTypes, viewModelName) {
  return (state, props) => {
    if (process.env.NODE_ENV !== 'production') {
      Object.keys(stateTypes).forEach((key) => {
        const message = stateTypes[key](state, key, viewModelName);
        if (message) {
          console.error(message);
        }
      })
    }
    return props;
  }
}

/**
 * [compose method type description]
 * [(a -> b -> b)] -> (a -> b -> b)
 */
export function compose(...funcs) {
  return (state, props) => {
    return funcs.reduce((accProps, func) => {
      return {...accProps, ...func(state, accProps)};
    }, props);
  }
}
