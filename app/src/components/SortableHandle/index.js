import { Component } from "react";
import { sortableHandle } from "react-sortable-hoc";

class SortableHandle extends Component {
    render() {
        return this.props.children;
    }
}

export default sortableHandle(SortableHandle);
