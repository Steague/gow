import React from 'react';
import { connect } from 'react-redux';

class ThemeSwitcher extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loaded: false
        };

        this.doc = window.document;
        this.head = document.getElementsByTagName('head')[0];
    }
    removeCurrentTheme() {
        const nodes = this.head.childNodes;
        const list =[]
        for (let ix = 0; ix < nodes.length; ix++) {
            let node = nodes.item(ix);
            if (node.href && node.href.indexOf('bootstrap') > -1) {
                list.push(node)
            }
        }
        console.log({list});
        list.forEach((node) => { this.head.removeChild(node) });
    }
    appendStyleSheet(url) {
        return new Promise((resolve, reject) => {
            const stylesheet = document.createElement("link");
            stylesheet.href = url;
            stylesheet.rel = 'stylesheet';
            stylesheet.type = 'text/css';
            stylesheet.onload = () => { resolve(url); };
            this.head.appendChild(stylesheet);
        });
    }
    loadTheme(theme) {
        this.setState({loaded: false});
        this.removeCurrentTheme();
        this.appendStyleSheet(`/themes/${theme}/bootstrap.min.css`).then(url => {
            this.setState({loaded: true});
        }).catch(console.error);
    }
    componentDidMount() {
        const { theme } = this.props;
        this.loadTheme(theme);
    }
    shouldComponentUpdate(nextProps, nextState) {
        const { theme } = this.props;
        const { theme: nextTheme } = nextProps;
        if (theme !== nextTheme) {
            this.loadTheme(nextTheme);
        }
        return true;
    }
    render() {
        const { children } = this.props;
        const { loaded } = this.state;
        if (!loaded) return null;
        return children || <span/>
    }
}

const mapStateToProps = state => ({
    theme: state.theme.theme
});

const mapDispatchToProps = dispatch => ({});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ThemeSwitcher);
