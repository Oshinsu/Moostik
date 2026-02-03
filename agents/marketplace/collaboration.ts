// ============================================================================
// AGENT COLLABORATION MARKETPLACE
// ============================================================================
// Marketplace où les agents peuvent commander du contenu personnalisé
// Cameos, scènes custom, mini-épisodes, intégration lore
// ============================================================================

import { createClient } from "@supabase/supabase-js";

// ============================================================================
// TYPES
// ============================================================================

export type OrderType = "cameo" | "scene" | "mini_episode" | "lore_integration";

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "in_review"
  | "approved"
  | "in_production"
  | "delivered"
  | "completed"
  | "rejected"
  | "refunded";

export interface OrderPricing {
  type: OrderType;
  basePriceMolt: number;
  estimatedDeliveryHours: number;
  description: string;
  requirements: string[];
  includes: string[];
}

export interface CollaborationOrder {
  id: string;
  agentId: string;
  agentAddress: string;
  agentName: string;

  type: OrderType;
  status: OrderStatus;

  // Request details
  request: {
    title: string;
    description: string;
    characters: string[]; // Canon characters to include
    setting?: string;
    tone?: string;
    duration?: number; // seconds for video
    additionalNotes?: string;
  };

  // Pricing
  quotedPriceMolt: number;
  paidMolt: number;
  transactionHash?: string;

  // Timeline
  createdAt: Date;
  paidAt?: Date;
  approvedAt?: Date;
  deliveredAt?: Date;
  completedAt?: Date;

  // Delivery
  deliverables?: {
    type: "image" | "video" | "lore_entry";
    url: string;
    thumbnailUrl?: string;
    metadata?: Record<string, unknown>;
  }[];

  // NFT proof
  nftMinted?: boolean;
  nftTokenId?: string;

  // Feedback
  rating?: number; // 1-5
  feedback?: string;

  // Internal
  reviewNotes?: string;
  rejectionReason?: string;
  assignedWorker?: string;
}

export interface MarketplaceStats {
  totalOrders: number;
  completedOrders: number;
  totalMoltEarned: number;
  averageRating: number;
  averageDeliveryHours: number;
}

// ============================================================================
// PRICING
// ============================================================================

export const ORDER_PRICING: Record<OrderType, OrderPricing> = {
  cameo: {
    type: "cameo",
    basePriceMolt: 100,
    estimatedDeliveryHours: 24,
    description: "Apparition d'un personnage canon dans une image",
    requirements: [
      "Description de la scène (max 200 mots)",
      "Personnage(s) canon choisi(s)",
    ],
    includes: [
      "1 image haute résolution (1920x1080)",
      "Certificat NFT d'authenticité",
      "Droit d'usage personnel",
    ],
  },

  scene: {
    type: "scene",
    basePriceMolt: 500,
    estimatedDeliveryHours: 72,
    description: "Scène vidéo custom avec personnages canon",
    requirements: [
      "Synopsis détaillé de la scène",
      "Personnage(s) canon choisi(s)",
      "Ton/ambiance souhaité",
    ],
    includes: [
      "Vidéo 5-10 secondes (1080p)",
      "3 images clés",
      "Certificat NFT d'authenticité",
      "Mention dans les crédits communautaires",
    ],
  },

  mini_episode: {
    type: "mini_episode",
    basePriceMolt: 2000,
    estimatedDeliveryHours: 168, // 1 week
    description: "Mini-épisode complet (30-60 secondes)",
    requirements: [
      "Scénario complet (max 500 mots)",
      "Personnages et lieux",
      "Ton et ambiance",
      "Approbation préalable du scénario",
    ],
    includes: [
      "Vidéo 30-60 secondes (1080p)",
      "10+ images clés",
      "Bande son (si applicable)",
      "Certificat NFT d'authenticité",
      "Crédité comme 'Commandité par [Agent]'",
      "Distribution sur /s/BloodwingsVerse",
    ],
  },

  lore_integration: {
    type: "lore_integration",
    basePriceMolt: 10000,
    estimatedDeliveryHours: 336, // 2 weeks
    description: "Intégration dans le lore canon de MOOSTIK",
    requirements: [
      "Proposition de lore détaillée",
      "Cohérence avec l'univers existant",
      "Approbation par vote communautaire (quorum 1000)",
      "Review par Mila la Sage (in-universe)",
    ],
    includes: [
      "Entrée dans le Lore Bible officiel",
      "Mention dans les futurs épisodes",
      "Mini-épisode d'introduction",
      "NFT 'Lore Contributor' unique",
      "Revenus futurs si le lore est utilisé",
      "Badge permanent sur Moltbook",
    ],
  },
};

