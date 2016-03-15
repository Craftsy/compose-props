/* global describe, it, afterEach, beforeEach */
import {expect} from 'chai'
import {mapStateToProps, mapPropsOnChange, setPropTypes, setStateTypes, composeProps} from '../src/composeProps.js'
import {PropTypes} from 'react'

describe('compose-props', () => {
  describe('mapStateToProps()', () => {
    const initState = {set: [{ id: 1 }, { id: 2 }]}
    const initProps = {a: 1, b: {c: 2}}

    it('should call propMapper function with state and props', () => {
      const newPropsFunction = function (passedState, passedProps) {
        expect(passedState).to.deep.equal(initState)
        expect(passedProps).to.deep.equal(initProps)
        return {}
      }
      const statePropsFunc = mapStateToProps(newPropsFunction)
      statePropsFunc(initState, initProps)
    })
    it('should return new object with initial props spread first then returned propMapper object spread', () => {
      const newPropsFunction = function (passedState, passedProps) {
        return {b: 3}
      }
      const statePropsFunc = mapStateToProps(newPropsFunction)
      const newObject = statePropsFunc(initState, initProps)
      expect(newObject).to.deep.equal({a: 1, b: 3})
    })
  })

  describe('mapPropsOnChange()', () => {
    const initState = {set: [{ id: 1 }, { id: 2 }]}
    const initProps = {a: 1, b: {c: 2}}

    it('should call propMapper function with state and props', () => {
      const newPropsFunction = function (passedState, passedProps) {
        expect(passedState).to.deep.equal(initState)
        expect(passedProps).to.deep.equal(initProps)
        return {}
      }
      const statePropsFunc = mapPropsOnChange(['b'], newPropsFunction)
      statePropsFunc(initState, initProps)
    })
    it('should return new object with initial props(omiting watched keys) spread first then returned propMapper object spread', () => {
      const newPropsFunction = function (passedState, passedProps) {
        return {a: 3}
      }
      const statePropsFunc = mapPropsOnChange(['b'], newPropsFunction)
      const newObject = statePropsFunc(initState, initProps)
      expect(newObject).to.deep.equal({a: 3})
    })
    it('should only call propMapper once if watched props are unchanged', () => {
      let propMapperCalled = 0
      const newPropsFunction = function (passedState, passedProps) {
        propMapperCalled += 1
        return {}
      }
      const statePropsFunc = mapPropsOnChange(['b'], newPropsFunction)
      statePropsFunc(initState, initProps)
      statePropsFunc(initState, initProps)
      expect(propMapperCalled).to.equal(1)
    })
    it('should call propMapper again when watched props are changed', () => {
      let propMapperCalled = 0
      const newPropsFunction = function (passedState, passedProps) {
        propMapperCalled += 1
        return {}
      }
      const statePropsFunc = mapPropsOnChange(['b'], newPropsFunction)
      statePropsFunc(initState, initProps)
      statePropsFunc(initState, {a: 1, b: {c: 3}})
      expect(propMapperCalled).to.equal(2)
    })
  })

  describe('setPropTypes()', () => {
    let oldConsoleError
    let testError = 'no errors'
    const testText = 'setPropTypesTest'

    beforeEach(() => {
      // mocking console.error for test purposes... gross...
      oldConsoleError = console.error
      console.error = (err) => {
        testError = err
      }
    })
    afterEach(() => {
      console.error = oldConsoleError
      testError = 'no errors'
    })

    const initState = {}
    const initProps = {a: 1, b: {c: 2}}
    const testPropTypes = {
      a: PropTypes.number.isRequired,
      b: PropTypes.shape({c: PropTypes.number.isRequired}).isRequired
    }

    it('should return props', () => {
      const statePropsFunc = setPropTypes({}, testText)
      const outputProps = statePropsFunc(initState, initProps)
      expect(outputProps).to.deep.equal(initProps)
    })
    it('should not error with passing propTypes', () => {
      const statePropsFunc = setPropTypes(testPropTypes, testText)
      statePropsFunc(initState, initProps)
      expect(testError).to.equal('no errors')
    })
    it('should error when there are errors in propTypes', () => {
      const badProps = {}
      const statePropsFunc = setPropTypes(testPropTypes, testText)
      statePropsFunc(initState, badProps)
      expect(testError).to.not.equal('no errors')
    })
  })

  describe('setStateTypes()', () => {
    let oldConsoleError
    let testError = 'no errors'
    const testText = 'setStateTypesTest'

    beforeEach(() => {
      // mocking console.error for test purposes... gross...
      oldConsoleError = console.error
      console.error = (err) => {
        testError = err
      }
    })
    afterEach(() => {
      console.error = oldConsoleError
      testError = 'no errors'
    })

    const initState = {set: [{ id: 1 }, { id: 2 }]}
    const initProps = {}
    const testStateProps = {
      set: PropTypes.arrayOf(PropTypes.shape({id: PropTypes.number.isRequired})).isRequired
    }

    it('should return props', () => {
      const statePropsFunc = setStateTypes({}, testText)
      const outputProps = statePropsFunc(initState, initProps)
      expect(outputProps).to.deep.equal(initProps)
    })
    it('should not error with passing stateTypes', () => {
      const statePropsFunc = setStateTypes(testStateProps, testText)
      statePropsFunc(initState, initProps)
      expect(testError).to.equal('no errors')
    })
    it('should error when there are errors in stateTypes', () => {
      const badState = {}
      const statePropsFunc = setStateTypes(testStateProps, testText)
      statePropsFunc(badState, initProps)
      expect(testError).to.not.equal('no errors')
    })
  })

  describe('composeProps()', () => {
    const initState = {set: [{ id: 1 }, { id: 2 }]}
    const initProps = {a: 1, b: {c: 2}}

    it('should default props to empty object and pass in state', () => {
      const statePropsFunc = composeProps(
        (passedState, passedProps) => {
          expect(passedProps).to.deep.equal({})
          expect(passedState).to.deep.equal(initState)
        }
      )
      statePropsFunc(initState)
    })

    it('should work with any function that takes in (state, props), and return last functions returned object', () => {
      let calledFuncCount = 0
      const statePropsFunc = composeProps(
        (state, props) => {
          calledFuncCount += 1
          expect(props).to.deep.equal(initProps)
          return {a: 1}
        },
        (state, props) => {
          calledFuncCount += 1
          expect(props).to.deep.equal({a: 1})
          return {c: 1}
        }
      )
      expect(calledFuncCount).to.equal(0)
      const finalProps = statePropsFunc(initState, initProps)
      expect(calledFuncCount).to.equal(2)
      expect(finalProps).to.deep.equal({c: 1})
    })

    describe('works with other compose-props methods', () => {
      let oldConsoleError
      let testError = 'no errors'
      beforeEach(() => {
        // mocking console.error for test purposes... gross...
        oldConsoleError = console.error
        console.error = (err) => {
          testError = err
        }
      })
      afterEach(() => {
        console.error = oldConsoleError
        testError = 'no errors'
      })

      it('should work with mapStateToProps, setPropTypes, setStateTypes, and mapPropsOnChange', () => {
        const testStateProps = {
          set: PropTypes.arrayOf(PropTypes.shape({id: PropTypes.number.isRequired})).isRequired
        }
        const testPropTypes = {
          a: PropTypes.number.isRequired,
          b: PropTypes.shape({c: PropTypes.number.isRequired}).isRequired
        }
        let calledComposeCount = 0
        let calledOnChangeCount = 0
        const initState = {set: [{ id: 1 }, { id: 2 }]}
        const initProps = {a: 1, b: {c: 2}}

        const statePropsFunc = composeProps(
          (s, p) => {
            calledComposeCount += 1
            return p
          },
          setStateTypes(testStateProps, 'compose setStateTypes'),
          setPropTypes(testPropTypes, 'compose setPropTypes'),
          mapStateToProps((passedState, passedProps) => {
            expect(passedState).to.deep.equal(initState)
            expect(passedProps).to.deep.equal(initProps)
            return {d: 4}
          }),
          mapPropsOnChange(['b'], (passedState, passedProps) => {
            expect(passedState).to.deep.equal(initState)
            expect(passedProps).to.deep.equal({...initProps, d: 4})
            calledOnChangeCount += 1
            return {e: 5}
          })
        )

        expect(calledComposeCount).to.equal(0)
        expect(calledOnChangeCount).to.equal(0)

        const expectOutProps = {a: 1, d: 4, e: 5}
        const firstRunProps = statePropsFunc(initState, initProps)
        expect(calledComposeCount).to.equal(1)
        expect(calledOnChangeCount).to.equal(1)
        expect(firstRunProps).to.deep.equal(expectOutProps)
        expect(testError).to.equal('no errors')

        const secondRunProps = statePropsFunc(initState, initProps)
        expect(calledComposeCount).to.equal(2)
        expect(calledOnChangeCount).to.equal(1)
        expect(secondRunProps).to.deep.equal(expectOutProps)
      })
    })
    it('should \'compose\' other composeProps\'s output', () => {
      const state = {b: 1}
      const statePropsFunc = composeProps(
        (passedState, passedProps) => {
          expect(passedProps).to.deep.equal({})
          expect(passedState).to.deep.equal(state)
          return {a: 1}
        },
        composeProps(
          (passedState, passedProps) => {
            expect(passedProps).to.deep.equal({a: 1})
            expect(passedState).to.deep.equal(state)
            return {c: 1}
          }
        )
      )
      const finalProps = statePropsFunc(state)
      expect(finalProps).to.deep.equal({c: 1})
    })
  })
})
