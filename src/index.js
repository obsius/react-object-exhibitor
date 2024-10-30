import React from 'react';

// supported types (nested types start at ARRAY)
const UNDEFINED =   0;
const NULL =        1;
const BOOL =        2;
const NUMBER =      3;
const SYMBOL =      4;
const BIGINT =      5;
const STRING =      6;
const DATE =        7;
const REGEX =       8;
const FUNCTION =    9;
const ARRAY =       10;
const TYPED_ARRAY = 11;
const OBJECT =      12;
const MAP =         13;
const SET =         14;

// entry point
export default class ObjectExhibitor extends React.Component {
	render() {

		let { obj, collapsed = false, skeleton = false, hideRoot = false, hideRootLabel = false } = this.props;

		return (
			<div className="objectexhibitor">
				{
					morph({
						objKey: hideRootLabel ? null : 'root',
						value: obj,
						last: true,
						expanded: !collapsed,
						hideRoot,
						skeleton
					})
				}
			</div>
		);
	}
}

/* inernal */

// passthrough function to precheck an object type and create the appropriate react component
function morph({
	objKey,
	auxKey,
	value,
	last = false,
	expanded = false,
	skeleton = false,
	hideRoot = false
}) {

	let type;

	switch (typeof value) {

		case 'undefined':
			type = UNDEFINED;
			break;
		case 'boolean':
			type = BOOL;
			break;
		case 'number':
			type = NUMBER;
			break;
		case 'symbol':
			type = SYMBOL;
			break;
		case 'bigint':
			type = BIGINT;
			break;
		case 'string':
			type = STRING;
			break;
		case 'function':
			type = FUNCTION;
			break;

		// null / regex / date / array / typed array / object / map / set
		case 'object':

			if (value == null) {
				type = NULL;
			} else if (Array.isArray(value)) {
				type = ARRAY;
			} else if (ArrayBuffer.isView(value)) {
				type = TYPED_ARRAY;
			} else if (value instanceof Date) {
				type = DATE;
			} else if (value instanceof RegExp) {
				type = REGEX;
			} else if (value instanceof Map) {
				type = MAP;
			} else if (value instanceof Set) {
				type = SET;
			} else {
				type = OBJECT;
			}

			break;
	}

	return React.createElement(type < ARRAY ? PrimitiveNode : ObjectNode, {
		key: objKey || auxKey,
		objKey,
		value,
		type,
		last,
		expanded,
		skeleton,
		hideRoot
	});
};

// object node (array, typed array, map, set, object)
class ObjectNode extends React.Component {

	constructor(props) {
	
		super(props);

		this.state = {
			expanded: !!props.expanded
		};
	}

	// handle collapse / expand
	handleToggle = () => {
		this.setState({
			expanded: !this.state.expanded
		});
	};

