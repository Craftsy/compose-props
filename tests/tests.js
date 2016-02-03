import test from 'tape';
import {mapStateToProps, mapPropsOnChange, setPropTypes} from '../index.js';
import {PropTypes} from 'react';

test('mapStateToProps', function (t) {
  t.plan(1);
  const state = {set: [{id:1}, {id:2}]};
  const props = {a: 1, b: {c: 2}};

  const newPropsFunction = function(state, props) {
    return {
      item: state.set.filter((item)=>item.id === props.a)[0],
    }
  }
  const curriedMapProps = mapStateToProps(newPropsFunction, 'mapStateToPropsTest');
  t.deepEqual(curriedMapProps(state, props), {item: {id:1}, a: 1, b: {c: 2}});
});

// test('mapPropsOnChange', function (t) {
//   t.plan(5);
//   const state = {set: [{id:1}, {id:2}]};
//   const props = {item: {id:1}, a: 1, b: {c: 2}};
//
//   let mapStateToPropsFuncCalled = 0;
//
//   const newPropsFunction = function(state, {item}) {
//     mapStateToPropsFuncCalled += 1;
//     return {
//       thing: {...item, key: `key-${item.id}`},
//     }
//   }
//   const curried = mapPropsOnChange(['item'], newPropsFunction);
//   t.deepEqual(curried(state, props), {thing: {id:1, key:'key-1'}, a: 1, b: {c: 2}});
//   t.equal(mapStateToPropsFuncCalled, 1);
//
//   // run again with same props to assert the function was not run again
//   curried(state, props);
//   t.equal(mapStateToPropsFuncCalled, 1);
//
//   // run with new props now
//   const newProps = {item: {id:2}, a: 1, b: {c: 2}};
//   t.deepEqual(curried(state, newProps), {thing: {id:2, key:'key-2'}, a: 1, b: {c: 2}});
//   t.equal(mapStateToPropsFuncCalled, 2);
// });


test('setPropTypes', function (t) {
  // we can't really test if a console.error gets printed, so you have to check the console
  t.plan(2);
  const state = {};
  const props = {a: 1, b: {c: false}, d: 'b'};

  const testPropTypes = {
    a: PropTypes.number.isRequired,
    b: PropTypes.shape({c: PropTypes.bool.isRequired}).isRequired,
    d: PropTypes.string.isRequired,
  }
  const curriedSetPropTypes = setPropTypes(testPropTypes, 'setPropTypes');
  t.deepEqual(curriedSetPropTypes(state, props), {a: 1, b: {c: false}, d: 'b'});

  const badProps = {a: '1', b: {c: false}, d: 'b'};
  t.deepEqual(curriedSetPropTypes(state, badProps), {a: '1', b: {c: false}, d: 'b'});
});

// test('compose', function (t) {
//   compose(
//     mapProps(({yay})=>({yay})),
//     mapPropsOnChange(['yay'], ({yay})=>{boo: yay.boo}),
//     setPropTypes,
//   )(state, props) // => {props}
// });
