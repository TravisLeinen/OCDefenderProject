// Azure Web App User Info Manager (Authentication handled by Azure)

class AuthManager {
  constructor() {
    this.user = null;
  }

  async loadUserInfo() {
    try {
      // Azure Web Apps provides user info at /.auth/me
      const response = await fetch('/.auth/me');
      
      if (!response.ok) {
        console.warn('Could not load user info');
        return null;
      }
      
      const payload = await response.json();
      
      // Azure Web App returns an array of user info
      if (payload && Array.isArray(payload) && payload.length > 0) {
        this.user = payload[0];
        console.log('User info loaded:', this.user);
        return this.user;
      }
      
      return null;
    } catch (error) {
      console.error('Error loading user info:', error);
      return null;
    }
  }

  getUser() {
    return this.user;
  }

  getUserDisplayName() {
    if (!this.user) return 'User';
    
    if (this.user.user_claims) {
      const nameClaim = this.user.user_claims.find(claim => 
        claim.typ === 'name' || 
        claim.typ === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name' ||
        claim.typ === 'preferred_username'
      );
      if (nameClaim) return nameClaim.val;
      
      const emailClaim = this.user.user_claims.find(claim => 
        claim.typ === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress' ||
        claim.typ === 'email' ||
        claim.typ === 'emails'
      );
      if (emailClaim) return emailClaim.val;
    }
    
    return this.user.user_id || 'User';
  }

  getUserProvider() {
    if (!this.user) return null;
    return this.user.provider_name || this.user.identity_provider;
  }

  getUserId() {
    if (!this.user) return null;
    return this.user.user_id;
  }

  getUserEmail() {
    if (!this.user) return null;
    
    if (this.user.user_claims) {
      const emailClaim = this.user.user_claims.find(claim => 
        claim.typ === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress' ||
        claim.typ === 'email' ||
        claim.typ === 'emails'
      );
      if (emailClaim) return emailClaim.val;
    }
    
    return null;
  }

  getUserFullName() {
    if (!this.user) return null;
    
    if (this.user.user_claims) {
      const nameClaim = this.user.user_claims.find(claim => 
        claim.typ === 'name' ||
        claim.typ === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'
      );
      if (nameClaim) return nameClaim.val;
      
      const givenNameClaim = this.user.user_claims.find(claim => 
        claim.typ === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname' ||
        claim.typ === 'given_name'
      );
      const surnameClaim = this.user.user_claims.find(claim => 
        claim.typ === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname' ||
        claim.typ === 'family_name'
      );
      
      if (givenNameClaim && surnameClaim) {
        return `${givenNameClaim.val} ${surnameClaim.val}`;
      }
      if (givenNameClaim) return givenNameClaim.val;
      if (surnameClaim) return surnameClaim.val;
    }
    
    return this.getUserDisplayName();
  }

  getUserRoles() {
    if (!this.user) return [];
    
    if (this.user.user_claims) {
      const roleClaims = this.user.user_claims.filter(claim => 
        claim.typ === 'roles' ||
        claim.typ === 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
      );
      return roleClaims.map(claim => claim.val);
    }
    
    return [];
  }

  hasRole(role) {
    const roles = this.getUserRoles();
    return roles.includes(role);
  }

  getClaim(claimType) {
    if (!this.user || !this.user.user_claims) return null;
    
    const claim = this.user.user_claims.find(c => 
      c.typ === claimType || 
      c.typ.endsWith(`/${claimType}`)
    );
    
    return claim ? claim.val : null;
  }

  getUserTrackingInfo() {
    if (!this.user) return null;
    
    return {
      userId: this.getUserId(),
      email: this.getUserEmail(),
      displayName: this.getUserDisplayName(),
      fullName: this.getUserFullName(),
      provider: this.getUserProvider(),
      roles: this.getUserRoles(),
      timestamp: new Date().toISOString()
    };
  }

  createUserContext() {
    const trackingInfo = this.getUserTrackingInfo();
    if (!trackingInfo) return null;
    
    return {
      user: trackingInfo,
      sessionId: window.sessionId || generateSessionId(),
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };
  }

  updateUserInfo() {
    const userNameElement = document.getElementById('userName');
    const userProviderElement = document.getElementById('userProvider');
    
    if (userNameElement && this.user) {
      userNameElement.textContent = this.getUserDisplayName();
    }
    
    if (userProviderElement && this.user) {
      const provider = this.getUserProvider();
      if (provider) {
        userProviderElement.textContent = `via ${provider.toUpperCase()}`;
      }
    }
  }
}