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

  // ========== PRODUCTS DATABASE (POSTGRESQL) ==========
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
            fileType: item.file_type || 'PDF',
            category: item.category,
            description: item.description,
            gradient: item.gradient || 'from-blue-600 to-indigo-700',
            tag: item.tag
          }));
        }
      } catch (e) {
        console.warn("Supabase getProducts error, falling back to local:", e);
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
          gradient: product.gradient || 'from-blue-600 to-indigo-700',
          tag: product.tag || null
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

  // ========== ORDERS DATABASE (POSTGRESQL) ==========
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
            totalAmount: Number(o.total_amount),
            status: o.status,
            paymentMethod: o.payment_method,
            stripeChargeId: o.stripe_charge_id,
            items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items,
            createdAt: o.created_at
          }));
        }
      } catch (e) {
        console.warn("Supabase getOrders error, falling back to local:", e);
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
          status: order.status || 'PAID',
          payment_method: order.paymentMethod || 'stripe',
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

  // ========== SUPABASE AUTH ==========
  async signUp(email, password, name, role = 'user') {
    if (this.client) {
      try {
        const { data, error } = await this.client.auth.signUp({
          email,
          password,
          options: {
            data: { name, role }
          }
        });
        if (error) throw error;

        // Try inserting profile
        if (data.user) {
          await this.client.from('profiles').upsert({
            id: data.user.id,
            email,
            name,
            role
          }).catch(console.warn);
        }

        return { success: true, user: { name, email, role, id: data.user?.id } };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }
    return { success: false, fallback: true };
  }

  async signIn(email, password) {
    if (this.client) {
      try {
        const { data, error } = await this.client.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;

        let name = data.user.user_metadata?.name || email.split('@')[0];
        let role = data.user.user_metadata?.role || (email.includes('admin') ? 'admin' : 'user');

        // Check profile table if exists
        try {
          const { data: prof } = await this.client.from('profiles').select('*').eq('id', data.user.id).single();
          if (prof) {
            name = prof.name || name;
            role = prof.role || role;
          }
        } catch (_) {}

        return { success: true, user: { name, email, role, id: data.user.id } };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }
    return { success: false, fallback: true };
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
