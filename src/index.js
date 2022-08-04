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
		return (
			<div className="objectexhibitor">
				{ morph(this.props.obj, 'root', true, !this.props.collapsed) }
			</div>
		);
	}
}

/* inernal */

// passthrough function to precheck an object type and create the appropriate react component
function morph(value, objKey, isLast = false, expanded = false, auxKey = null) {

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
		type,
		objKey,
		value,
		isLast,
		expanded
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

		let { type, value, objKey, isLast = false } = this.props;

		let className = 'objectexhibitor-node';
		let valueClassName = 'objectexhibitor-node-value';

		// array / typed array
		if (type < OBJECT) {

			// has elements
			if (value.length) {

				className += ' objectexhibitor-node-nested';
				valueClassName += ' objectexhibitor-node-value-nested objectexhibitor-node-value-array';

				value = value.map((item, i) => morph(item, null, i == value.length - 1, this.state.expanded, i));

			// empty
			} else {
				valueClassName += ' objectexhibitor-node-value-array-empty';
				value = '[]';
			}


		// object / map / set
		} else {

			let keys = Object.keys(value);

			// has children
			if (keys.length) {

				className += ' objectexhibitor-node-nested';
				valueClassName += ' objectexhibitor-node-value-nested objectexhibitor-node-value-object';

				value = keys.map((key, i) => morph(value[key], key, i == keys.length - 1, this.state.expanded, i));

			// empty
			} else {
				valueClassName += ' objectexhibitor-node-value-object-empty';
				value = '{}';
			}
		}

		// set wrapper symbol (array notation vs object)
		let preSymbol = type < OBJECT ? '[' : '{';
		let postSymbol = type < OBJECT ? ']' : '}';

		// trailing wrapper and comma
		let postSpan = (
			<span>
				<span>{ postSymbol }</span>
				{ !isLast && ',' }
			</span>
		);

		// label with trailing colon space 
		let label = objKey != null && (
			<React.Fragment>
				{ objKey }
				<span>:&nbsp;</span>
			</React.Fragment>				
		);

		// keep object mounted to preserve expanded state by setting display: none
		if (!this.state.expanded) {
			valueClassName += ' objectexhibitor-node-value-hidden';
		}

		return (
			<div className={className}>
				<div className="objectexhibitor-node-key objectexhibitor-node-key-toggle" onClick={this.handleToggle}>
					<span>
						{ this.state.expanded ? '⏷' : '⏵' }
					</span>
					{ label }
					<span>{ preSymbol }</span>
					{ !this.state.expanded && postSpan }
				</div>
				<div className={valueClassName}>
					{ value }
				</div>
				{ this.state.expanded && postSpan }
			</div>
		);
	}
}

// primitive node (no children)
const PrimitiveNode = ({ type, value, objKey, isLast = false }) => {

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
	let keyDiv = objKey != null && (
		<div className="objectexhibitor-node-key">
			<span>{ objKey }</span>
			<span>:&nbsp;</span>
		</div>
	);

	// trailing comma (not shown for the last object of a list)
	let commaSpan = !isLast && (
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