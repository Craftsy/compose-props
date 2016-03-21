/* global describe, it, afterEach, beforeEach */
import {expect} from 'chai'
import {mapStateToProps, mapPropsOnChange, hasObjectTypeError, setPropTypes, setStateTypes, composeProps} from '../src/composeProps.js'
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

  describe('hasObjectTypeError() - used by setStateTypes and setPropTypes', () => {
    let oldConsoleWarn
    let testError = 'no errors'
    beforeEach(() => {
      // mocking console.warn for test purposes... gross...
      oldConsoleWarn = console.warn
      console.warn = (err) => {
        testError = err
      }
    })
    afterEach(() => {
      console.warn = oldConsoleWarn
      testError = 'no errors'
    })

    const dataObject = {a: 1, b: {c: 2}}
    const testObjectTypes = {
      a: PropTypes.number.isRequired,
      b: PropTypes.shape({c: PropTypes.number.isRequired}).isRequired
    }

    it('should return false when there are no error', () => {
      const hasErrors = hasObjectTypeError({}, dataObject)
      expect(hasErrors).to.deep.equal(false)
    })
    it('should return false and not console.warn any errors with passing propTypes', () => {
      const hasErrors = hasObjectTypeError(testObjectTypes, dataObject)
      expect(hasErrors).to.deep.equal(false)
      expect(testError).to.equal('no errors')
    })
    it('should return true and console.warn errors when there are errors in propTypes', () => {
      const hasErrors = hasObjectTypeError(testObjectTypes, {})
      expect(hasErrors).to.deep.equal(true)
      expect(testError).to.not.equal('no errors')
    })

    describe('hasObjectTypeError tests which NODE_ENV environment', () => {
      let oldEnv
      beforeEach(() => {
        oldEnv = process.env.NODE_ENV
      })
      afterEach(() => {
        process.env.NODE_ENV = oldEnv
      })
      it('should return false when NODE_ENV is \'production\'', () => {
        process.env.NODE_ENV = 'production'
        const hasErrors = hasObjectTypeError(testObjectTypes, {})
        expect(hasErrors).to.deep.equal(false)
      })
    })
    describe('hasObjectTypeError tests if running in React Native environment', () => {
      let oldEnv
      beforeEach(() => {
        oldEnv = process.env.NODE_ENV
        GLOBAL.navigator = {}
        Object.defineProperty(GLOBAL.navigator, 'product', {value: 'ReactNative'})
      })
      afterEach(() => {
        process.env.NODE_ENV = oldEnv
        delete GLOBAL.navigator
      })
      it('should run when in React Native, even when NODE_ENV is \'production\'', () => {
        process.env.NODE_ENV = 'production'
        const hasErrors = hasObjectTypeError(testObjectTypes, {})
        expect(hasErrors).to.deep.equal(true)
      })
    })
  })

  describe('setPropTypes()', () => {
    let oldConsoleWarn
    beforeEach(() => {
      // mocking console.warn for test purposes... gross...
      oldConsoleWarn = console.warn
      console.warn = () => {}
    })
    afterEach(() => {
      console.warn = oldConsoleWarn
    })
    it('should return props when there are no errors', () => {
      const initProps = {a: 1}
      const statePropsFunc = setPropTypes({})
      const outputProps = statePropsFunc({}, initProps)
      expect(outputProps).to.deep.equal(initProps)
    })
    it('should return null when there are errors', () => {
      const initProps = {a: '1'}
      const testObjectTypes = { a: PropTypes.number.isRequired }
      const statePropsFunc = setPropTypes(testObjectTypes)
      const outputProps = statePropsFunc({}, initProps)
      expect(outputProps).to.equal(null)
    })
  })

  describe('setStateTypes()', () => {
    let oldConsoleWarn
    beforeEach(() => {
      // mocking console.warn for test purposes... gross...
      oldConsoleWarn = console.warn
      console.warn = () => {}
    })
    afterEach(() => {
      console.warn = oldConsoleWarn
    })
    it('should return props when there are no errors', () => {
      const initProps = {a: 1}
      const statePropsFunc = setStateTypes({})
      const outputProps = statePropsFunc({}, initProps)
      expect(outputProps).to.deep.equal(initProps)
    })
    it('should return null when there are errors', () => {
      const initState = {a: '1'}
      const testObjectTypes = { a: PropTypes.number.isRequired }
      const statePropsFunc = setPropTypes(testObjectTypes)
      const outputProps = statePropsFunc(initState, {})
      expect(outputProps).to.equal(null)
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
      let oldConsoleWarn
      let testError = 'no errors'
      beforeEach(() => {
        // mocking console.warn for test purposes... gross...
        oldConsoleWarn = console.warn
        console.warn = (err) => {
          testError = err
        }
      })
      afterEach(() => {
        console.warn = oldConsoleWarn
        testError = 'no errors'
      })

      it('should \'short circuit\' when a composed function returns null', () => {
        const testStateProps = { set: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired }
        let count = 0
        const initState = {set: ['a', 'b']}

        const statePropsFunc = composeProps(
          (s, p) => {
            count += 1
            return p
          },
          setStateTypes(testStateProps, 'compose setStateTypes'),
          (s, p) => {
            count += 1
            return p
          }
        )

        expect(count).to.equal(0)
        const firstRunProps = statePropsFunc(initState, initProps)
        expect(testError).to.not.equal('no errors')
        expect(count).to.equal(1)
        expect(firstRunProps).to.equal(null)
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
        expect(testError).to.equal('no errors')
        expect(calledComposeCount).to.equal(1)
        expect(calledOnChangeCount).to.equal(1)
        expect(firstRunProps).to.deep.equal(expectOutProps)

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
