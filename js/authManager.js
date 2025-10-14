// Azure Static Web Apps Authentication Manager

class AuthManager {
  constructor() {
    this.user = null;
    this.isAuthenticated = false;
  }

  async checkAuthStatus() {
    try {
      // Azure Static Web Apps provides user info at /.auth/me
      const response = await fetch('/.auth/me');
      const payload = await response.json();
      
      if (payload && payload.clientPrincipal) {
        this.user = payload.clientPrincipal;
        this.isAuthenticated = true;
        console.log('User authenticated:', this.user);
        return true;
      } else {
        this.user = null;
        this.isAuthenticated = false;
        console.log('User not authenticated');
        return false;
      }
    } catch (error) {
      console.error('Error checking authentication status:', error);
      this.user = null;
      this.isAuthenticated = false;
      return false;
    }
  }

  getUser() {
    return this.user;
  }

  isUserAuthenticated() {
    return this.isAuthenticated;
  }

  getUserDisplayName() {
    if (!this.user) return 'Unknown User';
    return this.user.userDetails || this.user.userId || 'User';
  }

  getUserProvider() {
    if (!this.user) return null;
    return this.user.identityProvider;
  }

  // Redirect to login - Azure Static Web Apps handles this
  redirectToLogin(provider = 'aad') {
    // Available providers: aad (Azure AD), github, twitter, google, facebook
    window.location.href = `/.auth/login/${provider}`;
  }

  // Redirect to logout
  redirectToLogout() {
    window.location.href = '/.auth/logout';
  }

  showLoginScreen() {
    const loginScreen = document.getElementById('loginScreen');
    const caseEntryScreen = document.getElementById('caseEntryScreen');
    const mainApp = document.getElementById('mainApp');
    
    if (loginScreen) {
      loginScreen.style.display = 'flex';
    }
    if (caseEntryScreen) {
      caseEntryScreen.style.display = 'none';
    }
    if (mainApp) {
      mainApp.style.display = 'none';
    }
  }

  hideLoginScreen() {
    const loginScreen = document.getElementById('loginScreen');
    if (loginScreen) {
      loginScreen.style.display = 'none';
    }
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