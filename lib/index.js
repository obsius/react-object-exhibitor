'use strict';

var React = require('react');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

const UNDEFINED = 0;
const NULL = 1;
const BOOL = 2;
const NUMBER = 3;
const SYMBOL = 4;
const BIGINT = 5;
const STRING = 6;
const DATE = 7;
const REGEX = 8;
const FUNCTION = 9;
const ARRAY = 10;
const TYPED_ARRAY = 11;
const OBJECT = 12;
const MAP = 13;
const SET = 14; // entry point

class ObjectExhibitor extends React__default["default"].Component {
  render() {
    return /*#__PURE__*/React__default["default"].createElement("div", {
      className: "objectexhibitor"
    }, morph(this.props.obj, 'root', true, !this.props.collapsed));
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

  return React__default["default"].createElement(type < ARRAY ? PrimitiveNode : ObjectNode, {
    key: objKey || auxKey,
    type,
    objKey,
    value,
    isLast,
    expanded
  });
}

class ObjectNode extends React__default["default"].Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: !!props.expanded
    };
  } // handle collapse / expand


  handleToggle = () => {
    this.setState({
      expanded: !this.state.expanded
    });
  };

  render() {
    let {
      type,
      value,
      objKey,
      isLast = false
    } = this.props;
    let {
      expanded
    } = this.state;
    let empty = false;
    let className = 'objectexhibitor-node';
    let valueClassName = 'objectexhibitor-node-value'; // array / typed array

    if (type < OBJECT) {
      // typed array
      if (type == TYPED_ARRAY) {
        valueClassName += 'objectexhibitor-node-value-typedarray'; // has elements

        if (value.length) {
          let children = [];
          value.forEach((item, i) => children.push(morph(item, null, i == value.length - 1, expanded, i)));
          value = children; // empty
        } else {
          empty = true;
        } // array

      } else {
        valueClassName += 'objectexhibitor-node-value-array'; // has elements

        if (value.length) {
          value = value.map((item, i) => morph(item, null, i == value.length - 1, expanded, i)); // empty
        } else {
          empty = true;
        }
      } // object / map / set

    } else {
      // map
      if (type == MAP) {
        valueClassName += ' objectexhibitor-node-value-map'; // has children

        if (value.size) {
          let i = 0;
          let children = [];
          value.forEach((item, key) => children.push(morph(item, key, i++ == value.size - 1, expanded)));
          value = children; // empty
        } else {
          empty = true;
        } // set

      } else if (type == SET) {
        valueClassName += 'objectexhibitor-node-value-set'; // has children

        if (value.size) {
          let i = 0;
          let children = [];
          value.forEach(item => children.push(morph(item, null, i == value.size - 1, expanded, i++)));
          value = children; // empty
        } else {
          empty = true;
        } // object

      } else {
        valueClassName += 'objectexhibitor-node-value-object';
        let keys = Object.keys(value); // has children

        if (keys.length) {
          className += ' objectexhibitor-node-nested';
          valueClassName += ' objectexhibitor-node-value-nested';
          value = keys.map((key, i) => morph(value[key], key, i == keys.length - 1, expanded, i)); // empty
        } else {
          empty = true;
        }
      }
    } // add empty classname and remove value


    if (empty) {
      valueClassName = ' objectexhibitor-node-value-empty';
      value = ''; // add nested classname and set value to ellipses for collapsed with children
    } else {
      className += ' objectexhibitor-node-nested';
      valueClassName += ' objectexhibitor-node-value-nested';
    } // keep object mounted to preserve expanded state by setting display: none


    if (!this.state.expanded) {
      valueClassName += ' objectexhibitor-node-value-hidden';
    } // ellipses for collapsed non-empty objects


    let ellipsesSpan = !empty && !expanded && /*#__PURE__*/React__default["default"].createElement("span", null, "..."); // leading wrapper

    let preSpan = /*#__PURE__*/React__default["default"].createElement("span", null, type < OBJECT ? '[' : '{'); // trailing wrapper and comma

    let postSpan = /*#__PURE__*/React__default["default"].createElement("span", null, /*#__PURE__*/React__default["default"].createElement("span", null, type < OBJECT ? ']' : '}'), !isLast && ','); // label with trailing colon space 

    let label = objKey != null && /*#__PURE__*/React__default["default"].createElement(React__default["default"].Fragment, null, objKey, /*#__PURE__*/React__default["default"].createElement("span", null, ":\xA0"));
    return /*#__PURE__*/React__default["default"].createElement("div", {
      className: className
    }, /*#__PURE__*/React__default["default"].createElement("div", {
      className: "objectexhibitor-node-key objectexhibitor-node-key-toggle",
      onClick: this.handleToggle
    }, /*#__PURE__*/React__default["default"].createElement("span", null, expanded ? '⏷' : '⏵'), label, preSpan, ellipsesSpan, !expanded && postSpan), /*#__PURE__*/React__default["default"].createElement("div", {
      className: valueClassName
    }, value), expanded && postSpan);
  }

} // primitive node (no children)


const PrimitiveNode = ({
  type,
  value,
  objKey,
  isLast = false
}) => {
  let valueClassName = 'objectexhibitor-node-value'; // set classname and format value

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
      value = `${value.name}()`;
      break;
  } // key div (hidden if no key provided)


  let keyDiv = objKey != null && /*#__PURE__*/React__default["default"].createElement("div", {
    className: "objectexhibitor-node-key"
  }, /*#__PURE__*/React__default["default"].createElement("span", null, objKey), /*#__PURE__*/React__default["default"].createElement("span", null, ":\xA0")); // trailing comma (not shown for the last object of a list)

  let commaSpan = !isLast && /*#__PURE__*/React__default["default"].createElement("span", null, ",");
  return /*#__PURE__*/React__default["default"].createElement("div", {
    className: "objectexhibitor-node"
  }, keyDiv, /*#__PURE__*/React__default["default"].createElement("div", {
    className: valueClassName
  }, /*#__PURE__*/React__default["default"].createElement("span", null, value), commaSpan));
};

module.exports = ObjectExhibitor;
