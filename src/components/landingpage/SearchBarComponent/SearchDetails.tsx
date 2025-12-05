import * as React from 'react';
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { List, Typography, Card, Spin } from "antd";

const { Title, Paragraph, Text, Link: AntLink } = Typography;

const extractListInfoFromUrl = (
  webUrl: string
): { listName?: string; itemId?: string } => {
  try {
    const parts = webUrl.split("/Lists/");
    if (parts.length > 1) {
      const listAndRest = parts[1];
      const listName = listAndRest.split("/")[0];
      const query = new URLSearchParams(webUrl.split("?")[1] || "");
      const itemId = query.get("ID") || query.get("id");
      return { listName, itemId: itemId || undefined };
    }
  } catch (err) {
    console.error("Failed to parse list info", webUrl, err);
  }
  return {};
};

const allowedLists = [
  "CorporateNews",
  "LeadershipMessage",
  "HRAnnouncements",
  "DiscussionBoard",
  "LatestNewsAndEvents",
  "RecogonizedEmployee"
];

const SearchDetails: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [filteredResults, setFilteredResults] = useState<any[]>([]);
  const term = (location.state as any)?.term;
  const results = (location.state as any)?.results || [];

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      const validResults = results.filter((item: any) => {
        const { listName, itemId } = extractListInfoFromUrl(item?.Path || "");
        return Boolean(listName && itemId && allowedLists.includes(listName));
      });
      setFilteredResults(validResults);
      setLoading(false);
    }, 500); // simulate a small delay to show spinner

    return () => clearTimeout(timeout);
  }, [results]);

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: "center" }}>
        <Spin size="small" tip="Loading search results..." />
      </div>
    );
  }

  if (!filteredResults || filteredResults.length === 0) {
    return (
      <div style={{ padding: 24 }}>
        <Title level={3}>No results found</Title>
        <Paragraph>Try a different search term.</Paragraph>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Search Results for "{term}"</Title>
      <Card style={{ marginTop: 16 }}>
        <List
          itemLayout="vertical"
          dataSource={filteredResults}
          renderItem={(item: any) => {
            const { listName, itemId } = extractListInfoFromUrl(item.Path || "");
            const title = item.Title || "Untitled";
            const description = item.Description || "";

            return (
              <List.Item
                key={item.Path}
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/search-detail/${listName}/${itemId}`)}
              >
                <List.Item.Meta
                  title={
                    <AntLink>
                      {title}
                      <Text type="secondary" style={{ marginLeft: 8 }}>
                        ({listName})
                      </Text>
                    </AntLink>
                  }
                  description={description}
                />
              </List.Item>
            );
          }}
        />
      </Card>
    </div>
  );
};

export default SearchDetails;
