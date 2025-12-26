const version = process.env.VERSION ?? '0.0.0-dev';
const year = new Date().getFullYear();

export const Footer = () => (
  <footer>
    <p className="small text-center text-secondary py-3">
      &copy; {year} {version}{' '}
      <a
        className="text-secondary"
        href="https://github.com/akornatskyy/scheduler"
      >
        Documentation
      </a>
    </p>
  </footer>
);
