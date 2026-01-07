"use client";

import ArticleForm from "@/components/admin/ArticleForm";
import { use } from "react";

export default function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <ArticleForm mode="edit" articleId={id} />;
}
