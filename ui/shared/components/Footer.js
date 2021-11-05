import React from 'react';

const year = new Date().getFullYear();

const Footer = () => (
  <footer>
    <p className="small text-center text-secondary py-3">
        &copy; { year } 1.3.1 <a className="text-secondary"
        href="https://github.com/akornatskyy/scheduler">Documentation</a>
    </p>
  </footer>
);

export default Footer;
