import React from "react";

function getPublisherUrl() {
  const raw =
    process.env.SANITY_STUDIO_SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "http://localhost:3000";

  return `${raw.replace(/\/+$/, "")}/admin/blog-generator?embedded=1`;
}

export default function ChatToPublishDesk() {
  return (
    <div
      style={{
        height: "100%",
        minHeight: "80vh",
        backgroundColor: "#fff",
      }}>
      <iframe
        src={getPublisherUrl()}
        frameBorder="0"
        title="AI Blog Publisher"
        style={{
          width: "100%",
          height: "100%",
          minHeight: "80vh",
        }}
      />
    </div>
  );
}
