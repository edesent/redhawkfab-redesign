import { SITE } from "@/data/site";

export function Footer() {
  return (
    <footer className="bg-white py-10 md:py-14">
      <div className="wrap">
        <hr className="mt-6 mb-6 border-0 border-t border-rule" />
        <p className="flex min-h-0 items-center justify-center text-center text-[14px] leading-[21px] text-footer-text md:min-h-[46px] md:justify-start md:text-left">
          Copyright © {new Date().getFullYear()} {SITE.legalName} - All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
