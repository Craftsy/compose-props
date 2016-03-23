import {pick, omit} from 'lodash'
import shallowequal from 'shallowequal'

/**
 * [mapStateToProps method type description]
 * (a -> b -> b) -> (a -> b -> b)
 */
export function mapStateToProps (propsMapper) {
  return function mapStateToPropsMethod (state, props) {
    return {...props, ...propsMapper(state, props)}
  }
}

// alias of mapStateToProps
export const mapProps = mapStateToProps

/**
 * [mapPropsOnChange method type description]
 * [k] -> (a -> b -> b) -> (a -> b -> b)
 */
export function mapPropsOnChange (dependentPropKeys, propsMapper) {
  let prevProps, computedProps
  return function mapPropsOnChangeMethod (state, props) {
    if (!computedProps) {
      prevProps = props
      computedProps = propsMapper(state, props)
    } else {
      const pickDependentProps = (props) => pick(props, dependentPropKeys)
      if (!shallowequal(
        pickDependentProps(prevProps),
        pickDependentProps(props)
      )) {
        computedProps = propsMapper(state, props)
        prevProps = props
      }
    }
    return {...omit(props, dependentPropKeys), ...computedProps}
  }
}

export function hasObjectTypeError (types, obj, viewModelName = 'hasObjectTypeError Checker') {
  // Always perform checks when running on react native
  if ((typeof navigator !== 'undefined' && navigator.product === 'ReactNative') ||
  (typeof process === 'undefined' || process.env.NODE_ENV !== 'production')) {
    return Object.keys(types).reduce((acc, key) => {
      const message = types[key](obj, key, viewModelName)
      if (message) {
        console.warn(message)
        return true
      }
      return acc || false
    }, false)
  }
  return false
}

/**
 * [setPropTypes method type description]
 * (c -> d) -> (a -> b -> b)
 */
export function setPropTypes (propTypes, viewModelName = 'setPropTypes Checker') {
  return function setPropTypesMethod (state, props) {
    // return null if checker found errors
    return hasObjectTypeError(propTypes, props, viewModelName) ? null : props
  }
}

/**
 * [setStateTypes method type description]
 * (c -> d) -> (a -> b -> b)
 */
export function setStateTypes (stateTypes, viewModelName = 'setStateTypes Checker') {
  return function setStateTypesMethod (state, props) {
    return hasObjectTypeError(stateTypes, state, viewModelName) ? null : props
  }
}

/**
 * [composeProps method type description]
 * [(a -> b -> b)] -> (a -> b -> b)
 */
export function composeProps (...funcs) {
  return function composePropsMethod (state, props) {
    props = props || {}
    const composedProps = funcs.reduce((accProps, func) => {
      // Short circuit if accProps are null, React Native helper
      if (accProps === null) return null
      return func(state, accProps)
    }, props)
    return composedProps || {}
  }
}
