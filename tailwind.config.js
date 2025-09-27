/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        // Custom CSS variables integration
        'surface-L0': 'var(--surface-L0)',
        'surface-L1': 'var(--surface-L1)',
        'surface-L2': 'var(--surface-L2)',
        'surface-L3': 'var(--surface-L3)',
        'surface-L4': 'var(--surface-L4)',
        'surface-L5': 'var(--surface-L5)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        'text-quaternary': 'var(--text-quaternary)',
        'accent-primary': 'var(--accent-primary)',
        'accent-secondary': 'var(--accent-secondary)',
        'border-subtle': 'var(--border-subtle)',
        'border-standard': 'var(--border-standard)',
        'border-prominent': 'var(--border-prominent)',
        'border-accent': 'var(--border-accent)',
        'success': 'var(--success)',
        'warning': 'var(--warning)',
        'error': 'var(--error)',
      },
      fontFamily: {
        sans: ['-apple-system', 'SF Pro Text', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
        display: ['-apple-system', 'SF Pro Display', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'monospace'],
      },
      boxShadow: {
        'sm-custom': 'var(--shadow-sm)',
        'md-custom': 'var(--shadow-md)',
        'lg-custom': 'var(--shadow-lg)',
        'focus-custom': 'var(--shadow-focus)',
      },
      transitionTimingFunction: {
        'spring': 'var(--ease-spring)',
        'out-expo': 'var(--ease-out-expo)',
        'in-out-quart': 'var(--ease-in-out-quart)',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
};
