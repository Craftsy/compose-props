import _ from 'lodash';
import shallowequal from 'shallowequal';

function baseMapStateToProps(propsMapper, viewModelName, state, props) {
  return {...props, ...propsMapper(state, props)};
}

export const mapStateToProps = _.curry(baseMapStateToProps);

// function baseMapPropsOnChange(depdendentPropKeys, propsMapper, state, props) {
//   const pickDependentProps = props => _.pick(props, depdendentPropKeys);
//   if (!this.computedProps) {
//     this.prevProps = props;
//     this.computedProps = propsMapper(state, props);
//   } else {
//     if (!shallowequal(
//       pickDependentProps(this.prevProps),
//       pickDependentProps(props)
//     )) {
//       this.computedProps = propsMapper(state, props);
//       this.prevProps = props;
//     }
//   }
//   return {...this.computedProps, ..._.omit(props, depdendentPropKeys)}
// }
//
// export const mapPropsOnChange = _.curry(baseMapPropsOnChange);

function baseSetPropTypes(propTypes, viewModelName, state, props) {
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

export const setPropTypes = _.curry(baseSetPropTypes);
