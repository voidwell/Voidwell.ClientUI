/** A link rendered by the tab navigation bars. */
export interface NavLink {
    path: string;
    display: string;
    /** Material Design Icons class, e.g. `mdi-radar`. */
    icon?: string;
    /** Roles allowed to see the link; everyone when omitted. */
    roles?: string[];
}
