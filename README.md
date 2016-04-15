# compose-props
[recompose](https://github.com/acdlite/recompose) minus react dependency... ish

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![build status](https://img.shields.io/travis/Craftsy/compose-props/master.svg?style=flat-square)](https://travis-ci.org/Craftsy/compose-props)

Each compose-props method has the same argument signature of `(state, props)` and should return a new 'props' object.

`state` and/or the first argument stays consistent.

####composeProps(...functions)
You can 'compose' `compose-props` methods using `composeProps`, **but it is not a standard compose function**.

Each function you pass to `composeProps` will be called with `(state, props)` and should return a new 'props' object.

`state` should be considered immutable and will consistently be the first argument to every function composed with `composeProps`.

`composeProps` calls each passed function from left to right(top to bottom) with the same `state` but with the previous functions returned 'props' object as the new `props`.

**NOTE** If the value `null` is returned from any of the composed functions, the `composeProps` will short circuit, and return an empty object`{}`.

#####React Native
At Craftsy we are using this library both on the web and on ios/android with [React Native](https://facebook.github.io/react-native/).

For this reason we use the `setStateTypes` and `setPropTypes` checkers as fail safes that return and empty object`{}` from `composeProps` when there is a state/prop type error.

####setStateTypes / setPropTypes - object value checkers
These can and probably should be used for your input contract to `composeProps` and your output contract. They are based off [react propTypes](https://facebook.github.io/react/docs/reusable-components.html#prop-validation) and require the same method signature, `function(props, propName, componentName)`.

**NOTE:** These object value checkers will short circuit if an error is found, `console.warn()` the error, and finally return `null`.

####Example
example use with [react-redux](https://github.com/rackt/react-redux) `connect`:

```
import {composeProps, setStateTypes, setPropTypes, mapStateToProps, mapPropsOnChange} from 'compose-props';\
import {connect} from 'react-redux';
import {PropTypes} from 'react';
import View from './View.jsx';

const computedProps = composeProps(
  setStateTypes({
    items: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
    })).isRequired,
  }),
  setPropTypes({id: PropTypes.string.isRequired}),
  mapStateToProps((state, props) => {
    return {thing: state.items.filter((item)=>item.id === props.id)[0]};
  }),
  mapPropsOnChange(['thing'], (state, {thing}) => {
    return {thing, extra: 'added prop'};
  })
);

export default connect(computedProps)(View);
```
