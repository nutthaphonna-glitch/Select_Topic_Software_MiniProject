// ==========================================================
// E-Book Shop - Supabase BaaS Client Integration
// PostgreSQL Database, Supabase Auth, Storage & Realtime
// ==========================================================

const SUPABASE_STORAGE_KEY = 'ebook_supabase_config';

// Default configuration (can be updated dynamically in UI settings)
const DEFAULT_SUPABASE_CONFIG = {
  url: 'https://xyzcompany.supabase.co', // Replace with your Supabase Project URL
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', // Replace with your Supabase Public Anon Key
  connected: false
};

class SupabaseService {
  constructor() {
    this.client = null;
    this.config = this.loadConfig();
    this.initClient();
  }

  loadConfig() {
    try {
      const saved = localStorage.getItem(SUPABASE_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Failed to load saved Supabase config:", e);
    }
    return { ...DEFAULT_SUPABASE_CONFIG };
  }

  saveConfig(url, anonKey) {
    this.config = {
      url: url.trim(),
      anonKey: anonKey.trim(),
      connected: false
    };
    localStorage.setItem(SUPABASE_STORAGE_KEY, JSON.stringify(this.config));
    this.initClient();
  }

  isConfigured() {
    return (
      this.config &&
      this.config.url &&
      this.config.anonKey &&
      !this.config.url.includes('xyzcompany') &&
      this.config.anonKey.length > 20
    );
  }

  initClient() {
    if (typeof window !== 'undefined' && window.supabase && this.isConfigured()) {
      try {
        this.client = window.supabase.createClient(this.config.url, this.config.anonKey);
        this.config.connected = true;
        console.log("⚡ Supabase Client initialized successfully:", this.config.url);
      } catch (err) {
        console.error("Failed to initialize Supabase client:", err);
        this.client = null;
        this.config.connected = false;
      }
    } else {
      this.client = null;
      this.config.connected = false;
    }
  }

  async testConnection(url, anonKey) {
    try {
      if (!window.supabase) {
        return { success: false, message: "Supabase JS library not loaded" };
      }
      const testClient = window.supabase.createClient(url.trim(), anonKey.trim());
      const { data, error } = await testClient.from('products').select('count', { count: 'exact', head: true });
      if (error && error.code !== 'PGRST116') {
        return { success: false, message: error.message || "Failed to query Supabase" };
      }
      return { success: true, message: "Connected to Supabase PostgreSQL successfully!" };
    } catch (err) {
      return { success: false, message: err.message || "Connection failed" };
    }
  }

  // ========== 1. PRODUCTS DATABASE (POSTGRESQL) ==========
  async getProducts() {
    if (this.client) {
      try {
        const { data, error } = await this.client
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map(item => ({
            id: item.id,
            title: item.title,
            author: item.author,
            price: Number(item.price),
            originalPrice: item.original_price ? Number(item.original_price) : null,
            rating: Number(item.rating || 5.0),
            reviewCount: 10,
            fileType: item.file_type || 'PDF',
            fileSize: 'ขนาดประมาณ 5.5 MB',
            category: item.category,
            categoryName: item.category === 'E-Book' ? 'หนังสือดิจิทัล' : item.category,
            description: item.description,
            downloadUrl: '/downloads/life-better-start-from-us.pdf',
            coverGradient: item.gradient || 'from-blue-600 to-indigo-700',
            badge: item.tag || 'ยอดนิยม'
          }));
        }
      } catch (e) {
        console.warn("Supabase getProducts error:", e);
      }
    }
    return null;
  }

  async insertProduct(product) {
    if (this.client) {
      try {
        const payload = {
          id: product.id,
          title: product.title,
          author: product.author,
          price: product.price,
          original_price: product.originalPrice,
          rating: product.rating || 5.0,
          file_type: product.fileType || 'PDF',
          category: product.category,
          description: product.description,
          gradient: product.coverGradient || product.gradient || 'from-blue-600 to-indigo-700',
          tag: product.badge || product.tag || null
        };
        const { data, error } = await this.client.from('products').insert([payload]).select();
        if (error) throw error;
        return { success: true, data };
      } catch (e) {
        console.error("Supabase insertProduct failed:", e);
        return { success: false, error: e.message };
      }
    }
    return { success: false, fallback: true };
  }

  async updateProduct(id, updates) {
    if (this.client) {
      try {
        const payload = {
          title: updates.title,
          author: updates.author,
          price: updates.price,
          original_price: updates.originalPrice,
          category: updates.category,
          description: updates.description
        };
        const { data, error } = await this.client.from('products').update(payload).eq('id', id).select();
        if (error) throw error;
        return { success: true, data };
      } catch (e) {
        console.error("Supabase updateProduct failed:", e);
        return { success: false, error: e.message };
      }
    }
    return { success: false, fallback: true };
  }

  async deleteProduct(id) {
    if (this.client) {
      try {
        const { error } = await this.client.from('products').delete().eq('id', id);
        if (error) throw error;
        return { success: true };
      } catch (e) {
        console.error("Supabase deleteProduct failed:", e);
        return { success: false, error: e.message };
      }
    }
    return { success: false, fallback: true };
  }

