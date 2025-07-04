import React from "react";
import Footer from "@/components/template/Footer";
import { useTranslation } from "react-i18next";
import DnDMapBuilder from "@/components/DnDMapBuilder";

export default function SecondPage() {
  const { t } = useTranslation();

  return <DnDMapBuilder />;
}
