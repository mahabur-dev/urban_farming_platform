export interface ICreateCommunityPost {
  postContent: string;
}

export interface IUpdateCommunityPost {
  postContent?: string;
}

export interface ICommunityPostFilter {
  searchTerm?: string;
}
