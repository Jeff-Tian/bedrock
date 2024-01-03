const container = {}

module.exports = {
    get(key) {
        return container[key];
    },

    set(key, value) {
        container[key] = value;
    }
}
