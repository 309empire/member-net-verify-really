import { customAlphabet } from 'nanoid';

// In-memory storage for the verification system
// Adhering to "No databases" rule for the logic part

interface VerificationCode {
  code: string;
  expiresAt: number;
  isUsed: boolean;
  discordId?: string; // If claimed
}

interface GlobalCycle {
  id: string; // Unique ID for current cycle
  expiresAt: number; // Unix timestamp
}

export interface IStorage {
  // Global Cycle Management
  getCurrentCycle(): GlobalCycle;
  refreshCycle(): GlobalCycle;
  
  // Code Management
  generateCode(): VerificationCode;
  verifyCode(code: string, discordId: string): { valid: boolean; reason?: string };
  checkCode(code: string): { status: 'available' | 'used' | 'expired' | 'invalid'; discordId?: string; expiresAt?: number };
}

export class MemStorage implements IStorage {
  private codes: Map<string, VerificationCode>; // code -> VerificationCode
  private currentCycle: GlobalCycle;
  private readonly CYCLE_DURATION = 3 * 60 * 60 * 1000; // 3 hours in ms
  
  // Custom alphabet for codes: Uppercase + Numbers, easy to read
  // Format: XXX-XXX-XXX (handled by generator)
  private alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 1, 0 to avoid confusion
  private nanoid = customAlphabet(this.alphabet, 9); // 9 chars -> we'll split them

  constructor() {
    this.codes = new Map();
    this.currentCycle = {
      id: Date.now().toString(),
      expiresAt: Date.now() + this.CYCLE_DURATION
    };
    
    // Set up auto-refresh
    this.scheduleCycleReset();
  }

  private scheduleCycleReset() {
    const timeUntilReset = this.currentCycle.expiresAt - Date.now();
    setTimeout(() => this.refreshCycle(), Math.max(0, timeUntilReset));
  }

  refreshCycle(): GlobalCycle {
    console.log('[Storage] Refreshing global cycle. All old codes invalid.');
    this.codes.clear(); // "Codes regenerate & old codes become invalid"
    this.currentCycle = {
      id: Date.now().toString(),
      expiresAt: Date.now() + this.CYCLE_DURATION
    };
    this.scheduleCycleReset();
    return this.currentCycle;
  }

  getCurrentCycle(): GlobalCycle {
    // Check if expired just in case
    if (Date.now() >= this.currentCycle.expiresAt) {
      return this.refreshCycle();
    }
    return this.currentCycle;
  }

  generateCode(): VerificationCode {
    this.getCurrentCycle(); // Ensure cycle is valid

    // Generate a unique code
    let raw = this.nanoid();
    // Format: XXX-XXX-XXX
    let formatted = `${raw.slice(0, 3)}-${raw.slice(3, 6)}-${raw.slice(6, 9)}`;
    
    // Ensure uniqueness (extremely unlikely to collide with 9 chars base32, but good practice)
    while (this.codes.has(formatted)) {
      raw = this.nanoid();
      formatted = `${raw.slice(0, 3)}-${raw.slice(3, 6)}-${raw.slice(6, 9)}`;
    }

    const code: VerificationCode = {
      code: formatted,
      expiresAt: this.currentCycle.expiresAt, // Expires when cycle ends
      isUsed: false
    };

    this.codes.set(formatted, code);
    return code;
  }

  verifyCode(code: string, discordId: string): { valid: boolean; reason?: string } {
    this.getCurrentCycle(); // Ensure clean state

    const stored = this.codes.get(code);

    if (!stored) {
      return { valid: false, reason: "Invalid code." };
    }

    if (stored.isUsed) {
      return { valid: false, reason: "Code already used." };
    }

    if (Date.now() > stored.expiresAt) {
      return { valid: false, reason: "Code expired." };
    }

    // Check if user already used ANOTHER code?
    // "cannot use someone else's code" -> handled by code uniqueness and secret
    // "prevent code reuse" -> handled by isUsed
    // "prevent cross-user usage" -> Implicit if we link it now

    // Mark as used
    stored.isUsed = true;
    stored.discordId = discordId;
    this.codes.set(code, stored);

    return { valid: true };
  }

  checkCode(code: string): { status: 'available' | 'used' | 'expired' | 'invalid'; discordId?: string; expiresAt?: number } {
    this.getCurrentCycle();
    const stored = this.codes.get(code);

    if (!stored) {
      return { status: 'invalid' };
    }

    if (stored.isUsed) {
      return { status: 'used', discordId: stored.discordId };
    }

    if (Date.now() > stored.expiresAt) {
      return { status: 'expired', expiresAt: stored.expiresAt };
    }

    return { status: 'available', expiresAt: stored.expiresAt };
  }
}

export const storage = new MemStorage();