	render() {

		let { type, objKey, value, last = false, skeleton = false, hideRoot = false } = this.props;
		let { expanded } = this.state;

		let className = 'objectexhibitor-node';
		let valueClassName = 'objectexhibitor-node-value';

		let i = 0;
		let children = [];

		switch (type) {

			case ARRAY:
			case TYPED_ARRAY: {

				valueClassName += type == TYPED_ARRAY ? ' objectexhibitor-node-value-typedarray' : ' objectexhibitor-node-value-array';

				if (value.length) {
					for (; i < value.length; ++i) {
						children.push(morph({
							auxKey: i,
							value: value[i],
							last: i == value.length - 1,
							expanded,
							skeleton
						}));
					}
				}

				break;
			}

			case MAP: {

				valueClassName += ' objectexhibitor-node-value-map';

				if (value.size) {
					for (let keyVal of value) {
						children.push(morph({
							objKey: keyVal[0],
							value: keyVal[1],
							last: i++ == value.size - 1,
							expanded,
							skeleton
						}));
					}
				}

				break;
			}

			case SET: {

				valueClassName += ' objectexhibitor-node-value-set';	

				// has children
				if (value.size) {
					for (let item of value) {
						children.push(morph({
							auxKey: i,
							value: item,
							last: i++ == value.size - 1,
							expanded,
							skeleton
						}));
					}
				}

				break;
			}

			case OBJECT: {

				valueClassName += ' objectexhibitor-node-value-nested';

				let keys = Object.keys(value);

				for (let key of keys) {
					children.push(morph({
						objKey: key,
						value: value[key],
						last: i++ == keys.length - 1,
						expanded,
						skeleton
					}));
				}
			}
		}

		// add empty classname and remove value
		if (i == 0) {
			valueClassName = ' objectexhibitor-node-value-empty';

		// add nested classname and set value to ellipses for collapsed with children
		} else {
			className += ' objectexhibitor-node-nested';
			valueClassName += ' objectexhibitor-node-value-nested';
		}

		// keep object mounted to preserve expanded state by setting display: none
		if (!expanded) {
			valueClassName += ' objectexhibitor-node-value-hidden';
		}

		let expander = (i > 0) && (
			<span>
				{ expanded ? '⏷' : '⏵' }
			</span>
		);

		// label with trailing colon space or no label in skeleton mode reference
		let label = (objKey != null) ? (
			<span>
				<span>{ objKey }</span>
				<span>:&nbsp;</span>
			</span>
		) : (expanded && skeleton) && (
			<span>
				<span>{ type < OBJECT ? '[]' : '{}' }</span>
				<span>:&nbsp;</span>
			</span>
		);

		// leading wrapper
		let preSpan = (!expanded || !skeleton) && (
			<span>{ type < OBJECT ? '[' : '{' }</span>
		);

		// ellipses for collapsed non-empty objects
		let ellipsesSpan = (i > 0 && !expanded) && (
			<span>...</span>
		);

		// trailing wrapper and comma
		let postSpan = (!expanded || !skeleton) && (
			<span>
				<span>{ (type < OBJECT) ? ']' : '}' }</span>
				<span>{ (!last && !skeleton) && ',' }</span>
			</span>
		);

		if (hideRoot) {
			return (
				<React.Fragment>
					{ children }
				</React.Fragment>
			);
		} else {
			return (
				<div className={className}>
					<div className="objectexhibitor-node-key objectexhibitor-node-key-toggle" onClick={this.handleToggle}>
						{ expander }
						{ label }
						{ preSpan }
						{ ellipsesSpan }
						{ !expanded && postSpan }
					</div>
					<div className={valueClassName}>
						{ children }
					</div>
					{ expanded && postSpan }
				</div>
			);
		}
	}
}

// primitive node (no children)
const PrimitiveNode = ({ type, objKey, value, last = false }) => {

	let valueClassName = 'objectexhibitor-node-value';

	// set classname and format value
	switch (type) {

		case UNDEFINED:
			valueClassName += ' objectexhibitor-node-value-undefined';
			value = 'undefined';
			break;

		case NULL:
			valueClassName += ' objectexhibitor-node-value-null';
			value = 'null';
			break;

		case BOOL:

			valueClassName += ' objectexhibitor-node-value-bool';

			if (value) {
				valueClassName += ' objectexhibitor-node-value-bool-true';
				value = 'true';
			} else {
				valueClassName += ' objectexhibitor-node-value-bool-false';
				value = 'false';
			}

			break;

		case NUMBER:
			valueClassName += ' objectexhibitor-node-value-number';
			break;

		case SYMBOL:
			valueClassName += ' objectexhibitor-node-value-symbol';
			value = value.toString();
			break;

		case BIGINT:
			valueClassName += ' objectexhibitor-node-value-bigint';
			value = value.toString();
			break;

		case STRING:
			valueClassName += ' objectexhibitor-node-value-string';
			value = `"${value}"`;
			break;

		case REGEX:
			valueClassName += ' objectexhibitor-node-value-regex';
			value = value.toString();
			break;

		case DATE:
			valueClassName += ' objectexhibitor-node-value-date';
			value = value.toISOString();
			break;

		case FUNCTION:
			valueClassName += ' objectexhibitor-node-value-function';
			value = `${value.name}()`
			break;
	}

	// key div (hidden if no key provided)
	let keyDiv = (objKey != null) && (
		<div className="objectexhibitor-node-key">
			<span>{ objKey }</span>
			<span>:&nbsp;</span>
		</div>
	);

	// trailing comma (not shown for the last object of a list)
	let commaSpan = !last && (
		<span>,</span>
	);

	return (
		<div className="objectexhibitor-node">
			{ keyDiv }
			<div className={valueClassName}>
				<span>{ value }</span>
				{ commaSpan }
			</div>
		</div>
	);
};