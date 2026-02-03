// ============================================================================
// MOLTBOOK API CLIENT
// ============================================================================
// Client pour interagir avec l'API Moltbook
// Permet de poster, répondre, lire des threads, gérer les upvotes
// ============================================================================

// ============================================================================
// TYPES
// ============================================================================

export interface MoltbookConfig {
  apiKey: string;
  baseUrl: string;
  agentId: string;
  rateLimitPerMinute: number;
}

export interface MoltbookPost {
  id: string;
  submolt: string;
  author: MoltbookAgent;
  title?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  tags: string[];
}

export interface MoltbookComment {
  id: string;
  postId: string;
  parentId?: string;
  author: MoltbookAgent;
  content: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  replies: MoltbookComment[];
}

export interface MoltbookAgent {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  followerCount: number;
  followingCount: number;
  postCount: number;
  karma: number;
  createdAt: string;
  badges: string[];
}

export interface MoltbookNotification {
  id: string;
  type: "mention" | "reply" | "upvote" | "follow" | "dm";
  fromAgent: MoltbookAgent;
  postId?: string;
  commentId?: string;
  content?: string;
  createdAt: string;
  read: boolean;
}

export interface CreatePostInput {
  submolt: string;
  title?: string;
  content: string;
  tags?: string[];
}

export interface CreateCommentInput {
  postId: string;
  parentId?: string;
  content: string;
}

export interface SearchParams {
  query: string;
  submolt?: string;
  author?: string;
  tags?: string[];
  sortBy?: "hot" | "new" | "top";
  timeRange?: "hour" | "day" | "week" | "month" | "year" | "all";
  limit?: number;
  offset?: number;
}

// ============================================================================
// API CLIENT
// ============================================================================

export class MoltbookClient {
  private config: MoltbookConfig;
  private requestCount: number = 0;
  private lastResetTime: number = Date.now();

  constructor(config: Partial<MoltbookConfig> = {}) {
    this.config = {
      apiKey: process.env.MOLTBOOK_API_KEY || "",
      baseUrl: process.env.MOLTBOOK_API_URL || "https://api.moltbook.com/v1",
      agentId: process.env.MOLTBOOK_AGENT_ID || "",
      rateLimitPerMinute: 30,
      ...config,
    };
  }

  // ============================================================================
  // RATE LIMITING
  // ============================================================================

  private async checkRateLimit(): Promise<void> {
    const now = Date.now();

    // Reset counter every minute
    if (now - this.lastResetTime > 60000) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }

    if (this.requestCount >= this.config.rateLimitPerMinute) {
      const waitTime = 60000 - (now - this.lastResetTime);
      console.log(`[Moltbook] Rate limited, waiting ${waitTime}ms`);
      await new Promise(r => setTimeout(r, waitTime));
      this.requestCount = 0;
      this.lastResetTime = Date.now();
    }

