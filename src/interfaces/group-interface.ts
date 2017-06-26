export interface Group {
  $key: string,
  description: string;
  displayName: string;
  members: Array<string>;
  profilePicURL: string;
  requirements: Array<string>;
}
