import Link from "next/link";

import footerLinks from "@/app/data/layout/footer.json";

const links = footerLinks.map((link, index) => (
  <Link
    key={index}
    href={link.href}
    target={link.target}
    className="text-white text-lg no-underline mx-4"
    aria-label={link.label}
  >
    {link.name}
  </Link>
));

const Footer = () => (
  <footer className="absolute bottom-0 w-full bg-bc-primary-blue overflow-hidden py-3 px-2">
    <div className="max-w-page w-full flex align-start flex-col sm:flex-row mx-auto">
      {links}
    </div>
  </footer>
);

export default Footer;
