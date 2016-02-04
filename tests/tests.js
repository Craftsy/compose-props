import test from 'tape';
import {mapStateToProps, mapPropsOnChange, setPropTypes, compose} from '../index.js';
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
  const statePropsFunc = mapStateToProps(newPropsFunction);
  t.deepEqual(
    statePropsFunc(state, props),
    {item: {id:1}, a: 1, b: {c: 2}},
    'Output from state to props correct'
  );
});

test('mapPropsOnChange', function (t) {
  t.plan(5);
  const state = {set: [{id:1}, {id:2}]};
  const props = {item: {id:1}, a: 1, b: {c: 2}};

  let mapStateToPropsFuncCalled = 0;

  const newPropsFunction = function(state, {item}) {
    mapStateToPropsFuncCalled += 1;
    return {
      thing: {...item, key: `key-${item.id}`},
    }
  }
  const statePropsFunc = mapPropsOnChange(['item'], newPropsFunction);
  t.deepEqual(
    statePropsFunc(state, props),
    {thing: {id:1, key:'key-1'}, a: 1, b: {c: 2}},
    'Correct initial output props'
  );
  t.equal(mapStateToPropsFuncCalled, 1, 'initial propMapper function called');

  // run again with same props to assert the function was not run again
  statePropsFunc(state, props);
  t.equal(mapStateToPropsFuncCalled, 1, 'Props unchanged, should not call propMapper function');

  // run with new props now
  const newProps = {item: {id:2}, a: 1, b: {c: 2}};
  t.deepEqual(
    statePropsFunc(state, newProps),
    {thing: {id:2, key:'key-2'}, a: 1, b: {c: 2}},
    'Correct output props from newProps'
  );
  t.equal(mapStateToPropsFuncCalled, 2, 'Props changed, propMapper function called');
});


test('setPropTypes', function (t) {
  // mocking console.error for test purposes... gross...
  let testError = 'no errors';
  const oldError = console.error;
  console.error = (err) => {
    testError = err;
  }

  t.plan(4);
  const state = {};
  const props = {a: 1, b: {c: false}, d: 'b'};

  const testPropTypes = {
    a: PropTypes.number.isRequired,
    b: PropTypes.shape({c: PropTypes.bool.isRequired}).isRequired,
    d: PropTypes.string.isRequired,
  }
  const statePropsFunc = setPropTypes(testPropTypes, 'setPropTypesTest');
  t.deepEqual(
    statePropsFunc(state, props),
    {a: 1, b: {c: false}, d: 'b'},
    'Props should not mutate'
  );
  t.equal(
    testError,
    'no errors',
    'Should not error with incorrect props'
  );

  const badProps = {a: '1', b: {c: false}, d: 'b'};
  t.deepEqual(
    statePropsFunc(state, badProps),
    {a: '1', b: {c: false}, d: 'b'},
    'Props should not mutate'
  );
  t.equal(
    true,
    RegExp('setPropTypesTest').test(testError),
    'Should error with incorrect props'
  );

  // clean up console.error
  console.error = oldError;
});

test('compose works with functions that take in (state, props)', function (t) {
  t.plan(3);

  let calledFuncCount = 0;

  const statePropsFunc = compose(
    (state, props) => {
      calledFuncCount += 1;
      return {a: 1};
    },
    (state, props) => {
      calledFuncCount += 1;
      return {a: 2, b: 2};
    },
  );

  t.equal(calledFuncCount, 0, 'compose has not been called yet');

  const testProps = statePropsFunc({}, {});

  t.equal(calledFuncCount, 2, 'all functions called within compose');
  t.deepEqual(testProps, {a: 2, b: 2}, 'correct output');
});

test('compose works with mapStateToProps, setPropTypes, and mapPropsOnChange', (t) => {
  // mocking console.error for test purposes... gross...
  let testError = 'no errors';
  const oldError = console.error;
  console.error = (err) => {
    testError = err;
  }

  t.plan(9);

  let calledComposeCount = 0;
  let calledOnChangeCount = 0;

  const statePropsFunc = compose(
    setPropTypes({id: PropTypes.string.isRequired}),
    mapStateToProps((state, props) => {
      calledComposeCount += 1;
      return {peep: state.peeps[props.id]};
    }),
    mapPropsOnChange(['peep'], (state, {peep}) => {
      calledOnChangeCount += 1;
      return {peep: peep, count: peep.extra + 1};
    })
  );

  const initState = {peeps: {bob: {extra: 1}, susan: {extra: 2}}};
  const initProps = {id: 'bob'};

  t.deepEqual(
    statePropsFunc(initState, initProps),
    {peep: {extra: 1}, count: 2, id: 'bob'},
    'Computed props from compose are correct'
  );
  t.equal(calledComposeCount, 1, 'Compose called once');
  t.equal(calledOnChangeCount, 1, 'On change func called once');

  // call again nothing changed
  statePropsFunc(initState, initProps)
  t.equal(calledComposeCount, 2, 'Compose called twice');
  t.equal(calledOnChangeCount, 1, 'On change func still only called once');

  // props changed
  const newProps = {id: 'susan'};
  t.deepEqual(
    statePropsFunc(initState, newProps),
    {peep: {extra: 2}, count: 3, id: 'susan'},
    'Computed props from compose are correct with new props'
  );
  t.equal(calledComposeCount, 3, 'Compose called twice');
  t.equal(calledOnChangeCount, 2, 'On change func still only called once');

  // no propType errors were found
  t.equal(testError, 'no errors', 'no proptype errors were found');

  // clean up console.error
  console.error = oldError;
});
