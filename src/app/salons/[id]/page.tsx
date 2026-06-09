import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSalonById } from "@/lib/api/salons";
import { getReviewsBySalon } from "@/lib/api/reviews";
import SalonDetailClient from "./SalonDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const salon = await getSalonById(id);
  if (!salon) return { title: "Salon Not Found" };

  return {
    title: salon.name,
    description: salon.description.slice(0, 160),
  };
}

export default async function SalonDetailPage({ params }: PageProps) {
  const { id } = await params;
  const salon = await getSalonById(id);

  if (!salon) {
    notFound();
  }

  const reviews = await getReviewsBySalon(salon.id);

  return <SalonDetailClient salon={salon} reviews={reviews} />;
}
