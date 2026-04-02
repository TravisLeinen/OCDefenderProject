// Azure Web App User Info Manager (Authentication handled by Azure)

class AuthManager {
  constructor() {
    this.user = null;
  }

  async loadUserInfo() {
    try {
      // Azure Web Apps provides user info at /.auth/me
      console.debug('[Auth] Fetching /.auth/me ...');
      const response = await fetch('/.auth/me');
      console.debug('[Auth] /.auth/me response status:', response.status);
      
      if (!response.ok) {
        console.warn('[Auth] /.auth/me returned non-OK status:', response.status);
        return null;
      }
      
      const payload = await response.json();
      console.debug('[Auth] /.auth/me payload:', JSON.stringify(payload));
      
      // Azure App Service returns an array: [{provider_name, user_id, user_claims, ...}]
      if (payload && Array.isArray(payload) && payload.length > 0) {
        this.user = payload[0];
        console.debug('[Auth] Parsed user from array format:', this.user);
        return this.user;
      }
      
      // Azure Static Web Apps returns: {clientPrincipal: {identityProvider, userId, userDetails, userRoles, claims}}
      if (payload && payload.clientPrincipal) {
        const cp = payload.clientPrincipal;
        console.debug('[Auth] Parsed clientPrincipal:', cp);
        // Normalize to a common shape so getter methods work
        this.user = {
          provider_name: cp.identityProvider,
          user_id: cp.userId,
          user_claims: (cp.claims || []).map(c => ({ typ: c.typ, val: c.val })),
          user_details: cp.userDetails,
          user_roles: cp.userRoles || []
        };
        console.debug('[Auth] Normalized user object:', this.user);
        return this.user;
      }
      
      console.warn('[Auth] /.auth/me payload did not match expected formats. Payload:', payload);
      return null;
    } catch (error) {
      console.error('[Auth] Error loading user info:', error);
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

  // Easy Auth: check if user is authenticated via /.auth/me
  async checkAuthStatus() {
    console.debug('[Auth] checkAuthStatus called');
    const user = await this.loadUserInfo();
    console.debug('[Auth] checkAuthStatus result:', user !== null);
    return user !== null;
  }

  // Show the login screen and hide everything else
  showLoginScreen() {
    console.debug('[Auth] showLoginScreen called');
    const loginScreen = document.getElementById('loginScreen');
    const caseEntryScreen = document.getElementById('caseEntryScreen');
    const mainApp = document.getElementById('mainApp');

    console.debug('[Auth] loginScreen element:', loginScreen);
    console.debug('[Auth] caseEntryScreen element:', caseEntryScreen);
    console.debug('[Auth] mainApp element:', mainApp);

    if (loginScreen) loginScreen.style.display = 'flex';
    if (caseEntryScreen) caseEntryScreen.style.display = 'none';
    if (mainApp) mainApp.style.display = 'none';
  }

  // Hide the login screen
  hideLoginScreen() {
    console.debug('[Auth] hideLoginScreen called');
    const loginScreen = document.getElementById('loginScreen');
    if (loginScreen) {
      console.debug('[Auth] Hiding login screen, current display:', loginScreen.style.display);
      loginScreen.style.display = 'none';
    }
  }

  // Redirect to Azure Easy Auth login endpoint
  redirectToLogin(provider) {
    const allowedProviders = ['aad', 'github', 'google', 'twitter', 'facebook'];
    if (!allowedProviders.includes(provider)) {
      console.error('Invalid auth provider:', provider);
      return;
    }
    window.location.href = `/.auth/login/${encodeURIComponent(provider)}`;
  }

  // Redirect to Azure Easy Auth logout endpoint
  redirectToLogout() {
    window.location.href = '/.auth/logout';
  }
}
