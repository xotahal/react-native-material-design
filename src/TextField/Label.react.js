import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { Animated, StyleSheet } from 'react-native';


function getStyles(props, context, state) {
    const { textfield, erroredTextfield, focusedTextfield } = context.uiTheme;
    const { restricted } = props;
    const { focus, input } = state;

    const baseSize = StyleSheet.flatten(textfield.label).height;
    const activeFontSize = StyleSheet.flatten(textfield.label).fontSize;
    const basePadding = StyleSheet.flatten(textfield.label).padding;
    const { fontSize } = StyleSheet.flatten(textfield.input);

    const textStyle = {
        color: restricted ?
            StyleSheet.flatten(erroredTextfield.label).color :
            focus.interpolate({
                inputRange: [-1, 0, 1],
                outputRange: [
                    StyleSheet.flatten(erroredTextfield.label).color,
                    StyleSheet.flatten(textfield.label).color,
                    StyleSheet.flatten(focusedTextfield.label).color,
                ],
            }),
        fontSize: input.interpolate({
            inputRange: [0, 1],
            outputRange: [fontSize, activeFontSize],
        }),
    };
    const container = {
        top: input.interpolate({
            inputRange: [0, 1],
            outputRange: [
                baseSize + (fontSize * 0.25),
                baseSize - basePadding - activeFontSize,
            ],
        }),
        position: StyleSheet.flatten(textfield.label).position,
    };
    return {
        label: textStyle,
        container,
    };
}

const defaultProps = {
    numberOfLines: 1,

    active: false,
    focused: false,
    errored: false,
    restricted: false,
    style: null,
};

const propTypes = {
    numberOfLines: PropTypes.number,

    active: PropTypes.bool,
    errored: PropTypes.bool,
    focused: PropTypes.bool,
    restricted: PropTypes.bool,

    animationDuration: PropTypes.number.isRequired,

    style: Animated.Text.propTypes.style,

    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node,
    ]).isRequired,
};

const contextTypes = {
    uiTheme: PropTypes.object.isRequired,
};


class Label extends PureComponent {
    constructor(props) {
        super(props);

        const { active, focused, errored } = this.props;

        this.state = {
            input: new Animated.Value((active || focused) ? 1 : 0),
            focus: new Animated.Value(errored ? -1 : (focused ? 1 : 0)),
        };
    }

    componentWillReceiveProps(props) {
        const { focus, input } = this.state;
        const {
            active,
            focused,
            errored,
            animationDuration,
        } = this.props;

        if ((focused !== props.focused) || (active !== props.active)) {
            Animated
                .timing(input, {
                    toValue: (props.active || props.focused) ? 1 : 0,
                    duration: animationDuration,
                })
                .start();
        }

        if ((focused !== props.focused) || (errored !== props.errored)) {
            Animated
                .timing(focus, {
                    toValue: props.errored ? -1 : (props.focused ? 1 : 0),
                    duration: animationDuration,
                })
                .start();
        }
    }

    render() {
        const {
            children,
            restricted,
            style,
            errored,
            active,
            focused,
            animationDuration,
            ...props
        } = this.props;

        const styles = getStyles(this.props, this.context, this.state);

        return (
            <Animated.View style={styles.container}>
                <Animated.Text style={[styles.label, style]} {...props}>
                    {children}
                </Animated.Text>
            </Animated.View>
        );
    }
}

Label.propTypes = propTypes;
Label.contextTypes = contextTypes;
Label.defaultProps = defaultProps;

export default Label;
