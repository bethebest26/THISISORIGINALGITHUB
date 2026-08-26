const fs = require('fs');
let content = fs.readFileSync('src/services/dbService.ts', 'utf8');

content = content.replace(/async checkPurchase\(userId: string, versionId: string\): Promise<boolean> \{[\s\S]*?async recordPurchase/, `async checkPurchase(userId: string, versionId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', userId)
        .eq('version_id', versionId);
      
      if (error) throw error;
      if (data && data.length > 0) {
        const p = data[0];
        if (p.expires_at) {
          const expiresAt = new Date(p.expires_at).getTime();
          if (Date.now() > expiresAt) {
            return false;
          }
        }
        return true;
      }
      return false;
    } catch (e) {
      console.warn("Error checking purchase in DB, using fallback:", e);
      // Fallback local storage
      const local = localStorage.getItem(\`bethebest_purchased_\${userId}_\${versionId}\`);
      if (local === 'true') {
        const expiry = localStorage.getItem(\`bethebest_purchased_\${userId}_\${versionId}_expires\`);
        if (expiry) {
           return Date.now() < new Date(expiry).getTime();
        }
        return true;
      }
      return false;
    }
  },

  /**
   * Unlock version for user
   */
  async recordPurchase`);

content = content.replace(/async recordPurchase\(userId: string, versionId: string, courseId: string\) \{[\s\S]*?async getUserPurchasedVersions/, `async recordPurchase(userId: string, versionId: string, courseId: string) {
    const purchasedAt = new Date();
    const expiresAt = new Date(purchasedAt.getTime() + 11 * 24 * 60 * 60 * 1000);
    
    try {
      // Try writing to purchases
      await supabase.from('purchases').insert({
        user_id: userId,
        version_id: versionId,
        course_id: courseId,
        payment_status: 'completed',
        purchased_at: purchasedAt.toISOString(),
        expires_at: expiresAt.toISOString()
      });
    } catch (e) {
      console.warn("Error inserting purchase record in DB, saving locally:", e);
    }

    // Always persist in local storage as safety backup
    localStorage.setItem(\`bethebest_purchased_\${userId}_\${versionId}\`, 'true');
    localStorage.setItem(\`bethebest_purchased_\${userId}_\${versionId}_expires\`, expiresAt.toISOString());
  },

  /**
   * Get all purchases for a user
   */
  async getUserPurchasedVersions`);

content = content.replace(/async getUserPurchasedVersions\(userId: string\): Promise<string\[\]> \{[\s\S]*?async saveChapterProgress/, `async getUserPurchasedVersions(userId: string): Promise<string[]> {
    const validPurchased: string[] = [];
    const now = Date.now();
    
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', userId);
      
      if (!error && data) {
        data.forEach(p => {
          if (p.expires_at) {
             const expTime = new Date(p.expires_at).getTime();
             if (now < expTime) {
                validPurchased.push(p.version_id);
             }
          } else {
             validPurchased.push(p.version_id);
          }
        });
        return validPurchased;
      }
    } catch (e) {}

    // Local storage scanning fallback
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(\`bethebest_purchased_\${userId}_\`) && !key.endsWith('_expires')) {
        const parts = key.split('_');
        const vId = parts[parts.length - 1];
        
        const expiry = localStorage.getItem(\`\${key}_expires\`);
        if (expiry) {
           if (now < new Date(expiry).getTime()) {
             validPurchased.push(vId);
           }
        } else {
           validPurchased.push(vId);
        }
      }
    }
    return validPurchased;
  },
  
  async getPurchaseDetails(userId: string): Promise<Record<string, { purchasedAt: string, expiresAt: string }>> {
    const details: Record<string, { purchasedAt: string, expiresAt: string }> = {};
    
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', userId);
        
      if (!error && data) {
        data.forEach(p => {
          details[p.version_id] = {
            purchasedAt: p.purchased_at || new Date().toISOString(),
            expiresAt: p.expires_at || new Date(Date.now() + 11*24*60*60*1000).toISOString()
          };
        });
        return details;
      }
    } catch (e) {}
    
    // Local storage scanning fallback
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(\`bethebest_purchased_\${userId}_\`) && !key.endsWith('_expires')) {
        const parts = key.split('_');
        const vId = parts[parts.length - 1];
        
        const expiry = localStorage.getItem(\`\${key}_expires\`);
        details[vId] = {
           purchasedAt: new Date().toISOString(), // Default
           expiresAt: expiry || new Date(Date.now() + 11*24*60*60*1000).toISOString()
        };
      }
    }
    return details;
  },

  /**
   * Save chapter quiz progress
   */
  async saveChapterProgress`);

fs.writeFileSync('src/services/dbService.ts', content);
