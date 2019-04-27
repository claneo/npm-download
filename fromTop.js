const npmTop = require('./utils/npmTop');
const fromInput = require('./fromInput');

module.exports = size => npmTop(size).then(fromInput);
