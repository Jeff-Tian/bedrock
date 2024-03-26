const container = {}

module.exports = {
    get(key) {
        console.log('getting ', key);
        const result = container[key];
        console.log('result = ', result);

        return result;
    },

    set(key, value) {
        console.log('setting ', key, ' to ', value);
        container[key] = value;
    }
}
