_ = require('lodash')
dfd = require('danfojs-node')
tf = require("@tensorflow/tfjs")


fizzbuzz = (i) => {
	let str = ''

	if (i % 3 === 0) str += 'fizz'
	if (i % 5 === 0) str += 'buzz'
	if (str === '') str = `${i}`

	return str
}


size = 100_000
numbers = _.sampleSize(_.range(1, 1_000_001), size)

examplesRaw = numbers.map(n => [n, fizzbuzz(n)])

examples = new dfd.DataFrame(examplesRaw, { columns: ['n', 'fizzbuzz'] })

// will use these for training and evaluating
examples.addColumn({
	column: 'fizz',
	value: examples['fizzbuzz'].values.map(v => v.includes('fizz')),
})
examples.addColumn({
	column: 'buzz',
	value: examples['fizzbuzz'].values.map(v => v.includes('buzz')),
})

bits = (i) => {
	binary = Number(i).toString(2).padStart(32, '0')
	return binary.split('')
}

// will use these as features
bitDataRaw = examples['n'].values.map(e => bits(e))
bitData = new dfd.DataFrame(bitDataRaw, { columns: _.range(32).map(i => `b${i}`) })

examples = dfd.concat({ df_list: [examples, bitData], axis: 1 })

trainSize = size * 0.2
testSize = size - trainSize

trainExamples = examples.iloc({ rows: [`0:${trainSize}`] , columns: [':'] })
testExamples = examples.iloc({ rows: [`${trainSize}:${size}`] , columns: [':'] })

// trainExamples.groupby(['fizz', 'buzz']).col(['counts']).count().print()
