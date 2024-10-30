import babel from '@rollup/plugin-babel';

export default {
	external: [
		'react',
	],
	input: 'src/index.js',
	output: {
		exports: 'auto',
		file: 'lib/index.js',
		format: 'cjs'
	},
	plugins: [
		babel({
			babelHelpers: 'bundled',
			exclude: 'node_modules/**'
		})
	]
};