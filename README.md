# pure-recompose
recompose minus react dependency

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
