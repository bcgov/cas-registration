import Link from "next/link";

import footerLinks from "@/app/data/layout/footer.json";

const links = footerLinks.map((link, index) => (
  <Link
    key={index}
    href={link.href}
    target={link.target}
    className="text-white text-lg no-underline sm:mr-4"
    aria-label={link.label}
  >
    {link.name}
  </Link>
));

const Footer = () => (
  <footer className="relative w-full">
    <div className="bg-bc-primary-blue relative left-1/2 transform -translate-x-1/2 w-screen max-w-none">
      <div className="max-w-page mx-auto padding-page h-fit text-lg flex align-start flex-col sm:flex-row mx-auto">
        {links}
      </div>
    </div>
  </footer>
);

export default Footer;