  // ========== 2. ORDERS & STATISTICS DATABASE (POSTGRESQL) ==========
  async getOrders() {
    if (this.client) {
      try {
        const { data, error } = await this.client
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data.map(o => ({
            id: o.id,
            customerName: o.customer_name,
            customerEmail: o.customer_email,
            customerPhone: "089-999-9999",
            totalAmount: Number(o.total_amount),
            paymentStatus: o.status,
            deliveryStatus: "DELIVERED",
            paymentMethod: o.payment_method || "Stripe (Card)",
            stripeChargeId: o.stripe_charge_id,
            items: typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || []),
            createdAt: o.created_at
          }));
        }
      } catch (e) {
        console.warn("Supabase getOrders error:", e);
      }
    }
    return null;
  }

  async insertOrder(order) {
    if (this.client) {
      try {
        const payload = {
          id: order.id,
          customer_name: order.customerName,
          customer_email: order.customerEmail,
          total_amount: order.totalAmount,
          status: order.paymentStatus || order.status || 'PAID',
          payment_method: order.paymentMethod || 'Stripe (Card)',
          stripe_charge_id: order.stripeChargeId,
          items: order.items,
          created_at: order.createdAt || new Date().toISOString()
        };
        const { data, error } = await this.client.from('orders').insert([payload]).select();
        if (error) throw error;
        return { success: true, data };
      } catch (e) {
        console.error("Supabase insertOrder failed:", e);
        return { success: false, error: e.message };
      }
    }
    return { success: false, fallback: true };
  }

  async trackOrder(query) {
    if (this.client && query) {
      try {
        const cleanQuery = query.trim();
        const { data, error } = await this.client
          .from('orders')
          .select('*')
          .or(`id.ilike.%${cleanQuery}%,customer_email.ilike.%${cleanQuery}%`)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map(o => ({
            id: o.id,
            customerName: o.customer_name,
            customerEmail: o.customer_email,
            customerPhone: "089-999-9999",
            totalAmount: Number(o.total_amount),
            paymentStatus: o.status,
            deliveryStatus: "DELIVERED",
            paymentMethod: o.payment_method || "Stripe (Card)",
            stripeChargeId: o.stripe_charge_id,
            items: typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || []),
            createdAt: o.created_at
          }));
        }
      } catch (e) {
        console.warn("Supabase trackOrder query error:", e);
      }
    }
    return null;
  }

  // ========== 3. MEMBERSHIP & USER PROFILES (SUPABASE AUTH & PROFILES) ==========
  async signUp(email, password, name, role = 'user') {
    if (this.client) {
      try {
        // 1. Supabase Auth signUp
        const { data, error } = await this.client.auth.signUp({
          email,
          password,
          options: {
            data: { name, role }
          }
        });
        if (error) throw error;

        // 2. Direct upsert to public.profiles table
        const userId = data.user?.id;
        if (userId) {
          try {
            await this.client.from('profiles').upsert({
              id: userId,
              email: email,
              name: name,
              role: role
            });
          } catch (profileErr) {
            console.warn("Supabase profile upsert note:", profileErr);
          }
        }

        return { 
          success: true, 
          user: { name, email, role, id: userId || 'usr-' + Date.now() } 
        };
      } catch (e) {
        console.error("Supabase signUp failed:", e);
        return { success: false, error: e.message };
      }
    }
    return { success: false, fallback: true };
  }

  async signIn(email, password) {
    if (this.client) {
      try {
        // 1. Authenticate via Supabase Auth
        const { data, error } = await this.client.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;

        let name = data.user.user_metadata?.name || email.split('@')[0];
        let role = data.user.user_metadata?.role || (email.toLowerCase().includes('admin') ? 'admin' : 'user');

        // 2. Fetch or auto-create profile in public.profiles table
        try {
          const { data: prof } = await this.client.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
          if (prof) {
            name = prof.name || name;
            role = prof.role || role;
          } else {
            // Auto insert into profiles if not already present
            await this.client.from('profiles').upsert({
              id: data.user.id,
              email: data.user.email || email,
              name: name,
              role: role
            });
          }
        } catch (profErr) {
          console.warn("Profiles auto-sync error:", profErr);
        }

        return { success: true, user: { name, email, role, id: data.user.id } };
      } catch (e) {
        console.error("Supabase signIn failed:", e);
        return { success: false, error: e.message };
      }
    }
    return { success: false, fallback: true };
  }

  async getProfiles() {
    if (this.client) {
      try {
        const { data, error } = await this.client.from('profiles').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          return data;
        }
      } catch (e) {
        console.warn("Supabase getProfiles error:", e);
      }
    }
    return [];
  }

  // Subscribe to Realtime Orders updates
  subscribeRealtimeOrders(onInsertCallback) {
    if (this.client) {
      try {
        return this.client
          .channel('public:orders')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, payload => {
            console.log("⚡ Realtime new order received from Supabase:", payload);
            if (onInsertCallback) onInsertCallback(payload.new);
          })
          .subscribe();
      } catch (e) {
        console.warn("Realtime subscription error:", e);
      }
    }
    return null;
  }
}

// Global Singleton Instance
window.supabaseService = new SupabaseService();
