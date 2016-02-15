# compose-props
[recompose](https://github.com/acdlite/recompose) minus react dependency

[![build status](https://img.shields.io/travis/hartzis/compose-props/master.svg?style=flat-square)](https://travis-ci.org/hartzis/compose-props)

example use with [react-redux](https://github.com/rackt/react-redux) `connect`:

```
import {compoes, setStateTypes, setPropTypes, mapStateToProps, mapPropsOnChange} from 'pure-compose';\
import {connect} from 'react-redux';
import {PropTypes} from 'react';
import View from './View.jsx';

const pureCompose = compose(
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

export default connect(pureCompose)(View);
```
