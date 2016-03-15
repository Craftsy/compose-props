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

function checkObjectTypes (types, obj, viewModelName) {
  if (process.env.NODE_ENV !== 'production') {
    Object.keys(types).forEach((key) => {
      const message = types[key](obj, key, viewModelName)
      if (message) {
        console.error(message)
      }
    })
  }
}

/**
 * [setPropTypes method type description]
 * (c -> d) -> (a -> b -> b)
 */
export function setPropTypes (propTypes, viewModelName) {
  return function setPropTypesMethod (state, props) {
    checkObjectTypes(propTypes, props, viewModelName)
    return props
  }
}

/**
 * [setStateTypes method type description]
 * (c -> d) -> (a -> b -> b)
 */
export function setStateTypes (stateTypes, viewModelName) {
  return function setStateTypesMethod (state, props) {
    checkObjectTypes(stateTypes, state, viewModelName)
    return props
  }
}

/**
 * [composeProps method type description]
 * [(a -> b -> b)] -> (a -> b -> b)
 */
export function composeProps (...funcs) {
  return function composePropsMethod (state, props) {
    props = props || {}
    return funcs.reduce((accProps, func) => {
      return func(state, accProps)
    }, props)
  }
}
