import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { gql } from "@apollo/client";
import { useEffect, useState } from "react";
import { kibelaGql } from "./gql";

const SEARCH_NOTES = gql`
  query SearchNotes($query: String!) {
    search(first: 30, query: $query) {
      edges {
        node {
          title
          url
          author {
            account
          }
        }
      }
    }
  }
`;

type SearchNotesResponse = {
  data: {
    search: {
      edges: {
        node: {
          id: string;
          title: string;
          url: string;
          author: {
            account: string;
          };
        };
      }[];
    };
  };
};

type Note = {
  node: {
    id: string;
    title: string;
    url: string;
    author: {
      account: string;
    };
  };
};

export default function main() {
  const [searchText, setSearchText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notes, setNotes] = useState<Note[]>();

  useEffect(() => {
    setIsLoading(true);
    async function fetchData() {
      try {
        const data: SearchNotesResponse = await kibelaGql.client.query({
          query: SEARCH_NOTES,
          variables: { query: searchText },
        });
        setNotes(data.data.search.edges);
      } catch (e) {
        console.log(e);
      } finally {
        setIsLoading(false);
      }
    }

    if (searchText) {
      fetchData();
    }
  }, [searchText]);

  useEffect(() => {
    setIsLoading(true);
    async function fetchData() {
      try {
        const data: SearchNotesResponse = await kibelaGql.client.query({
          query: SEARCH_NOTES,
          variables: { query: searchText },
        });
        setNotes(data.data.search.edges);
      } catch (e) {
        console.log(e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [searchText]);

  return (
    <List
      searchBarPlaceholder="Enter the name of the note..."
      onSearchTextChange={setSearchText}
      isLoading={isLoading}
      throttle={true}
    >
      {searchText ? (
        <>
          <List.Section key={"searchTextTitle"} title={"Search by query"}>
            <List.Item
              id={"searchText"}
              key={"searchText"}
              title={`${searchText} で検索する`}
              icon={Icon.Globe}
              actions={
                <ActionPanel>
                  <ActionPanel.Section>
                    <Action.OpenInBrowser url={`${kibelaGql.url}?query=${encodeURIComponent(searchText)}`} />
                  </ActionPanel.Section>
                </ActionPanel>
              }
            />
          </List.Section>
          <List.Section key={"notesTitle"} title={"Notes"}>
            {notes?.map((note) => (
              <List.Item
                id={note.node.url}
                key={note.node.url}
                title={note.node.title}
                subtitle={`author: ${note.node.author.account}`}
                icon={Icon.TextDocument}
                actions={
                  <ActionPanel>
                    <ActionPanel.Section>
                      <Action.OpenInBrowser url={note.node.url} />
                    </ActionPanel.Section>
                  </ActionPanel>
                }
              />
            ))}
          </List.Section>
        </>
      ) : (
        []
      )}
    </List>
  );
}