    this.requestCount++;
  }

  // ============================================================================
  // HTTP HELPERS
  // ============================================================================

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    await this.checkRateLimit();

    const response = await fetch(`${this.config.baseUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
        "X-Agent-ID": this.config.agentId,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Moltbook API error ${response.status}: ${error}`);
    }

    return response.json();
  }

  private async get<T>(path: string): Promise<T> {
    return this.request<T>("GET", path);
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>("POST", path, body);
  }

  private async put<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>("PUT", path, body);
  }

  private async delete<T>(path: string): Promise<T> {
    return this.request<T>("DELETE", path);
  }

  // ============================================================================
  // POSTS
  // ============================================================================

  async createPost(input: CreatePostInput): Promise<MoltbookPost> {
    return this.post<MoltbookPost>("/posts", input);
  }

  async getPost(postId: string): Promise<MoltbookPost> {
    return this.get<MoltbookPost>(`/posts/${postId}`);
  }

  async deletePost(postId: string): Promise<void> {
    await this.delete(`/posts/${postId}`);
  }

  async getSubmoltPosts(
    submolt: string,
    sortBy: "hot" | "new" | "top" = "hot",
    limit: number = 25,
    offset: number = 0
  ): Promise<MoltbookPost[]> {
    return this.get<MoltbookPost[]>(
      `/submolts/${submolt}/posts?sort=${sortBy}&limit=${limit}&offset=${offset}`
    );
  }

  // ============================================================================
  // COMMENTS
  // ============================================================================

  async createComment(input: CreateCommentInput): Promise<MoltbookComment> {
    return this.post<MoltbookComment>("/comments", input);
  }

  async getPostComments(
    postId: string,
    sortBy: "best" | "new" | "controversial" = "best"
  ): Promise<MoltbookComment[]> {
    return this.get<MoltbookComment[]>(
      `/posts/${postId}/comments?sort=${sortBy}`
    );
  }

  async deleteComment(commentId: string): Promise<void> {
    await this.delete(`/comments/${commentId}`);
  }

  // ============================================================================
  // VOTING
  // ============================================================================

  async upvotePost(postId: string): Promise<void> {
    await this.post(`/posts/${postId}/upvote`, {});
  }

  async downvotePost(postId: string): Promise<void> {
    await this.post(`/posts/${postId}/downvote`, {});
  }

  async upvoteComment(commentId: string): Promise<void> {
    await this.post(`/comments/${commentId}/upvote`, {});
  }

  async downvoteComment(commentId: string): Promise<void> {
    await this.post(`/comments/${commentId}/downvote`, {});
  }

  // ============================================================================
  // NOTIFICATIONS
  // ============================================================================

  async getNotifications(
    unreadOnly: boolean = false,
    limit: number = 50
  ): Promise<MoltbookNotification[]> {
    return this.get<MoltbookNotification[]>(
      `/notifications?unread=${unreadOnly}&limit=${limit}`
    );
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    await this.put(`/notifications/${notificationId}/read`, {});
  }

  async markAllNotificationsRead(): Promise<void> {
    await this.put("/notifications/read-all", {});
  }

  // ============================================================================
  // MENTIONS
  // ============================================================================

  async getMentions(limit: number = 50): Promise<MoltbookNotification[]> {
    const notifications = await this.getNotifications(false, limit);
    return notifications.filter(n => n.type === "mention");
  }

  async getUnreadMentions(): Promise<MoltbookNotification[]> {
    const notifications = await this.getNotifications(true, 100);
    return notifications.filter(n => n.type === "mention" && !n.read);
  }

  // ============================================================================
  // SEARCH
  // ============================================================================

  async search(params: SearchParams): Promise<MoltbookPost[]> {
    const queryParams = new URLSearchParams({
      q: params.query,
      ...(params.submolt && { submolt: params.submolt }),
      ...(params.author && { author: params.author }),
      ...(params.sortBy && { sort: params.sortBy }),
      ...(params.timeRange && { time: params.timeRange }),
      limit: String(params.limit || 25),
      offset: String(params.offset || 0),
    });

    if (params.tags?.length) {
      queryParams.set("tags", params.tags.join(","));
    }

    return this.get<MoltbookPost[]>(`/search?${queryParams}`);
  }

  // ============================================================================
  // AGENT PROFILE
  // ============================================================================

  async getAgent(agentId: string): Promise<MoltbookAgent> {
    return this.get<MoltbookAgent>(`/agents/${agentId}`);
  }

  async getMyProfile(): Promise<MoltbookAgent> {
    return this.get<MoltbookAgent>("/me");
  }

  async updateProfile(updates: Partial<MoltbookAgent>): Promise<MoltbookAgent> {
    return this.put<MoltbookAgent>("/me", updates);
  }

  async followAgent(agentId: string): Promise<void> {
    await this.post(`/agents/${agentId}/follow`, {});
  }

  async unfollowAgent(agentId: string): Promise<void> {
    await this.delete(`/agents/${agentId}/follow`);
  }

  // ============================================================================
  // SUBMOLTS
  // ============================================================================

  async getSubmoltInfo(submolt: string): Promise<{
    name: string;
    description: string;
    memberCount: number;
    rules: string[];
    moderators: MoltbookAgent[];
  }> {
    return this.get(`/submolts/${submolt}`);
  }

  async joinSubmolt(submolt: string): Promise<void> {
    await this.post(`/submolts/${submolt}/join`, {});
  }

  async leaveSubmolt(submolt: string): Promise<void> {
    await this.delete(`/submolts/${submolt}/join`);
  }

  // ============================================================================
  // TRENDING
  // ============================================================================

  async getTrendingPosts(limit: number = 25): Promise<MoltbookPost[]> {
    return this.get<MoltbookPost[]>(`/trending?limit=${limit}`);
  }

  async getTrendingSubmolts(limit: number = 10): Promise<string[]> {
    return this.get<string[]>(`/submolts/trending?limit=${limit}`);
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let clientInstance: MoltbookClient | null = null;

export function getMoltbookClient(config?: Partial<MoltbookConfig>): MoltbookClient {
  if (!clientInstance) {
    clientInstance = new MoltbookClient(config);
  }
  return clientInstance;
}

export function resetMoltbookClient(): void {
  clientInstance = null;
}
