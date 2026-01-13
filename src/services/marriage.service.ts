// Frontend/src/services/marriage.service.ts
// Marriage module specific service utilities

import { apiService } from './api.service';

export const marriageService = {
  // Profile operations
  async createProfile(data: any) {
    return apiService.post('/api/marriage/profile', data);
  },

  async getMyProfile() {
    return apiService.get('/api/marriage/profile/me');
  },

  async getProfile(profileId: string) {
    return apiService.get(`/api/marriage/profile/${profileId}`);
  },

  async updateProfile(profileId: string, data: any) {
    return apiService.put(`/api/marriage/profile/${profileId}`, data);
  },

  async deleteProfile(profileId: string) {
    return apiService.delete(`/api/marriage/profile/${profileId}`);
  },

  // Search and discovery
  async searchProfiles(filters: any) {
    return apiService.post('/api/marriage/search', filters);
  },

  async discoverProfiles(page = 1, limit = 20) {
    return apiService.get(`/api/marriage/discover?page=${page}&limit=${limit}`);
  },

  // Document uploads
  async uploadDocuments(profileId: string, data: any) {
    return apiService.post(`/api/marriage/profile/${profileId}/documents`, data);
  },

  async uploadPhotos(profileId: string, photoUrls: string[]) {
    return apiService.post(`/api/marriage/profile/${profileId}/photos`, {
      photoUrls,
    });
  },

  async deletePhoto(profileId: string, photoId: string) {
    return apiService.delete(`/api/marriage/profile/${profileId}/photos/${photoId}`);
  },

  // Interest operations
  async sendInterest(receiverProfileId: string, message?: string) {
    return apiService.post('/api/marriage/interest', {
      receiverProfileId,
      message,
    });
  },

  async getReceivedInterests(page = 1, limit = 20) {
    return apiService.get(`/api/marriage/interests/received?page=${page}&limit=${limit}`);
  },

  async getSentInterests(page = 1, limit = 20) {
    return apiService.get(`/api/marriage/interests/sent?page=${page}&limit=${limit}`);
  },

  async respondToInterest(interestId: string, status: 'accepted' | 'rejected') {
    return apiService.put(`/api/marriage/interest/${interestId}`, { status });
  },

  // Horoscope matching
  async getHoroscopeMatch(profileId: string, withProfileId: string) {
    return apiService.get(
      `/api/marriage/profile/${profileId}/horoscope-match?withProfile=${withProfileId}`
    );
  },

  // Reporting
  async reportProfile(profileId: string, reportType: string, details: string) {
    return apiService.post('/api/marriage/report', {
      reportedProfileId: profileId,
      reportType,
      details,
    });
  },

  async getUserReports() {
    return apiService.get('/api/marriage/my-reports');
  },

  // Analytics
  async logProfileView(profileId: string) {
    return apiService.get(`/api/marriage/profile/${profileId}/views`);
  },
};

// Photo utilities
export const photoUtils = {
  // Check if image URL is blurred
  isBlurred(photoData: any): boolean {
    return photoData?.isBlurred === true;
  },

  // Add watermark to image
  addWatermark(imageUrl: string, userId: string): string {
    return imageUrl.includes('?')
      ? `${imageUrl}&watermark=${userId}`
      : `${imageUrl}?watermark=${userId}`;
  },

  // Prevent screenshots (client-side hint)
  preventScreenshot(): void {
    // This would typically be done with platform-specific modules
    // For now, log as a reminder
    console.log('Screenshot prevention should be enabled for this content');
  },

  // Blur image URL
  blurImage(imageUrl: string): string {
    return imageUrl.includes('?')
      ? `${imageUrl}&blur=true`
      : `${imageUrl}?blur=true`;
  },
};

// Privacy utilities
export const privacyUtils = {
  // Check what's visible based on interest status
  getVisibleFields(profile: any, interestStatus?: string): any {
    if (!interestStatus || interestStatus === 'sent') {
      // Limited fields visible
      return {
        ...profile,
        phone: undefined,
        email: undefined,
        address: undefined,
      };
    }

    if (interestStatus === 'accepted') {
      // Full profile visible
      return profile;
    }

    return profile;
  },

  // Check if contact info can be displayed
  canShowContact(interestStatus?: string): boolean {
    return interestStatus === 'accepted';
  },

  // Log viewed content
  logViewedContent(userId: string, contentType: string): void {
    console.log(`Logged viewing of ${contentType} for user ${userId}`);
  },
};

// Horoscope utilities
export const horoscopeUtils = {
  getRatingColor(rating: string): string {
    switch (rating) {
      case 'excellent':
        return '#4CAF50';
      case 'good':
        return '#8BC34A';
      case 'average':
        return '#FFC107';
      case 'poor':
        return '#F44336';
      default:
        return '#999';
    }
  },

  getRatingLabel(percentage: number): string {
    if (percentage >= 85) return 'Excellent';
    if (percentage >= 70) return 'Good';
    if (percentage >= 50) return 'Average';
    return 'Poor';
  },

  getInterpretation(percentage: number): string {
    if (percentage >= 85) {
      return 'Excellent match! Highly compatible for marriage.';
    } else if (percentage >= 70) {
      return 'Good match. Strong compatibility in most aspects.';
    } else if (percentage >= 50) {
      return 'Average match. Some compatible aspects present.';
    } else {
      return 'Consider consulting an astrologer for detailed analysis.';
    }
  },

  // Convert age to zodiac sign
  getZodiacSign(dateOfBirth: string): string {
    const date = new Date(dateOfBirth);
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const signs = [
      { name: 'Capricorn', start: [12, 22], end: [1, 19] },
      { name: 'Aquarius', start: [1, 20], end: [2, 18] },
      { name: 'Pisces', start: [2, 19], end: [3, 20] },
      { name: 'Aries', start: [3, 21], end: [4, 19] },
      { name: 'Taurus', start: [4, 20], end: [5, 20] },
      { name: 'Gemini', start: [5, 21], end: [6, 20] },
      { name: 'Cancer', start: [6, 21], end: [7, 22] },
      { name: 'Leo', start: [7, 23], end: [8, 22] },
      { name: 'Virgo', start: [8, 23], end: [9, 22] },
      { name: 'Libra', start: [9, 23], end: [10, 22] },
      { name: 'Scorpio', start: [10, 23], end: [11, 21] },
      { name: 'Sagittarius', start: [11, 22], end: [12, 21] },
    ];

    for (const sign of signs) {
      const start = sign.start;
      const end = sign.end;
      if (
        (month === start[0] && day >= start[1]) ||
        (month === end[0] && day <= end[1])
      ) {
        return sign.name;
      }
    }

    return 'Unknown';
  },
};

// Validation utilities
export const validationUtils = {
  validatePhone(phone: string): boolean {
    return /^[0-9]{10}$/.test(phone);
  },

  validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  validateAge(dateOfBirth: string): boolean {
    const age = new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
    return age >= 18 && age <= 80;
  },

  validateProfileCompletion(profile: any): number {
    const fields = [
      'name',
      'gender',
      'dateOfBirth',
      'height',
      'weight',
      'education',
      'profession',
      'currentLocation',
      'caste',
      'raasi',
      'natchathiram',
      'expectations',
      'familyDetails',
      'photos',
    ];

    const filledFields = fields.filter((field) => {
      const value = profile[field];
      return value && (Array.isArray(value) ? value.length > 0 : true);
    });

    return Math.round((filledFields.length / fields.length) * 100);
  },
};
