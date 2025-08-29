// 電子郵件驗證和密碼重置系統
class EmailVerificationSystem {
  constructor() {
    this.spaceId = 'os5wf90ljenp';
    this.deliveryToken = 'YOUR_DELIVERY_TOKEN';
    this.managementToken = 'YOUR_MANAGEMENT_TOKEN';
    
    // 初始化 Contentful 客戶端
    this.deliveryClient = contentful.createClient({
      space: this.spaceId,
      accessToken: this.deliveryToken
    });
  }

  // 生成驗證令牌
  generateVerificationToken() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15) +
           Date.now().toString(36);
  }

  // 生成重置令牌
  generateResetToken() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15) +
           Date.now().toString(36);
  }

  // 發送驗證郵件
  async sendVerificationEmail(email, name, verificationToken) {
    try {
      const verificationLink = `${window.location.origin}/verify-email.html?token=${verificationToken}&email=${encodeURIComponent(email)}`;
      
      const emailContent = {
        to: email,
        subject: '【航向世界旅遊頻道】電子郵件驗證',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 24px;">📺 航向世界旅遊頻道</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">節目管理系統 - 電子郵件驗證</p>
            </div>
            
            <div style="padding: 30px; background: #f8f9fa;">
              <h2 style="color: #333; margin-bottom: 20px;">您好 ${name}，</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
                感謝您註冊航向世界旅遊頻道節目管理系統。為了確保您的帳號安全，
                請點擊下方按鈕完成電子郵件驗證：
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationLink}" 
                   style="background: linear-gradient(135deg, #2b71d2, #1e5bb8); 
                          color: white; 
                          padding: 15px 30px; 
                          text-decoration: none; 
                          border-radius: 8px; 
                          display: inline-block; 
                          font-weight: bold;
                          box-shadow: 0 4px 15px rgba(43, 113, 210, 0.3);">
                  ✅ 驗證我的電子郵件
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-top: 25px;">
                如果按鈕無法點擊，請複製以下連結到瀏覽器：<br>
                <a href="${verificationLink}" style="color: #2b71d2; word-break: break-all;">${verificationLink}</a>
              </p>
              
              <div style="margin-top: 30px; padding: 20px; background: #e9ecef; border-radius: 8px;">
                <h3 style="color: #495057; margin: 0 0 10px 0;">🔒 安全提醒</h3>
                <ul style="color: #6c757d; margin: 0; padding-left: 20px;">
                  <li>此驗證連結將在 24 小時後失效</li>
                  <li>請勿將此郵件轉發給他人</li>
                  <li>如果您沒有註冊此帳號，請忽略此郵件</li>
                </ul>
              </div>
            </div>
            
            <div style="background: #343a40; color: #adb5bd; padding: 20px; text-align: center; font-size: 12px;">
              <p style="margin: 0;">© 2024 航向世界旅遊頻道 - Powered by Contentful CMS</p>
              <p style="margin: 5px 0 0 0;">此郵件由系統自動發送，請勿回覆</p>
            </div>
          </div>
        `
      };

      // 使用 EmailJS 發送郵件 (需要先設定 EmailJS)
      if (typeof emailjs !== 'undefined') {
        await emailjs.send('service_id', 'template_id', emailContent);
        console.log('驗證郵件已發送:', email);
        return true;
      } else {
        // 如果沒有 EmailJS，使用模擬發送
        console.log('模擬發送驗證郵件:', email);
        console.log('驗證連結:', verificationLink);
        return true;
      }
    } catch (error) {
      console.error('發送驗證郵件失敗:', error);
      return false;
    }
  }

  // 發送密碼重置郵件
  async sendPasswordResetEmail(email, name, resetToken) {
    try {
      const resetLink = `${window.location.origin}/reset-password.html?token=${resetToken}&email=${encodeURIComponent(email)}`;
      
      const emailContent = {
        to: email,
        subject: '【航向世界旅遊頻道】密碼重置請求',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); padding: 30px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 24px;">🔐 密碼重置</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">航向世界旅遊頻道節目管理系統</p>
            </div>
            
            <div style="padding: 30px; background: #f8f9fa;">
              <h2 style="color: #333; margin-bottom: 20px;">您好 ${name}，</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
                我們收到了您的密碼重置請求。請點擊下方按鈕重置您的密碼：
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" 
                   style="background: linear-gradient(135deg, #dc3545, #c82333); 
                          color: white; 
                          padding: 15px 30px; 
                          text-decoration: none; 
                          border-radius: 8px; 
                          display: inline-block; 
                          font-weight: bold;
                          box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);">
                  🔑 重置密碼
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-top: 25px;">
                如果按鈕無法點擊，請複製以下連結到瀏覽器：<br>
                <a href="${resetLink}" style="color: #dc3545; word-break: break-all;">${resetLink}</a>
              </p>
              
              <div style="margin-top: 30px; padding: 20px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px;">
                <h3 style="color: #856404; margin: 0 0 10px 0;">⚠️ 重要提醒</h3>
                <ul style="color: #856404; margin: 0; padding-left: 20px;">
                  <li>此重置連結將在 1 小時後失效</li>
                  <li>如果您沒有請求重置密碼，請忽略此郵件</li>
                  <li>請確保在安全的環境中重置密碼</li>
                </ul>
              </div>
            </div>
            
            <div style="background: #343a40; color: #adb5bd; padding: 20px; text-align: center; font-size: 12px;">
              <p style="margin: 0;">© 2024 航向世界旅遊頻道 - Powered by Contentful CMS</p>
              <p style="margin: 5px 0 0 0;">此郵件由系統自動發送，請勿回覆</p>
            </div>
          </div>
        `
      };

      // 使用 EmailJS 發送郵件
      if (typeof emailjs !== 'undefined') {
        await emailjs.send('service_id', 'template_id', emailContent);
        console.log('密碼重置郵件已發送:', email);
        return true;
      } else {
        // 模擬發送
        console.log('模擬發送密碼重置郵件:', email);
        console.log('重置連結:', resetLink);
        return true;
      }
    } catch (error) {
      console.error('發送密碼重置郵件失敗:', error);
      return false;
    }
  }

  // 創建用戶 (包含郵件驗證)
  async createUser(userData) {
    try {
      // 生成驗證令牌
      const verificationToken = this.generateVerificationToken();
      const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24小時後過期

      const entry = {
        fields: {
          email: {
            'zh-Hant': userData.email
          },
          name: {
            'zh-Hant': userData.name
          },
          role: {
            'zh-Hant': userData.role
          },
          passwordHash: {
            'zh-Hant': userData.password
          },
          status: {
            'zh-Hant': 'pending_verification' // 待驗證狀態
          },
          permissions: {
            'zh-Hant': Array.isArray(userData.permissions) ? userData.permissions.join(',') : userData.permissions || ''
          },
          createdAt: new Date().toISOString(),
          verificationToken: {
            'zh-Hant': verificationToken
          },
          verificationExpiry: verificationExpiry.toISOString(),
          isEmailVerified: false
        }
      };

      // 使用 REST API 創建用戶
      const response = await fetch(`https://api.contentful.com/spaces/${this.spaceId}/environments/master/entries`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.managementToken}`,
          'Content-Type': 'application/vnd.contentful.management.v1+json',
          'X-Contentful-Content-Type': 'adminUser'
        },
        body: JSON.stringify(entry)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`創建用戶失敗: ${errorData.message || response.statusText}`);
      }

      const createdEntry = await response.json();

      // 發送驗證郵件
      const emailSent = await this.sendVerificationEmail(
        userData.email, 
        userData.name, 
        verificationToken
      );

      if (!emailSent) {
        console.warn('用戶創建成功但驗證郵件發送失敗');
      }

      return {
        ...createdEntry,
        emailSent: emailSent
      };
    } catch (error) {
      console.error('創建用戶失敗:', error);
      throw error;
    }
  }

  // 驗證電子郵件
  async verifyEmail(token, email) {
    try {
      // 查找用戶
      const response = await this.deliveryClient.getEntries({
        content_type: 'adminUser',
        'fields.email': email,
        'fields.verificationToken': token,
        include: 2
      });

      if (response.items.length === 0) {
        throw new Error('無效的驗證令牌或電子郵件');
      }

      const user = response.items[0];
      const verificationExpiry = new Date(user.fields.verificationExpiry);

      // 檢查是否過期
      if (new Date() > verificationExpiry) {
        throw new Error('驗證令牌已過期');
      }

      // 更新用戶狀態為已驗證
      const updateResponse = await fetch(`https://api.contentful.com/spaces/${this.spaceId}/environments/master/entries/${user.sys.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.managementToken}`,
          'Content-Type': 'application/vnd.contentful.management.v1+json',
          'X-Contentful-Version': user.sys.version.toString()
        },
        body: JSON.stringify({
          fields: {
            ...user.fields,
            status: {
              'zh-Hant': 'active'
            },
            isEmailVerified: {
              'zh-Hant': true
            },
            verificationToken: {
              'zh-Hant': '' // 清除驗證令牌
            }
          }
        })
      });

      if (!updateResponse.ok) {
        throw new Error('更新用戶狀態失敗');
      }

      const updatedUser = await updateResponse.json();

      // 發布用戶
      await fetch(`https://api.contentful.com/spaces/${this.spaceId}/environments/master/entries/${user.sys.id}/published`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.managementToken}`,
          'X-Contentful-Version': updatedUser.sys.version.toString()
        }
      });

      return true;
    } catch (error) {
      console.error('驗證電子郵件失敗:', error);
      throw error;
    }
  }

  // 請求密碼重置
  async requestPasswordReset(email) {
    try {
      // 查找用戶
      const response = await this.deliveryClient.getEntries({
        content_type: 'adminUser',
        'fields.email': email,
        include: 2
      });

      if (response.items.length === 0) {
        throw new Error('找不到此電子郵件地址的用戶');
      }

      const user = response.items[0];

      // 生成重置令牌
      const resetToken = this.generateResetToken();
      const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1小時後過期

      // 更新用戶的重置令牌
      const updateResponse = await fetch(`https://api.contentful.com/spaces/${this.spaceId}/environments/master/entries/${user.sys.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.managementToken}`,
          'Content-Type': 'application/vnd.contentful.management.v1+json',
          'X-Contentful-Version': user.sys.version.toString()
        },
        body: JSON.stringify({
          fields: {
            ...user.fields,
            resetToken: {
              'zh-Hant': resetToken
            },
            resetExpiry: {
              'zh-Hant': resetExpiry.toISOString()
            }
          }
        })
      });

      if (!updateResponse.ok) {
        throw new Error('更新重置令牌失敗');
      }

      // 發送重置郵件
      const emailSent = await this.sendPasswordResetEmail(
        user.fields.email,
        user.fields.name,
        resetToken
      );

      return {
        success: true,
        emailSent: emailSent
      };
    } catch (error) {
      console.error('請求密碼重置失敗:', error);
      throw error;
    }
  }

  // 重置密碼
  async resetPassword(token, email, newPassword) {
    try {
      // 查找用戶
      const response = await this.deliveryClient.getEntries({
        content_type: 'adminUser',
        'fields.email': email,
        'fields.resetToken': token,
        include: 2
      });

      if (response.items.length === 0) {
        throw new Error('無效的重置令牌或電子郵件');
      }

      const user = response.items[0];
      const resetExpiry = new Date(user.fields.resetExpiry);

      // 檢查是否過期
      if (new Date() > resetExpiry) {
        throw new Error('重置令牌已過期');
      }

      // 更新密碼並清除重置令牌
      const updateResponse = await fetch(`https://api.contentful.com/spaces/${this.spaceId}/environments/master/entries/${user.sys.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.managementToken}`,
          'Content-Type': 'application/vnd.contentful.management.v1+json',
          'X-Contentful-Version': user.sys.version.toString()
        },
        body: JSON.stringify({
          fields: {
            ...user.fields,
            passwordHash: {
              'zh-Hant': newPassword
            },
            resetToken: {
              'zh-Hant': '' // 清除重置令牌
            }
          }
        })
      });

      if (!updateResponse.ok) {
        throw new Error('重置密碼失敗');
      }

      const updatedUser = await updateResponse.json();

      // 發布用戶
      await fetch(`https://api.contentful.com/spaces/${this.spaceId}/environments/master/entries/${user.sys.id}/published`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.managementToken}`,
          'X-Contentful-Version': updatedUser.sys.version.toString()
        }
      });

      return true;
    } catch (error) {
      console.error('重置密碼失敗:', error);
      throw error;
    }
  }

  // 檢查是否為超級管理員
  async isSuperAdmin(userId) {
    try {
      const user = await this.deliveryClient.getEntry(userId);
      return user.fields.role === 'super_admin';
    } catch (error) {
      console.error('檢查超級管理員權限失敗:', error);
      return false;
    }
  }

  // 創建超級管理員 (只能由系統初始化時使用)
  async createSuperAdmin(userData) {
    try {
      // 檢查是否已存在超級管理員
      const existingSuperAdmins = await this.deliveryClient.getEntries({
        content_type: 'adminUser',
        'fields.role': 'super_admin',
        include: 2
      });

      if (existingSuperAdmins.items.length > 0) {
        throw new Error('超級管理員已存在，無法創建多個超級管理員');
      }

      // 創建超級管理員
      const superAdminData = {
        ...userData,
        role: 'super_admin',
        permissions: ['super_admin', 'admin', 'user_manage', 'system_manage']
      };

      return await this.createUser(superAdminData);
    } catch (error) {
      console.error('創建超級管理員失敗:', error);
      throw error;
    }
  }

  // 創建一般管理員 (只能由超級管理員創建)
  async createAdminBySuperAdmin(superAdminId, userData) {
    try {
      // 驗證超級管理員權限
      const isSuper = await this.isSuperAdmin(superAdminId);
      if (!isSuper) {
        throw new Error('只有超級管理員才能創建其他管理員');
      }

      // 創建管理員
      const adminData = {
        ...userData,
        role: 'admin',
        permissions: ['admin', 'user_manage', 'schedule_manage', 'archive_manage']
      };

      return await this.createUser(adminData);
    } catch (error) {
      console.error('創建管理員失敗:', error);
      throw error;
    }
  }
}

// 導出類別
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EmailVerificationSystem;
}