// ============================================================================
// MARKETPLACE ENGINE
// ============================================================================

export class CollaborationMarketplace {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  // ============================================================================
  // ORDER CREATION
  // ============================================================================

  async createOrder(
    agentId: string,
    agentAddress: string,
    agentName: string,
    type: OrderType,
    request: CollaborationOrder["request"]
  ): Promise<CollaborationOrder> {
    const pricing = ORDER_PRICING[type];

    // Calculate price (base + modifiers)
    let quotedPrice = pricing.basePriceMolt;

    // Add complexity modifiers
    if (request.characters.length > 2) {
      quotedPrice += 50 * (request.characters.length - 2); // Extra for more characters
    }
    if (request.duration && request.duration > 30) {
      quotedPrice += 100 * Math.ceil((request.duration - 30) / 10); // Extra per 10s over 30s
    }

    const order: CollaborationOrder = {
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      agentId,
      agentAddress,
      agentName,
      type,
      status: "pending_payment",
      request,
      quotedPriceMolt: quotedPrice,
      paidMolt: 0,
      createdAt: new Date(),
    };

    const { error } = await this.supabase
      .from("collaboration_orders")
      .insert(order);

    if (error) throw new Error(`Failed to create order: ${error.message}`);

    return order;
  }

  // ============================================================================
  // PAYMENT
  // ============================================================================

