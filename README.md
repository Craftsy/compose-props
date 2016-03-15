# compose-props
[recompose](https://github.com/acdlite/recompose) minus react dependency... ish

[![build status](https://img.shields.io/travis/craftsy/compose-props/master.svg?style=flat-square)](https://travis-ci.org/craftsy/compose-props)

Each compose-props method has the same argument signature of `(state, props)` and should return a new 'props' object.

`state` and/or the first argument stays consistent.

####composeProps(...functions)
You can combine/compose `compose-props` methods using `composeProps`, **but it is not a standard compose function**.

Each function you pass to `composeProps` will be called with `(state, props)` and should return a new 'props' object.

`state` should be considered immutable and will consistently be the first argument to every function composed with `composeProps`.

`composeProps` calls each passed function from left to right(top to bottom) with the same `state` but with the previous functions returned 'props' object as the new `props`.


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
