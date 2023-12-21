const container = require('../container');
const assert = require('assert')

describe('container', () => {
    it('set and get', () => {
        container.set('foo', 'bar');
        const rtn = container.get('foo');
        assert.equal(rtn, 'bar')
    })
})