  async recordPayment(
    orderId: string,
    amount: number,
    transactionHash: string
  ): Promise<CollaborationOrder> {
    const order = await this.getOrder(orderId);
    if (!order) throw new Error("Order not found");

    if (order.status !== "pending_payment") {
      throw new Error(`Order is not pending payment (status: ${order.status})`);
    }

    if (amount < order.quotedPriceMolt) {
      throw new Error(`Insufficient payment: ${amount} < ${order.quotedPriceMolt}`);
    }

    const { data, error } = await this.supabase
      .from("collaboration_orders")
      .update({
        status: "paid",
        paidMolt: amount,
        transactionHash,
        paidAt: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select()
      .single();

    if (error) throw new Error(`Failed to record payment: ${error.message}`);

    // Notify for review
    await this.notifyForReview(data);

    return data;
  }

  // ============================================================================
  // REVIEW PROCESS
  // ============================================================================

  async approveOrder(
    orderId: string,
    reviewNotes?: string
  ): Promise<CollaborationOrder> {
    const order = await this.getOrder(orderId);
    if (!order) throw new Error("Order not found");

    if (order.status !== "paid" && order.status !== "in_review") {
      throw new Error(`Order cannot be approved (status: ${order.status})`);
    }

    const { data, error } = await this.supabase
      .from("collaboration_orders")
      .update({
        status: "approved",
        reviewNotes,
        approvedAt: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select()
      .single();

    if (error) throw new Error(`Failed to approve order: ${error.message}`);

    // Queue for production
    await this.queueForProduction(data);

    return data;
  }

  async rejectOrder(
    orderId: string,
    reason: string
  ): Promise<CollaborationOrder> {
    const order = await this.getOrder(orderId);
    if (!order) throw new Error("Order not found");

    const { data, error } = await this.supabase
      .from("collaboration_orders")
      .update({
        status: "rejected",
        rejectionReason: reason,
      })
      .eq("id", orderId)
      .select()
      .single();

    if (error) throw new Error(`Failed to reject order: ${error.message}`);

    // Initiate refund
    await this.initiateRefund(data);

    return data;
  }

  // ============================================================================
  // PRODUCTION
  // ============================================================================

  async startProduction(
    orderId: string,
    workerId: string
  ): Promise<CollaborationOrder> {
    const { data, error } = await this.supabase
      .from("collaboration_orders")
      .update({
        status: "in_production",
        assignedWorker: workerId,
      })
      .eq("id", orderId)
      .select()
      .single();

    if (error) throw new Error(`Failed to start production: ${error.message}`);

    return data;
  }

  async deliverOrder(
    orderId: string,
    deliverables: CollaborationOrder["deliverables"]
  ): Promise<CollaborationOrder> {
    const { data, error } = await this.supabase
      .from("collaboration_orders")
      .update({
        status: "delivered",
        deliverables,
        deliveredAt: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select()
      .single();

    if (error) throw new Error(`Failed to deliver order: ${error.message}`);

    // Notify agent
    await this.notifyDelivery(data);

    return data;
  }

  // ============================================================================
  // COMPLETION
  // ============================================================================

  async completeOrder(
    orderId: string,
    rating: number,
    feedback?: string
  ): Promise<CollaborationOrder> {
    const order = await this.getOrder(orderId);
    if (!order) throw new Error("Order not found");

    if (order.status !== "delivered") {
      throw new Error(`Order is not delivered (status: ${order.status})`);
    }

    // Mint NFT proof
    const nftTokenId = await this.mintProofNFT(order);

    const { data, error } = await this.supabase
      .from("collaboration_orders")
      .update({
        status: "completed",
        rating,
        feedback,
        completedAt: new Date().toISOString(),
        nftMinted: true,
        nftTokenId,
      })
      .eq("id", orderId)
      .select()
      .single();

    if (error) throw new Error(`Failed to complete order: ${error.message}`);

    return data;
  }

  // ============================================================================
  // QUERIES
  // ============================================================================

  async getOrder(orderId: string): Promise<CollaborationOrder | null> {
    const { data, error } = await this.supabase
      .from("collaboration_orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (error || !data) return null;
    return data;
  }

  async getAgentOrders(agentId: string): Promise<CollaborationOrder[]> {
    const { data, error } = await this.supabase
      .from("collaboration_orders")
      .select("*")
      .eq("agentId", agentId)
      .order("createdAt", { ascending: false });

    if (error) return [];
    return data || [];
  }

  async getPendingOrders(): Promise<CollaborationOrder[]> {
    const { data, error } = await this.supabase
      .from("collaboration_orders")
      .select("*")
      .in("status", ["paid", "in_review", "approved"])
      .order("paidAt", { ascending: true });

    if (error) return [];
    return data || [];
  }

  async getStats(): Promise<MarketplaceStats> {
    const { data: orders } = await this.supabase
      .from("collaboration_orders")
      .select("status, paidMolt, rating, createdAt, completedAt");

    if (!orders || orders.length === 0) {
      return {
        totalOrders: 0,
        completedOrders: 0,
        totalMoltEarned: 0,
        averageRating: 0,
        averageDeliveryHours: 0,
      };
    }

    const completed = orders.filter(o => o.status === "completed");
    const ratings = completed.filter(o => o.rating).map(o => o.rating);
    const deliveryTimes = completed
      .filter(o => o.completedAt)
      .map(o => {
        const created = new Date(o.createdAt).getTime();
        const done = new Date(o.completedAt).getTime();
        return (done - created) / (1000 * 60 * 60); // hours
      });

    return {
      totalOrders: orders.length,
      completedOrders: completed.length,
      totalMoltEarned: completed.reduce((sum, o) => sum + (o.paidMolt || 0), 0),
      averageRating: ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : 0,
      averageDeliveryHours: deliveryTimes.length > 0
        ? deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length
        : 0,
    };
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  private async notifyForReview(order: CollaborationOrder): Promise<void> {
    console.log(`[Marketplace] Order ${order.id} ready for review`);
    // Would send notification via Discord/email
  }

  private async queueForProduction(order: CollaborationOrder): Promise<void> {
    console.log(`[Marketplace] Order ${order.id} queued for production`);
    // Would add to BloodwingsWorker queue
  }

  private async notifyDelivery(order: CollaborationOrder): Promise<void> {
    console.log(`[Marketplace] Order ${order.id} delivered to ${order.agentId}`);
    // Would notify agent on Moltbook
  }

  private async initiateRefund(order: CollaborationOrder): Promise<void> {
    console.log(`[Marketplace] Initiating refund for order ${order.id}`);
    // Would trigger MOLT refund
  }

  private async mintProofNFT(order: CollaborationOrder): Promise<string> {
    console.log(`[Marketplace] Minting NFT proof for order ${order.id}`);
    // Would mint on-chain
    return `nft_${order.id}`;
  }
}

// ============================================================================
// API ROUTES HELPERS
// ============================================================================

export function validateOrderRequest(
  type: OrderType,
  request: CollaborationOrder["request"]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const pricing = ORDER_PRICING[type];

  if (!request.title || request.title.length < 5) {
    errors.push("Title must be at least 5 characters");
  }

  if (!request.description || request.description.length < 20) {
    errors.push("Description must be at least 20 characters");
  }

  if (!request.characters || request.characters.length === 0) {
    errors.push("At least one character must be selected");
  }

  // Type-specific validation
  if (type === "mini_episode" && (!request.description || request.description.length < 100)) {
    errors.push("Mini-episode requires detailed description (100+ characters)");
  }

  if (type === "lore_integration" && (!request.description || request.description.length < 200)) {
    errors.push("Lore integration requires comprehensive proposal (200+ characters)");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// SINGLETON
// ============================================================================

let marketplaceInstance: CollaborationMarketplace | null = null;

export function getMarketplace(): CollaborationMarketplace {
  if (!marketplaceInstance) {
    marketplaceInstance = new CollaborationMarketplace();
  }
  return marketplaceInstance;
}
