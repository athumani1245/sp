import React from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
import 'tippy.js/animations/scale.css';

/**
 * Enhanced Tooltip Component
 * 
 * A wrapper around Tippy.js providing consistent tooltips across the application
 * with rich content support, keyboard shortcuts, and multiple themes.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Element to attach tooltip to
 * @param {string|React.ReactNode} props.content - Tooltip content (can be rich HTML)
 * @param {string} props.placement - Tooltip placement: 'top', 'bottom', 'left', 'right', 'auto'
 * @param {string} props.theme - Theme: 'dark' (default), 'light', 'success', 'warning', 'danger'
 * @param {boolean} props.arrow - Show arrow (default: true)
 * @param {number} props.delay - Delay in ms before showing [hover, hide] (default: [200, 0])
 * @param {boolean} props.interactive - Allow hovering over tooltip (default: false)
 * @param {number} props.maxWidth - Max width in pixels (default: 300)
 * @param {string} props.trigger - Trigger event: 'mouseenter focus', 'click', 'manual'
 * @param {boolean} props.disabled - Disable tooltip
 * @param {string} props.shortcut - Keyboard shortcut to display (e.g., 'Ctrl+K')
 */
const Tooltip = ({
    children,
    content,
    placement = 'top',
    theme = 'dark',
    arrow = true,
    delay = [200, 0],
    interactive = false,
    maxWidth = 300,
    trigger = 'mouseenter focus',
    disabled = false,
    shortcut = null,
    ...rest
}) => {
    // Don't render tooltip if content is empty or disabled
    if (!content || disabled) {
        return children;
    }

    // Build tooltip content with optional keyboard shortcut
    // Support both plain text and HTML content
    const tooltipContent = (
        <div className="custom-tooltip-content">
            <div 
                className="tooltip-text" 
                dangerouslySetInnerHTML={{ __html: content }}
            />
            {shortcut && (
                <div className="tooltip-shortcut">
                    <kbd>{shortcut}</kbd>
                </div>
            )}
        </div>
    );

    // Map custom themes to Tippy themes or classes
    const getTippyTheme = () => {
        switch (theme) {
            case 'light':
                return 'light';
            case 'success':
                return 'success-theme';
            case 'warning':
                return 'warning-theme';
            case 'danger':
                return 'danger-theme';
            case 'info':
                return 'info-theme';
            default:
                return undefined; // Default dark theme
        }
    };

    return (
        <Tippy
            content={tooltipContent}
            placement={placement}
            theme={getTippyTheme()}
            arrow={arrow}
            delay={delay}
            interactive={interactive}
            maxWidth={maxWidth}
            trigger={trigger}
            animation="scale"
            allowHTML={true}
            {...rest}
        >
            {children}
        </Tippy>
    );
};

/**
 * InfoTooltip - Tooltip with info icon
 * Perfect for help hints next to form labels
 */
export const InfoTooltip = ({ content, placement = 'right', ...props }) => (
    <Tooltip content={content} placement={placement} interactive={true} {...props}>
        <i 
            className="bi bi-info-circle text-muted ms-1" 
            style={{ cursor: 'help', fontSize: '0.9em' }}
        ></i>
    </Tooltip>
);

/**
 * HelpTooltip - Tooltip with question mark icon
 * For additional help or complex explanations
 */
export const HelpTooltip = ({ content, placement = 'top', ...props }) => (
    <Tooltip content={content} placement={placement} interactive={true} maxWidth={350} {...props}>
        <i 
            className="bi bi-question-circle text-primary" 
            style={{ cursor: 'help', fontSize: '1.1em' }}
        ></i>
    </Tooltip>
);

/**
 * IconButtonTooltip - Tooltip for icon-only buttons
 * Shows what the button does
 */
export const IconButtonTooltip = ({ content, shortcut, children, ...props }) => (
    <Tooltip 
        content={content} 
        shortcut={shortcut}
        placement="bottom"
        delay={[500, 0]}
        {...props}
    >
        {children}
    </Tooltip>
);

export default Tooltip;
