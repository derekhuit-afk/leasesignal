import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

const SAMPLE_DATA = [{"tenant":"Salesforce","city":"San Francisco","state":"CA","sqft":412000,"lease_expiry":"2026-09-30","annual_rent":28840000,"landlord":"Kilroy Realty","asset_class":"Office","renewal_probability":42,"days_to_expiry":197},{"tenant":"Amazon","city":"Seattle","state":"WA","sqft":890000,"lease_expiry":"2027-03-31","annual_rent":44500000,"landlord":"Columbia Property Trust","asset_class":"Office","renewal_probability":71,"days_to_expiry":379},{"tenant":"Target","city":"Minneapolis","state":"MN","sqft":124000,"lease_expiry":"2026-06-30","annual_rent":3720000,"landlord":"Inland Real Estate","asset_class":"Retail","renewal_probability":88,"days_to_expiry":105}];

function getStats(data: Record<string, unknown>[]) {
  if (!data || data.length === 0) return {};
  const numericKeys = Object.keys(data[0]).filter(k => typeof data[0][k] === "number");
  const stats: Record<string, unknown> = { total_records: data.length };
  numericKeys.slice(0, 2).forEach(k => {
    const avg = data.reduce((s, r) => s + (Number(r[k]) || 0), 0) / data.length;
    stats[`avg_${k}`] = Math.round(avg * 100) / 100;
  });
  return stats;
}

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";
  
  let data = SAMPLE_DATA as Record<string, unknown>[];
  if (q) {
    data = data.filter(r =>
      Object.values(r).some(v => String(v).toLowerCase().includes(q.toLowerCase()))
    );
  }
  
  return NextResponse.json({
    data,
    stats: getStats(data),
    refreshed: new Date().toISOString()
  });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const data = SAMPLE_DATA as Record<string, unknown>[];
  const headers = data.length > 0 ? Object.keys(data[0]) : [];
  const csv = [
    headers.join(","),
    ...data.map(r => headers.map(h => String(r[h] ?? "")).join(","))
  ].join("\n");
  
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=leasesignal-export.csv`
    }
  });
}
