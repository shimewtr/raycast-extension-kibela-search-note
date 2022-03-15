import { ApolloClient, ApolloLink, concat, HttpLink, InMemoryCache, NormalizedCacheObject } from "@apollo/client";
import { getPreferenceValues } from "@raycast/api";
import fetch from "cross-fetch";

export class KibelaGql {
  public url: string;
  public client: ApolloClient<NormalizedCacheObject>;
  constructor(url: string, client: ApolloClient<NormalizedCacheObject>) {
    this.url = url;
    this.client = client;
  }
  public urlJoin(url: string): string {
    return `${this.url}/${url}`;
  }
}

export function createKibelaGQLClient() {
  const preferences = getPreferenceValues();
  const accessToken = preferences.accessToken as string;
  const subDomain = preferences.subDomain as string;
  const notesSearchUrl = `https://${subDomain}.kibe.la/search`;
  const graphqlEndpoint = `https://${subDomain}.kibe.la/api/v1`;
  const httpLink = new HttpLink({ uri: graphqlEndpoint, fetch });

  const authMiddleware = new ApolloLink((operation, forward) => {
    operation.setContext(() => ({
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }));
    return forward(operation);
  });

  const client = new ApolloClient({
    link: concat(authMiddleware, httpLink),
    cache: new InMemoryCache(),
  });
  return new KibelaGql(notesSearchUrl, client);
}

export const kibelaGql = createKibelaGQLClient();
