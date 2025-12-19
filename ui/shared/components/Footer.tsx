const year = new Date().getFullYear();

export const Footer = () => (
  <footer>
    <p className="small text-center text-secondary py-3">
      &copy; {year} 1.5.1{' '}
      <a
        className="text-secondary"
        href="https://github.com/akornatskyy/scheduler"
      >
        Documentation
      </a>
    </p>
  </footer>
);
