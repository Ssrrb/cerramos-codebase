import { currentUser } from "@repo/auth/server";
import { getDictionary } from "@repo/internationalization";
import type { ReactNode } from "react";
import { Footer } from "../components/footer";
import { Header } from "../components/header/index";

interface MarketingLayoutProps {
  children: ReactNode;
  params: Promise<{
    locale: string;
  }>;
}

const MarketingLayout = async ({ children, params }: MarketingLayoutProps) => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  const user = await currentUser();

  return (
    <>
      <Header dictionary={dictionary} isAuthenticated={Boolean(user)} />
      {children}
      <Footer />
    </>
  );
};

export default MarketingLayout;
