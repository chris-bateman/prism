import { insertBefore } from '../shared/language-util.js';
import css from './prism-css.js';

export default /** @type {import("../types").LanguageProto} */ ({
	id: 'sass',
	require: css,
	optional: 'css-extras',
	grammar({ extend }) {
		const sass = extend('css', {
			// Sass comments don't need to be closed, only indented
			'comment': {
				pattern: /^([ \t]*)\/[\/*].*(?:(?:\r?\n|\r)\1[ \t].+)*/m,
				lookbehind: true,
				greedy: true
			}
		});

		insertBefore(sass, 'atrule', {
			// We want to consume the whole line
			'atrule-line': {
				// Includes support for = and + shortcuts
				pattern: /^(?:[ \t]*)[@+=].+/m,
				greedy: true,
				inside: {
					'atrule': /(?:@[\w-]+|[+=])/
				}
			}
		});
		delete sass.atrule;


		let variable = /\$[-\w]+|#\{\$[-\w]+\}/;
		let operator = [
			/[+*\/%]|[=!]=|<=?|>=?|\b(?:and|not|or)\b/,
			{
				pattern: /(\s)-(?=\s)/,
				lookbehind: true
			}
		];

		insertBefore(sass, 'property', {
			// We want to consume the whole line
			'variable-line': {
				pattern: /^[ \t]*\$.+/m,
				greedy: true,
				inside: {
					'punctuation': /:/,
					'variable': variable,
					'operator': operator
				}
			},
			// We want to consume the whole line
			'property-line': {
				pattern: /^[ \t]*(?:[^:\s]+ *:.*|:[^:\s].*)/m,
				greedy: true,
				inside: {
					'property': [
						/[^:\s]+(?=\s*:)/,
						{
							pattern: /(:)[^:\s]+/,
							lookbehind: true
						}
					],
					'punctuation': /:/,
					'variable': variable,
					'operator': operator,
					'important': sass.important
				}
			}
		});
		delete sass.property;
		delete sass.important;

		// Now that whole lines for other patterns are consumed,
		// what's left should be selectors
		insertBefore(sass, 'punctuation', {
			'selector': {
				pattern: /^([ \t]*)\S(?:,[^,\r\n]+|[^,\r\n]*)(?:,[^,\r\n]+)*(?:,(?:\r?\n|\r)\1[ \t]+\S(?:,[^,\r\n]+|[^,\r\n]*)(?:,[^,\r\n]+)*)*/m,
				lookbehind: true,
				greedy: true
			}
		});

		return sass;
	}
});
